# frozen_string_literal: true

module ProjectGeneration
  # Asks an LLM to draft a whole participation project from the manager's brief, the four
  # levers and optional source files, then writes the draft into the (already created)
  # project by orchestrating the MCP tools, in this order:
  #
  #   create_phase(s) -> update_project_layout -> replace_form_fields (per survey phase)
  #   -> create_event(s) -> update_project (visibility) -> update_phase_permission (access)
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
    # skill; see the prompt template's version marker. TODO: reconcile the enum values and
    # recipes with the authoritative skill text when it is synced.
    ARCHETYPES = %w[inform consult gather_input prioritize co_create].freeze
    # Methods whose create_phase call needs no extra required fields beyond a survey's
    # title/button. Voting, common_ground, poll and volunteering are follow-ups: they
    # need method-specific required fields the schema does not cover yet.
    PARTICIPATION_METHODS = %w[information ideation proposals native_survey].freeze
    VISIBILITIES = %w[public groups admins].freeze

    QUESTION_TYPES = %w[
      text multiline_text number select multiselect ranking
      linear_scale rating matrix_linear_scale sentiment_linear_scale
    ].freeze
    OPTION_TYPES = %w[select multiselect ranking].freeze
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
      'native_survey' => 'posting_idea'
    }.freeze

    # Claude's structured output only accepts closed objects (additionalProperties: false)
    # with no numeric bounds, so all counts and ranges are enforced in Ruby (the #clean_*
    # methods below), not in the schema.
    QUESTION_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[input_type title description required options statements scale_maximum scale_labels],
      properties: {
        input_type: { type: 'string', enum: QUESTION_TYPES },
        title: { type: 'string' },
        description: { type: 'string', description: 'Optional help text. Empty string if none.' },
        required: { type: 'boolean' },
        options: { type: 'array', items: { type: 'string' } },
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

    PHASE_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[title description participation_method duration_days survey],
      properties: {
        title: { type: 'string' },
        description: { type: 'string', description: 'One or two sentences, plain text.' },
        participation_method: { type: 'string', enum: PARTICIPATION_METHODS },
        duration_days: { type: 'integer', description: 'Length of the phase in days.' },
        survey: { **SURVEY_SCHEMA, description: 'Only used when participation_method is native_survey; otherwise leave title empty and questions empty.' }
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
      required: %w[archetype archetype_rationale title description_preview page_blocks phases events visibility audience_index rubric],
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

      phases = create_phases(plan['phases'], errors)
      return GenerationResult.new(errors: errors, failed: true) if phases.empty?

      update_layout(plan['page_blocks'], errors)
      replace_survey_fields(phases, errors)
      core_failed = errors.any?

      create_events(plan['events'], errors)
      update_visibility(plan['visibility'], errors)
      update_access(phases, plan['audience_index'], errors)

      GenerationResult.new(errors: errors, failed: core_failed)
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

    # Visibility: only 'public' and 'admins' are applied. 'groups' needs group ids we
    # cannot infer here, so it is left at the project's current default for the manager.
    def update_visibility(visibility, errors)
      return unless %w[public admins].include?(visibility)

      response = call_tool(McpServer::Tools::UpdateProject, { project_id: @project.id, visible_to: visibility })
      errors << "update_project: #{response.content.to_json}" if response.error?
    end

    def update_access(phases, audience_index, errors)
      permitted_by = PERMITTED_BY_BY_INDEX[audience_index.to_i.clamp(0, 2)]
      return if permitted_by == 'users' # the platform default; nothing to change

      phases.each do |phase|
        action = PRIMARY_ACTION[phase[:plan]['participation_method']]
        next if action.nil?

        args = { phase_id: phase[:id], action: action, permitted_by: permitted_by }
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
