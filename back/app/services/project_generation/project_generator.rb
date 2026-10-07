# frozen_string_literal: true

module ProjectGeneration
  # Asks an LLM to draft a whole participation project from the manager's brief, the four
  # levers and optional source files, then writes the draft into the (already created)
  # project by orchestrating the MCP tools, in this order:
  #
  #   create_phase(s) -> update_project_layout -> replace_form_fields (per survey phase)
  #   -> create_event(s) -> update_project (visibility + preview) -> update_phase_permission (access)
  #
  # The phases, page content and survey are the core draft: a failure there fails the
  # generation. Events, visibility and access are best-effort: a tool error is reported
  # but still leaves the manager a usable draft to review.
  class ProjectGenerator
    class InvalidOutputError < StandardError; end

    # Non-fatal tool errors (events/visibility/access) collected alongside the outcome.
    GenerationResult = Data.define(:errors, :failed) do
      def failed? = failed
    end

    PDF_EXTENSIONS = %w[.pdf].freeze
    TEXT_EXTENSIONS = %w[.md .txt].freeze
    FILE_EXTENSIONS = [*PDF_EXTENSIONS, *TEXT_EXTENSIONS].freeze

    # The archetype vocabulary and method recipes are a port of the govocal-project-setup
    # skill; see the prompt template's version marker.
    ARCHETYPES = %w[inform consult gather_input prioritize co_create].freeze
    # Participation methods the generator can create. native_survey carries a survey;
    # voting carries a voting config (see VOTING_SCHEMA); common_ground needs the
    # 'common_ground' feature flag on the tenant. For voting and common_ground the draft
    # sets the phase + config only — the voting options and the agree/disagree statements
    # are ideas/statements an admin adds after the upstream phase, so none are created here.
    PARTICIPATION_METHODS = %w[information ideation proposals native_survey voting common_ground].freeze
    # Mirror Phase::VOTING_METHODS / Phase::VOTE_TERMS (inlined to avoid load-order coupling).
    VOTING_METHODS = %w[single_voting multiple_voting budgeting].freeze
    VOTE_TERMS = %w[vote point token credit percent].freeze
    DEFAULT_VOTING_METHOD = 'single_voting'
    DEFAULT_VOTE_TERM = 'vote'
    # Fallback per-voter allowance when the model omits one but the method requires it
    # (create_phase requires voting_max_total for multiple_voting and budgeting).
    DEFAULT_VOTING_MAX_TOTAL = { 'multiple_voting' => 7, 'budgeting' => 1000 }.freeze
    VISIBILITIES = %w[public groups admins].freeze
    # Input-list views for ideation / proposals / voting (mirrors Phase::PRESENTATION_MODES).
    PRESENTATION_MODES = %w[card map feed].freeze

    QUESTION_TYPES = %w[
      text multiline_text number select multiselect ranking
      linear_scale rating matrix_linear_scale sentiment_linear_scale
    ].freeze
    OPTION_TYPES = %w[select multiselect ranking].freeze
    # Nominal choice types: randomising, dropdown layout and an "Other" option
    # apply here (ranking is ordinal, so none of those do).
    NOMINAL_OPTION_TYPES = %w[select multiselect].freeze
    LABELED_SCALE_TYPES = %w[linear_scale matrix_linear_scale sentiment_linear_scale].freeze
    SCALE_TYPES = [*LABELED_SCALE_TYPES, 'rating'].freeze
    SENTIMENT_SCALE_MAXIMUM = 5

    MAX_PHASES = 5
    MAX_EVENTS = 3
    MAX_QUESTIONS = 20
    PHASE_DURATION_DAYS = (3..120)
    EVENT_DURATION_MINUTES = (15..480)
    EVENT_DAY_OFFSET = (0..365)

    # audience lever index -> who can take the phase's main action.
    PERMITTED_BY_BY_INDEX = %w[everyone users admins_moderators].freeze
    # The participation action whose permission the access step sets, per method.
    PRIMARY_ACTION = {
      'ideation' => 'posting_idea',
      'proposals' => 'posting_idea',
      'native_survey' => 'posting_idea',
      'voting' => 'voting',
      'common_ground' => 'reacting_idea'
    }.freeze

    # Claude's structured output only accepts closed objects (additionalProperties: false)
    # with no numeric bounds, so all counts and ranges are enforced in Ruby (the #clean_*
    # methods below), not in the schema.
    QUESTION_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[input_type title description required options allow_other random_option_ordering dropdown_layout min_select max_select statements scale_maximum scale_labels],
      properties: {
        input_type: { type: 'string', enum: QUESTION_TYPES },
        title: { type: 'string' },
        description: { type: 'string', description: 'Optional help text. Empty string if none.' },
        required: { type: 'boolean' },
        options: { type: 'array', items: { type: 'string' } },
        allow_other: { type: 'boolean', description: 'select / multiselect only: add an "Other" free-text option (kept last). Use when the listed options may not be exhaustive. false otherwise.' },
        random_option_ordering: { type: 'boolean', description: 'select / multiselect only: randomise option order to remove primacy bias. Default true for nominal options; false for options with a meaningful order (ordinal, sequential, long alphabetical). false for other types.' },
        dropdown_layout: { type: 'boolean', description: 'select / multiselect only: render as a dropdown rather than radio buttons / checkboxes. Use for long option lists (roughly 8+). false otherwise.' },
        min_select: { type: 'integer', description: 'multiselect only: minimum number of options a resident must pick. 0 for no minimum.' },
        max_select: { type: 'integer', description: 'multiselect only: maximum number of options a resident may pick (e.g. "pick your top 3" -> 3). 0 for no limit.' },
        statements: { type: 'array', items: { type: 'string' } },
        scale_maximum: { type: 'integer' },
        scale_labels: { type: 'array', items: { type: 'string' } }
      }
    }.freeze

    SURVEY_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[title questions],
      properties: {
        title: { type: 'string', description: 'Short survey title. Empty string if the phase is not a survey.' },
        questions: { type: 'array', items: QUESTION_SCHEMA }
      }
    }.freeze

    VOTING_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[voting_method voting_min_total voting_max_total voting_max_votes_per_idea vote_term],
      properties: {
        voting_method: { type: 'string', enum: VOTING_METHODS, description: 'single_voting (approval), multiple_voting (strength of preference) or budgeting (costed options + a fixed pot).' },
        voting_min_total: { type: 'integer', description: 'Minimum a voter must cast; 0 for none.' },
        voting_max_total: { type: 'integer', description: "Votes/tokens per voter, or the total budget for budgeting. 0 to use the platform default." },
        voting_max_votes_per_idea: { type: 'integer', description: 'Max votes on a single option; only for multiple_voting, 0 otherwise.' },
        vote_term: { type: 'string', enum: VOTE_TERMS, description: 'Noun for a vote.' }
      }
    }.freeze

    PHASE_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[title description participation_method duration_days presentation_mode proposals_reacting_threshold proposals_expire_days collect_demographics survey voting],
      properties: {
        title: { type: 'string' },
        description: { type: 'string', description: 'One or two sentences, plain text.' },
        participation_method: { type: 'string', enum: PARTICIPATION_METHODS },
        duration_days: { type: 'integer', description: 'Length of the phase in days.' },
        presentation_mode: { type: 'string', enum: [*PRESENTATION_MODES, ''], description: 'ideation / proposals / voting only: how residents see the list of inputs. "map" for place-based input tied to locations; "feed" for a discussion feel (ideation only); "card" (the default) otherwise. Empty string for other methods.' },
        proposals_reacting_threshold: { type: 'integer', description: 'proposals only: likes a proposal needs to reach to be considered. 0 to use the platform default.' },
        proposals_expire_days: { type: 'integer', description: 'proposals only: days a proposal has to reach the threshold before it expires. 0 to use the platform default.' },
        collect_demographics: { type: 'boolean', description: "true to attach the platform's demographic profile questions as an optional final page (good for a representative survey with a broad reach). false otherwise. Ignored when anyone can take part without an account." },
        survey: { **SURVEY_SCHEMA, description: 'Only used when participation_method is native_survey; otherwise leave title empty and questions empty.' },
        voting: { **VOTING_SCHEMA, description: 'Only used when participation_method is voting; otherwise fill with single_voting, vote and zeros.' }
      }
    }.freeze

    EVENT_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[title description location day_offset duration_minutes online],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        location: { type: 'string', description: 'Venue or address. Empty string for online-only events.' },
        day_offset: { type: 'integer', description: 'Days after the project start the event takes place.' },
        duration_minutes: { type: 'integer' },
        online: { type: 'boolean', description: 'Whether the event is online.' }
      }
    }.freeze

    RUBRIC_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[clear_ask right_method realistic_scope closes_the_loop justification],
      properties: {
        clear_ask: { type: 'integer', description: 'Score 1-5 for how clear the ask to residents is.' },
        right_method: { type: 'integer', description: 'Score 1-5 for method fit.' },
        realistic_scope: { type: 'integer', description: 'Score 1-5 for realistic scope and timing.' },
        closes_the_loop: { type: 'integer', description: 'Score 1-5 for whether the plan closes the loop back to residents.' },
        justification: { type: 'string' }
      }
    }.freeze

    RESPONSE_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[archetype archetype_rationale title description_preview page_blocks phases events visibility audience_index verification_required rubric],
      properties: {
        archetype: { type: 'string', enum: ARCHETYPES },
        archetype_rationale: { type: 'string' },
        title: { type: 'string', description: 'Project title.' },
        description_preview: { type: 'string', description: 'Plain-text summary for search and previews.' },
        page_blocks: {
          type: 'array',
          description: 'Ordered content blocks for the project page body.',
          items: {
            type: 'object',
            additionalProperties: false,
            required: %w[heading body],
            properties: {
              heading: { type: 'string', description: 'Section heading. Empty string for an intro paragraph.' },
              body: { type: 'string', description: 'Plain text; blank lines separate paragraphs.' }
            }
          }
        },
        phases: { type: 'array', items: PHASE_SCHEMA },
        events: { type: 'array', items: EVENT_SCHEMA },
        visibility: { type: 'string', enum: VISIBILITIES },
        audience_index: { type: 'integer', description: 'Who should take part: 0 anyone, 1 registered users, 2 admins only.' },
        verification_required: { type: 'boolean', description: 'true to require identity verification to take part (one-person-one-vote: statutory consultations, binding votes). Only takes effect with audience_index 1. false otherwise.' },
        rubric: RUBRIC_SCHEMA
      }
    }.freeze

    def initialize(project, user, locale)
      @project = project
      @user = user
      @locale = locale
    end

    # @param prompt [String, nil] the manager's brief
    # @param files [Array<Files::File>] PDF, Markdown or plain text source documents
    # @param levers [Hash] the four lever indices (0..2)
    # @return [GenerationResult]
    def generate_and_persist(prompt:, files: [], levers: {})
      plan = request_plan(prompt, files, levers)
      persist(plan)
    end

    private

    def request_plan(prompt, files, levers)
      response = llm.chat(message(prompt, files, levers), response_schema: RESPONSE_SCHEMA)
      raise InvalidOutputError, 'The LLM response is not a JSON object.' unless response.is_a?(Hash)

      plan = response.deep_stringify_keys
      plan['title'] = plan['title'].to_s.strip
      raise InvalidOutputError, 'The LLM response has no project title.' if plan['title'].blank?

      plan['phases'] = clean_phases(plan['phases'])
      raise InvalidOutputError, 'The LLM response has no usable phase.' if plan['phases'].empty?

      plan
    end

    def message(prompt, files, levers)
      files.each do |file|
        raise ArgumentError, "File #{file.id} is not allowed to be processed by AI." unless file.ai_processing_allowed
      end

      pdf_files, text_files = files.partition { |file| extension(file).in?(PDF_EXTENSIONS) }
      raise ArgumentError, 'Unsupported file type.' unless text_files.all? { |file| extension(file).in?(TEXT_EXTENSIONS) }

      text = ::Analysis::LLM::Prompt.new.fetch(
        'project_generation',
        locale: @locale,
        instructions: prompt,
        levers: clean_levers(levers),
        source_texts: text_files.map { |file| file.content.read.force_encoding('UTF-8').scrub }
      )

      ::Analysis::LLM::Message.new(text, *pdf_files)
    end

    # ---- persistence ------------------------------------------------------------------

    def persist(plan)
      errors = []

      # Re-generation fully replaces the project: now that we have a valid new
      # plan, clear the previously generated phases (and their surveys/voting)
      # and events. The page layout is overwritten by update_layout below, so
      # it is left in place for the update_project_layout tool to patch.
      reset_generated_content!

      phases = create_phases(plan['phases'], errors)
      return GenerationResult.new(errors: errors, failed: true) if phases.empty?

      update_layout(plan['page_blocks'], errors)
      replace_survey_fields(phases, errors)
      core_failed = errors.any?

      create_events(plan['events'], errors)
      update_project_settings(plan, errors)
      update_access(phases, plan['audience_index'], plan['verification_required'], errors)

      GenerationResult.new(errors: errors, failed: core_failed)
    end

    # On a re-generation, wipe what a previous run created so the new plan is a
    # clean replacement rather than a second set of phases stacked on the first.
    def reset_generated_content!
      @project.phases.destroy_all
      @project.events.destroy_all
    end

    # Creates the phases in sequence, back to back from today. Returns the created phases
    # paired with the plan entry that produced them.
    def create_phases(phase_plans, errors)
      start = Time.zone.today
      created = []

      phase_plans.each do |phase_plan|
        duration = phase_plan['duration_days']
        finish = start + (duration - 1).days
        response = call_tool(McpServer::Tools::CreatePhase, create_phase_args(phase_plan, start, finish))

        if response.error?
          errors << "create_phase: #{response.content.to_json}"
          break # a gap in the timeline is worse than a shorter one; stop here
        end

        created << { plan: phase_plan, id: phase_id(response) }
        start = finish + 1.day
      end

      created
    end

    def create_phase_args(phase_plan, start, finish)
      method = phase_plan['participation_method']
      args = {
        project_id: @project.id,
        title_multiloc: multiloc(phase_plan['title']),
        description_multiloc: html_multiloc(phase_plan['description']),
        start_at: start.iso8601,
        end_at: finish.iso8601,
        participation_method: method
      }

      if method == 'native_survey'
        survey_title = phase_plan.dig('survey', 'title').presence || phase_plan['title']
        args[:native_survey_title_multiloc] = multiloc(survey_title)
        args[:native_survey_button_multiloc] = multiloc(I18n.t('project_generation.take_the_survey', locale: @locale, default: 'Take the survey'))
      end

      args.merge!(voting_args(phase_plan['voting'])) if method == 'voting'

      # Input-list view (card / map / feed) for the methods that show a list of
      # inputs. 'feed' is ideation-only, so fall back to 'card' elsewhere.
      if %w[ideation proposals voting].include?(method)
        mode = phase_plan['presentation_mode']
        mode = 'card' if mode == 'feed' && method != 'ideation'
        args[:presentation_mode] = mode if PRESENTATION_MODES.include?(mode)
      end

      # Proposals thresholds: only override the platform defaults when the model
      # gave a positive value.
      if method == 'proposals'
        threshold = phase_plan['proposals_reacting_threshold'].to_i
        expire = phase_plan['proposals_expire_days'].to_i
        args[:reacting_threshold] = threshold if threshold.positive?
        args[:expire_days_limit] = expire if expire.positive?
      end

      args
    end

    # Builds the voting fields create_phase needs. The options (ideas) are added by an
    # admin after the upstream phase, so only the method and per-voter allowance are set
    # here. Falls back to approval voting with safe allowances when the model is vague.
    def voting_args(config)
      config = config.is_a?(Hash) ? config : {}
      method = VOTING_METHODS.include?(config['voting_method']) ? config['voting_method'] : DEFAULT_VOTING_METHOD
      term = VOTE_TERMS.include?(config['vote_term']) ? config['vote_term'] : DEFAULT_VOTE_TERM
      args = { voting_method: method, vote_term: term }

      min_total = config['voting_min_total'].to_i
      max_total = config['voting_max_total'].to_i
      args[:voting_min_total] = min_total if min_total.positive?

      if DEFAULT_VOTING_MAX_TOTAL.key?(method) # required for multiple_voting / budgeting
        args[:voting_max_total] = max_total.positive? ? max_total : DEFAULT_VOTING_MAX_TOTAL[method]
      elsif max_total.positive?
        args[:voting_max_total] = max_total
      end

      if method == 'multiple_voting'
        per_idea = config['voting_max_votes_per_idea'].to_i
        args[:voting_max_votes_per_idea] = per_idea if per_idea.positive?
      end

      args
    end

    def update_layout(page_blocks, errors)
      blocks = Array(page_blocks).filter_map { |block| clean_block(block) }
      return if blocks.empty?

      layout = ContentBuilder::Layout.find_by(
        content_buildable: @project,
        code: ContentBuilder::ProjectPageLayoutService::CODE
      )
      return errors << 'update_project_layout: the project has no page layout' if layout.nil?

      stored = layout.craftjs_json || {}
      body_id = stored.keys.find { |id| resolved_name(stored[id]) == 'ProjectPageBody' }
      return errors << 'update_project_layout: the layout has no ProjectPageBody node' if body_id.nil?

      body = stored[body_id]
      # Keep the phases and events widgets that live in the body; replace the rest with
      # the generated text. (Deleting a node removes its subtree automatically.)
      kept = Array(body['nodes']).select { |id| %w[PhasesWidget EventsList].include?(resolved_name(stored[id])) }
      removable = Array(body['nodes']) - kept

      new_nodes = {}
      new_ids = blocks.map do |block|
        id = SecureRandom.alphanumeric(10)
        new_nodes[id] = text_node(block, body_id)
        id
      end

      patch_nodes = new_nodes.merge(body_id => body.merge('nodes' => [*new_ids, *kept]))
      args = { project_id: @project.id, nodes: patch_nodes, delete_node_ids: removable }
      response = call_tool(McpServer::Tools::UpdateProjectLayout, args)
      errors << "update_project_layout: #{response.content.to_json}" if response.error?
    end

    def replace_survey_fields(phases, errors)
      phases.each do |phase|
        next unless phase[:plan]['participation_method'] == 'native_survey'

        fields = survey_fields(phase[:plan]['survey'])
        next if fields.nil? # no usable questions -> leave the empty survey for the manager

        args = { container_type: 'phase', container_id: phase[:id], fields: fields }
        response = call_tool(McpServer::Tools::ReplaceFormFields, args)
        errors << "replace_form_fields: #{response.content.to_json}" if response.error?
      end
    end

    def create_events(event_plans, errors)
      Array(event_plans).first(MAX_EVENTS).each do |event_plan|
        response = call_tool(McpServer::Tools::CreateEvent, create_event_args(event_plan))
        errors << "create_event: #{response.content.to_json}" if response.error?
      end
    end

    def create_event_args(event_plan)
      day_offset = event_plan['day_offset'].to_i.clamp(EVENT_DAY_OFFSET)
      duration = event_plan['duration_minutes'].to_i.clamp(EVENT_DURATION_MINUTES)
      start = Time.zone.today.in_time_zone.change(hour: 18) + day_offset.days

      args = {
        project_id: @project.id,
        title_multiloc: multiloc(event_plan['title']),
        description_multiloc: html_multiloc(event_plan['description']),
        start_at: start.iso8601,
        end_at: (start + duration.minutes).iso8601
      }
      location = event_plan['location'].to_s.strip
      args[:location_multiloc] = multiloc(location) if location.present?
      args
    end

    # One update_project call for the project-level settings. Only 'public' and 'admins'
    # visibility are applied — 'groups' needs group ids we can't infer. The preview is
    # filled only when it is still blank, so a summary the manager wrote is never lost.
    def update_project_settings(plan, errors)
      args = { project_id: @project.id }
      args[:visible_to] = plan['visibility'] if %w[public admins].include?(plan['visibility'])

      preview = plan['description_preview'].to_s.strip
      current_preview = (@project.description_preview_multiloc || {})[@locale]
      args[:description_preview_multiloc] = { @locale => preview } if preview.present? && current_preview.to_s.strip.blank?

      return if args.keys == [:project_id] # nothing to change

      response = call_tool(McpServer::Tools::UpdateProject, args)
      errors << "update_project: #{response.content.to_json}" if response.error?
    end

    def update_access(phases, audience_index, verification_required, errors)
      permitted_by = PERMITTED_BY_BY_INDEX[audience_index.to_i.clamp(0, 2)]
      # Identity verification (one-person-one-vote) only applies to signed-in users.
      require_verification = verification_required == true && permitted_by == 'users'

      phases.each do |phase|
        action = PRIMARY_ACTION[phase[:plan]['participation_method']]
        next if action.nil?

        # Demographics only apply when there is an account to read them from —
        # not when anyone can take part anonymously. Passing null attaches the
        # platform's configured profile questions as an optional final page.
        wants_demographics = phase[:plan]['collect_demographics'] == true && permitted_by != 'everyone'

        # Nothing to change for the default audience unless we're adding
        # demographics or requiring verification.
        next if permitted_by == 'users' && !wants_demographics && !require_verification

        args = { phase_id: phase[:id], action: action, permitted_by: permitted_by }
        args[:demographic_questions] = nil if wants_demographics
        args[:require_verification] = true if require_verification
        response = call_tool(McpServer::Tools::UpdatePhasePermission, args)
        errors << "update_phase_permission: #{response.content.to_json}" if response.error?
      end
    end

    # ---- cleaning / clamping ----------------------------------------------------------

    def clean_levers(levers)
      %i[influence how_fixed reach format audience].index_with do |key|
        (levers[key] || levers[key.to_s]).to_i.clamp(0, 2)
      end
    end

    def clean_phases(phases)
      Array(phases).first(MAX_PHASES).filter_map do |phase|
        title = phase['title'].to_s.strip
        next if title.blank? || PARTICIPATION_METHODS.exclude?(phase['participation_method'])

        phase.merge(
          'title' => title,
          'duration_days' => phase['duration_days'].to_i.clamp(PHASE_DURATION_DAYS)
        )
      end
    end

    def clean_block(block)
      heading = block['heading'].to_s.strip
      body = block['body'].to_s.strip
      return if heading.blank? && body.blank?

      { 'heading' => heading, 'body' => body }
    end

    # Returns the complete ordered field list for replace_form_fields, or nil when there
    # is no usable question.
    def survey_fields(survey)
      questions = Array(survey && survey['questions']).filter_map { |question| clean_question(question) }
      return if questions.empty?

      title = (survey['title'].presence || I18n.t('project_generation.survey', locale: @locale, default: 'Survey'))
      [survey_page(title), *questions.first(MAX_QUESTIONS).map { |question| question_field(question) }, end_page]
    end

    def clean_question(question)
      input_type = question['input_type']
      title = question['title'].to_s.strip
      options = clean_strings(question['options'])
      statements = clean_strings(question['statements'])

      return if QUESTION_TYPES.exclude?(input_type) || title.blank?
      return if OPTION_TYPES.include?(input_type) && options.size < 2
      return if input_type == 'matrix_linear_scale' && statements.empty?

      question.merge('title' => title, 'options' => options, 'statements' => statements)
    end

    def clean_strings(values)
      Array(values).map { |value| value.to_s.strip }.compact_blank
    end

    # ---- field builders (replace_form_fields) -----------------------------------------

    def survey_page(title)
      { input_type: 'page', page_layout: 'default', title_multiloc: multiloc(title), description_multiloc: {} }
    end

    def question_field(question)
      input_type = question['input_type']
      field = {
        input_type: input_type,
        title_multiloc: multiloc(question['title']),
        description_multiloc: html_multiloc(question['description']),
        required: question['required'] == true
      }

      if OPTION_TYPES.include?(input_type)
        field[:options] = question['options'].map { |option| { title_multiloc: multiloc(option) } }
      end

      # Nominal choice questions carry the survey-design levers: an optional
      # "Other" (pinned last by the platform), randomised order to cut primacy
      # bias, and a dropdown layout for long lists.
      if NOMINAL_OPTION_TYPES.include?(input_type)
        if question['allow_other'] == true
          other_label = I18n.t('project_generation.other_option', locale: @locale, default: 'Other')
          field[:options] << { title_multiloc: multiloc(other_label), other: true }
        end
        field[:random_option_ordering] = question['random_option_ordering'] == true
        field[:dropdown_layout] = question['dropdown_layout'] == true
      end

      # "Pick up to N" limits — only multiselect supports a select count.
      if input_type == 'multiselect'
        max_select = question['max_select'].to_i
        min_select = question['min_select'].to_i
        if max_select.positive?
          field[:select_count_enabled] = true
          field[:maximum_select_count] = max_select
          field[:minimum_select_count] = min_select if min_select.positive?
        end
      end

      if input_type == 'matrix_linear_scale'
        field[:matrix_statements] = question['statements'].map { |statement| { title_multiloc: multiloc(statement) } }
      end

      field.merge!(scale_attributes(question)) if SCALE_TYPES.include?(input_type)
      field
    end

    def scale_attributes(question)
      maximum = if question['input_type'] == 'sentiment_linear_scale'
        SENTIMENT_SCALE_MAXIMUM
      else
        question['scale_maximum'].to_i.clamp(CustomField::LINEAR_SCALE_MAX_RANGE)
      end

      attributes = { maximum: maximum }
      return attributes unless LABELED_SCALE_TYPES.include?(question['input_type'])

      Array(question['scale_labels']).first(maximum).each_with_index do |label, index|
        attributes[:"linear_scale_label_#{index + 1}_multiloc"] = multiloc(label)
      end

      attributes
    end

    def end_page
      {
        input_type: 'page',
        key: 'form_end',
        page_layout: 'default',
        title_multiloc: multiloc(I18n.t('project_generation.survey_end_title', locale: @locale, default: 'Thank you')),
        include_in_printed_form: false
      }
    end

    # ---- craftjs node builder ---------------------------------------------------------

    def text_node(block, parent_id)
      {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { @locale => block_html(block) } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => parent_id,
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      }
    end

    def block_html(block)
      html = +''
      html << "<h2>#{ERB::Util.html_escape(block['heading'])}</h2>" if block['heading'].present?
      block['body'].to_s.split(/\n{2,}/).each do |paragraph|
        paragraph = paragraph.strip
        html << "<p>#{ERB::Util.html_escape(paragraph)}</p>" if paragraph.present?
      end
      html
    end

    # ---- shared helpers ---------------------------------------------------------------

    def call_tool(tool_class, arguments)
      tool = tool_class.for(current_user: @user, token_scopes: [])
      # Direct calls skip the argument validation the MCP server does.
      tool.input_schema.validate_arguments(arguments)
      tool.call(server_context: {}, **arguments)
    end

    def phase_id(response)
      response.structured_content[:id]
    end

    def resolved_name(node)
      ContentBuilder::Craftjs::Query.resolved_name(node || {})
    end

    def multiloc(text)
      text.to_s.strip.present? ? { @locale => text.to_s.strip } : {}
    end

    def html_multiloc(text)
      text.to_s.strip.present? ? { @locale => "<p>#{ERB::Util.html_escape(text.to_s.strip)}</p>" } : {}
    end

    def extension(file)
      ::File.extname(file.name).downcase
    end

    def llm
      @llm ||= LLMSelector.new.llm_class_for_use_case('project_generation').new
    end
  end
end
