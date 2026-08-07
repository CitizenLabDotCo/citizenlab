# frozen_string_literal: true

module DecidimImporter
  # Decides which Go Vocal ideation `IdeaStatus` each imported proposal lands on, given the per-component
  # Decidim `ProposalState`s (the `*--proposal-states.csv` sidecars). Built once during template creation
  # and queried by {Extractors::ProposalsExtractor} per proposal.
  #
  # Decidim scopes a proposal's status by `(component, state_token)`, and the *same* token carries
  # different citizen-facing labels across components, so this indexes states by that pair. The distinct
  # *used* labels are handed to {StatusMapper}, whose decision is either an existing standard code
  # (resolved later from the tenant's seeded statuses by {IdeaStatuses}) or a new `custom` status — for
  # which this registers an `idea_status` {Record} in the ref map so the deserializer creates it and the
  # proposal can reference it. Unused states are ignored; an unmapped/absent state falls back to the
  # {IdeaStatuses} token heuristic.
  class ProposalStatusResolver
    # Places imported custom statuses after the ~7 seeded ideation statuses (`ordering` isn't uniquely
    # indexed, so this is only for a tidy admin ordering, not correctness).
    CUSTOM_ORDERING_BASE = 1000

    # A per-proposal outcome: exactly one of `idea_status_code` (a standard code) or `idea_status_record`
    # (a custom `idea_status` Record to reference) is set, plus the original Decidim status for provenance.
    Decision = Data.define(:idea_status_code, :idea_status_record, :original_title_multiloc, :token)

    def initialize(state_rows, ref_map, locale_mapper:, primary_locale: 'fr-FR', mapper: StatusMapper.new)
      @state_rows = state_rows || []
      @ref_map = ref_map
      @locale_mapper = locale_mapper
      @primary_locale = primary_locale
      @mapper = mapper
    end

    # Indexes the states, runs the mapping and materialises the custom `idea_status` records. Idempotent
    # per instance; returns self for chaining.
    def build!
      @states_by_component_token = index_states
      result = @mapper.map(distinct_states)
      @custom_records = create_custom_status_records(result.custom_statuses)
      @decisions = result.decisions
      self
    end

    # The {Decision} for a proposal's `(component_uid, state_token)`. Falls back to the {IdeaStatuses}
    # token heuristic when the pair has no known/used state (e.g. a blank token or a state carrying no
    # proposals), so every proposal still gets a status.
    def resolve(component_uid, state_token)
      token = present(state_token)
      state = @states_by_component_token[[component_uid, token]]
      title = state && state[:title_multiloc]
      decision = state && @decisions[state[:key]]

      record = custom_record_for(decision)
      if record
        Decision.new(idea_status_code: nil, idea_status_record: record, original_title_multiloc: title, token: token)
      else
        code = decision&.dig(:code) || IdeaStatuses.code_for_state_token(token)
        Decision.new(idea_status_code: code, idea_status_record: nil, original_title_multiloc: title, token: token)
      end
    end

    # The custom `idea_status` records this resolver added to the ref map (for logging/summaries).
    def custom_status_records
      (@custom_records || {}).values
    end

    private

    def custom_record_for(decision)
      return nil unless decision && decision[:target] == 'custom'

      (@custom_records || {})[decision[:custom_status_id]]
    end

    # `(component_uid, token) => { key:, title_multiloc:, count: }`. The `key` (token + primary label)
    # is the identity the mapper decides on and groups by.
    def index_states
      @state_rows.each_with_object({}) do |row, acc|
        token = present(row['token'])
        component = present(row['decidim_component'])
        next if token.nil? || component.nil?

        title = multiloc(row['title'])
        acc[[component, token]] = { key: state_key(token, title), title_multiloc: title,
                                    count: row['proposals_count'].to_i }
      end
    end

    # The distinct *used* states fed to {StatusMapper}, aggregated across components by their key, most
    # used first. States carrying no proposals are dropped (nothing to migrate).
    def distinct_states
      grouped = {}
      @states_by_component_token.each do |(_component, token), state|
        next unless state[:count].positive?

        group = (grouped[state[:key]] ||= { 'key' => state[:key], 'label' => primary_label(state[:title_multiloc]),
                                            'label_multiloc' => state[:title_multiloc], 'tokens' => [], 'count' => 0 })
        group['tokens'] |= [token]
        group['count'] += state[:count]
      end
      grouped.values.sort_by { |group| -group['count'] }
    end

    # Turns each mapped custom status into an `idea_status` Record registered under a synthetic uid, so
    # the deserializer creates it (before the ideas that reference it — see {TemplateBuilder::MODEL_ORDER}).
    # Returns `{ custom_status_id => Record }`.
    def create_custom_status_records(custom_statuses)
      custom_statuses.each_with_index.with_object({}) do |(custom, index), acc|
        id = custom['id']
        next if acc.key?(id)

        attributes = {
          'title_multiloc' => custom['title_multiloc'],
          'description_multiloc' => custom['description_multiloc'],
          'code' => 'custom',
          'color' => custom['color'],
          'participation_method' => 'ideation',
          'ordering' => CUSTOM_ORDERING_BASE + index
        }
        record = Record.new('idea_status', attributes)
        @ref_map.register("decidim-status-custom-#{id}", record)
        acc[id] = record
      end
    end

    def state_key(token, title_multiloc)
      "#{token}|#{primary_label(title_multiloc)}"
    end

    def primary_label(title_multiloc)
      return '' unless title_multiloc.is_a?(Hash)

      (title_multiloc[@primary_locale] || title_multiloc.values.first).to_s.strip
    end

    # Decidim stores a state title as a JSON multiloc (`{"fr":"…"}`) or plain text; locale codes are
    # mapped onto Go Vocal codes, mirroring {Extractors::BaseExtractor#multiloc}.
    def multiloc(value)
      return {} if value.nil? || value.to_s.strip.empty?

      parsed = Parsing.parse_json(value)
      if parsed.is_a?(Hash)
        parsed.each_with_object({}) do |(locale, text), acc|
          next if text.nil? || text.to_s.strip.empty?

          acc[@locale_mapper.map(locale)] = text.to_s
        end
      else
        { @primary_locale => value.to_s }
      end
    end

    def present(value)
      Parsing.present_value(value)
    end
  end
end
