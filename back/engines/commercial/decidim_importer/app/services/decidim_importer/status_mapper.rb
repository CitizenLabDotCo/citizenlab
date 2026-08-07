# frozen_string_literal: true

module DecidimImporter
  # Maps the distinct Decidim proposal states found in an export onto Go Vocal ideation idea-statuses,
  # via a single LLM call made during template creation.
  #
  # Go Vocal seeds a small fixed set of standard statuses; Decidim lets every proposals component define
  # its own {https://docs.decidim.org ProposalState}s, so a real export carries dozens of one-off labels
  # (hundreds across dozens of components). The model folds each source state onto a {STANDARD_CODES
  # standard code} where the meaning matches and proposes a handful of new `custom` statuses for the
  # genuinely distinct ones (their participatory-budget vocabulary, etc.), keeping the tenant-wide total
  # within {MAX_TOTAL_STATUSES}. {ProposalStatusResolver} turns the result into idea_status records.
  #
  # Best-effort by design: template creation runs *outside any tenant* (no AppConfiguration to select a
  # provider via {LLMSelector}), so the model is instantiated directly from the ENV-based Bedrock
  # credentials. If the model is unavailable or returns something unusable, {#map} falls back to a
  # deterministic token-based mapping (all standard, no custom) — mirroring {IdeaStatuses} — so the
  # import still succeeds and an admin can refine statuses afterwards.
  class StatusMapper
    DEFAULT_MODEL = ::Analysis::LLM::ClaudeSonnet46

    # The ideation statuses the model may map onto without creating a record — the codes a fresh tenant
    # seeds (see `config/tenant_templates/base.yml`), minus the non-public `prescreening`. Anything the
    # model can't fit here becomes a `custom` status.
    STANDARD_CODES = %w[proposed viewed under_consideration accepted rejected implemented].freeze
    DEFAULT_CODE = IdeaStatuses::DEFAULT_CODE

    # Ceiling on the imported custom statuses. Admins manage statuses by hand, so a long list is
    # unwelcome; ~6 customs on top of the 7 seeded standard ones stays around the ~12 the team wants.
    MAX_CUSTOM_STATUSES = 6

    # The parts the model returns and the per-state decisions it implies.
    #   custom_statuses: [{ 'id' =>, 'title_multiloc' =>, 'color' =>, 'description_multiloc' => }, …]
    #   decisions: { state_key => { target: 'standard'|'custom', code:, custom_status_id: } }
    Result = Data.define(:custom_statuses, :decisions)

    def initialize(llm: nil)
      @llm = llm
    end

    # @param states [Array<Hash>] the distinct *used* states, each
    #   `{ 'key' =>, 'label' =>, 'label_multiloc' =>, 'tokens' => [..], 'count' => Integer }`.
    # @return [Result]
    def map(states)
      return Result.new(custom_statuses: [], decisions: {}) if states.blank?

      # No `response_schema`: the multiloc fields are open string maps, which the providers' strict
      # structured-output mode rejects (it requires `additionalProperties: false` on every object). The
      # prompt fully specifies the JSON shape instead, and {#parse_response} extracts it from the reply.
      parsed = parse_response(llm.chat(build_prompt(states)))
      coerce(parsed, states)
    rescue StandardError => e
      # Keep the import working if the model/credentials are down (the common case for a local dump run):
      # fall back to the token heuristic so every proposal still lands on a sensible standard status.
      ErrorReporter.report(e)
      heuristic(states)
    end

    # The deterministic fallback: every state maps to a standard code by its Decidim token, no customs.
    def heuristic(states)
      decisions = states.each_with_object({}) do |state, acc|
        token = Array(state['tokens']).first
        acc[state['key']] = { target: 'standard', code: IdeaStatuses.code_for_state_token(token) }
      end
      Result.new(custom_statuses: [], decisions: decisions)
    end

    private

    def llm
      @llm ||= DEFAULT_MODEL.new
    end

    # Extracts the JSON object from the model's reply, tolerating a schema-aware model that already
    # returns a Hash, and a text model that wraps the JSON in ```json fences or a sentence of prose (we
    # take the outermost `{ … }`). Raises when there's no object, so {#map} falls back to the heuristic.
    def parse_response(response)
      return response if response.is_a?(Hash)

      text = response.to_s
      first = text.index('{')
      last = text.rindex('}')
      raise JSON::ParserError, 'no JSON object in LLM response' if first.nil? || last.nil? || last < first

      JSON.parse(text[first..last])
    end

    # Normalises the model's raw JSON into a trustworthy {Result}: caps the custom statuses, drops
    # malformed ones, and forces every decision onto either a known standard code or a surviving custom
    # id (falling back to `proposed`) — so a partial/oversized answer can't break the import.
    def coerce(parsed, states)
      customs = Array(parsed['custom_statuses']).filter_map { |custom| sanitize_custom(custom) }
        .uniq { |custom| custom['id'] }.first(MAX_CUSTOM_STATUSES)
      custom_ids = customs.to_set { |custom| custom['id'] }

      mappings = index_mappings(Array(parsed['mappings']), custom_ids)
      # Any state the model didn't map (or mapped to a dropped custom) falls back to the token heuristic.
      heuristic_decisions = heuristic(states).decisions
      decisions = states.each_with_object({}) do |state, acc|
        acc[state['key']] = mappings[state['key']] || heuristic_decisions[state['key']]
      end
      Result.new(custom_statuses: customs, decisions: decisions)
    end

    def index_mappings(mappings, custom_ids)
      mappings.each_with_object({}) do |mapping, acc|
        key = mapping['key']
        next if key.blank?

        acc[key] =
          if mapping['target'] == 'custom' && custom_ids.include?(mapping['custom_status_id'])
            { target: 'custom', custom_status_id: mapping['custom_status_id'] }
          else
            code = mapping['code']
            { target: 'standard', code: STANDARD_CODES.include?(code) ? code : DEFAULT_CODE }
          end
      end
    end

    # Keeps a custom-status object only if it has an id and a non-empty title; fills a missing
    # description from the title (IdeaStatus requires both) and a missing/invalid colour with a default.
    def sanitize_custom(custom)
      return nil unless custom.is_a?(Hash)

      id = custom['id'].presence
      title = presence_multiloc(custom['title_multiloc'])
      return nil if id.nil? || title.nil?

      description = presence_multiloc(custom['description_multiloc']) || title
      { 'id' => id.to_s, 'title_multiloc' => title, 'description_multiloc' => description,
        'color' => hex_color(custom['color']) }
    end

    def presence_multiloc(value)
      return nil unless value.is_a?(Hash)

      cleaned = value.filter_map { |locale, text| [locale.to_s, text.to_s] if text.to_s.strip.present? }.to_h
      cleaned.presence
    end

    DEFAULT_COLOR = '#767676'

    def hex_color(value)
      value.to_s.match?(/\A#[0-9a-fA-F]{6}\z/) ? value : DEFAULT_COLOR
    end

    def build_prompt(states)
      <<~PROMPT
        You map legacy Decidim proposal statuses onto Go Vocal "idea statuses" for a data migration.

        ## Target platform (Go Vocal) — fixed standard ideation statuses
        - proposed              — submitted, not yet reviewed (the default landing status)
        - viewed                — acknowledged by an admin, no decision yet
        - under_consideration   — actively being evaluated
        - accepted              — approved / will move forward
        - rejected              — declined / will not move forward
        - implemented           — completed and delivered
        You MAY also define new custom statuses when no standard status fits the source label's meaning.
        Custom statuses have a free multiloc title and a hex colour.

        ## Rules
        1. Map EVERY input status to exactly one target: either an existing standard `code`, or a custom
           status you define.
        2. Strongly prefer a standard code when the meaning clearly matches. Merge synonyms and
           near-duplicates (e.g. several "awaiting response" labels) onto the same target.
        3. Only create a custom status when the source meaning is genuinely distinct AND it is applied to
           a non-trivial number of proposals. Ignore obvious test data.
        4. HARD CAP: define at most #{MAX_CUSTOM_STATUSES} custom statuses. Prefer fewer.
        5. Preserve the source language of the label in the custom title multiloc. Assign each custom
           status a distinct, sensible hex colour (format "#RRGGBB").
        6. Output STRICT JSON only, matching the schema. No prose, no markdown.

        ## Input — Decidim statuses actually applied to proposals
        Each item: a citizen-facing label (multiloc), the Decidim token(s) it was stored under, and how
        many proposals currently carry it.
        ```json
        #{JSON.pretty_generate(states.map { |s| s.slice('key', 'label_multiloc', 'tokens', 'count') })}
        ```

        ## Output schema
        {
          "custom_statuses": [
            { "id": "<slug you invent>", "title_multiloc": {"fr": "…"}, "color": "#RRGGBB",
              "description_multiloc": {"fr": "…"} }
          ],
          "mappings": [
            { "key": "<input key, verbatim>", "target": "standard" | "custom",
              "code": "<standard code, when target=standard>",
              "custom_status_id": "<id from custom_statuses, when target=custom>" }
          ]
        }
      PROMPT
    end
  end
end
