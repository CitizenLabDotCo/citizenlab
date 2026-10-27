# frozen_string_literal: true

module ProjectGeneration
  # Applies a manager's natural-language change request to an existing (draft)
  # project as a set of TARGETED edits, instead of regenerating the whole thing.
  #
  # One structured-output LLM call turns the instruction + a snapshot of the
  # current project into an ordered list of operations; the system then executes
  # each with the matching MCP tool — the same tools the generator uses, but
  # patching in place rather than destroying and rebuilding:
  #
  #   update_project       -> project title / summary / visibility
  #   update_project_layout -> the project page body text
  #   create_phase         -> add a phase
  #   update_phase         -> rename / re-describe / re-time a phase
  #   destroy_resource     -> remove a phase
  #   update_phase_permission -> who may take part in a phase
  #
  # Partial failures are reported but leave the rest of the edit applied; only an
  # edit where nothing at all could be applied surfaces as a failed job.
  class ProjectEditor
    class InvalidOutputError < StandardError; end

    # Reuse the generator's result shape so the job handles both the same way.
    GenerationResult = ProjectGenerator::GenerationResult

    PARTICIPATION_METHODS = ProjectGenerator::PARTICIPATION_METHODS
    PERMITTED_BY_BY_INDEX = ProjectGenerator::PERMITTED_BY_BY_INDEX
    PRIMARY_ACTION = ProjectGenerator::PRIMARY_ACTION
    PHASE_DURATION_DAYS = ProjectGenerator::PHASE_DURATION_DAYS

    EDIT_VISIBILITIES = %w[public admins].freeze
    ACTIONS = %w[update_project update_page_body add_phase update_phase remove_phase set_phase_access].freeze
    DEFAULT_PHASE_DURATION_DAYS = 14
    # Page-body widgets kept in place when update_page_body replaces the text blocks.
    KEPT_PAGE_WIDGETS = %w[PhasesWidget EventsList ExtraSurveysWidget].freeze

    BLOCK_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[heading body],
      properties: {
        heading: { type: 'string', description: 'Section heading. Empty string for an intro paragraph.' },
        body: { type: 'string', description: 'Plain text; blank lines separate paragraphs.' }
      }
    }.freeze

    # Claude's structured output only accepts closed objects with every property
    # required, so one operation object carries the union of every action's fields
    # and the unused ones are filled with empty/zero/false (same convention as the
    # generator's PHASE_SCHEMA). The executor reads only the fields its action uses.
    OPERATION_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[action phase_number title description description_preview visibility participation_method duration_days page_blocks audience_index verification_required],
      properties: {
        action: { type: 'string', enum: ACTIONS, description: 'What this operation does.' },
        phase_number: { type: 'integer', description: '1-based number of the existing phase to act on, taken from the CURRENT PROJECT list below. 0 when the action is not about a specific existing phase (update_project, update_page_body, add_phase).' },
        title: { type: 'string', description: 'update_project: the new project title. add_phase / update_phase: the phase title. Empty string to leave unchanged.' },
        description: { type: 'string', description: 'add_phase / update_phase only: the phase description, plain text. Empty string to leave unchanged.' },
        description_preview: { type: 'string', description: 'update_project only: the short project summary shown in cards and search. Empty string to leave unchanged.' },
        visibility: { type: 'string', enum: ['public', 'admins', ''], description: "update_project only: 'public' (residents can find it once published) or 'admins' (hidden from residents). Empty string to leave unchanged." },
        participation_method: { type: 'string', enum: [*PARTICIPATION_METHODS, ''], description: 'add_phase only: the participation method for the new phase. Empty string otherwise.' },
        duration_days: { type: 'integer', description: 'add_phase: length of the new phase in days (0 uses a sensible default). update_phase: new length in days (0 leaves the dates unchanged). Ignored by other actions.' },
        page_blocks: { type: 'array', items: BLOCK_SCHEMA, description: 'update_page_body only: the FULL new ordered body of the project page — this REPLACES the current text on the page, so include everything that should remain. Empty array for every other action.' },
        audience_index: { type: 'integer', description: 'set_phase_access only: who may take part — 0 anyone (no account), 1 registered users, 2 admins only. -1 when the action is not set_phase_access.' },
        verification_required: { type: 'boolean', description: 'set_phase_access only: true to require identity verification (one-person-one-vote); only takes effect with audience 1. false otherwise.' }
      }
    }.freeze

    RESPONSE_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[operations summary],
      properties: {
        operations: {
          type: 'array',
          items: OPERATION_SCHEMA,
          description: 'The ordered list of targeted edits. Make the SMALLEST set of changes that satisfies the request and do not touch anything the manager did not ask about. Empty array if the request asks for nothing you can do.'
        },
        summary: {
          type: 'string',
          description: 'One or two plain, first-person, past-tense sentences telling the manager what you changed (e.g. "I shortened the introduction and renamed the voting phase to something more informal."). If you could not do part of it, say so briefly.'
        }
      }
    }.freeze

    def initialize(project, user, locale)
      @project = project
      @user = user
      @locale = locale
    end

    # @param instruction [String] the manager's change request in their own words
    # @return [GenerationResult]
    def edit_and_persist(instruction:)
      plan = request_plan(instruction)
      persist(plan)
    end

    private

    def request_plan(instruction)
      raise InvalidOutputError, 'The edit instruction is blank.' if instruction.to_s.strip.blank?

      response = llm.chat(message(instruction), response_schema: RESPONSE_SCHEMA)
      raise InvalidOutputError, 'The LLM response is not a JSON object.' unless response.is_a?(Hash)

      response.deep_stringify_keys
    end

    def message(instruction)
      text = ::Analysis::LLM::Prompt.new.fetch(
        'project_edit',
        locale: @locale,
        instruction: instruction,
        project_state: project_state,
        organisation_rules: organisation_rules
      )
      ::Analysis::LLM::Message.new(text)
    end

    # A compact, numbered snapshot of the project so the model can target existing
    # phases by number and knows the current copy it is editing.
    def project_state
      lines = []
      lines << "Title: #{localized(@project.title_multiloc)}"
      preview = localized(@project.description_preview_multiloc)
      lines << "Summary: #{preview}" if preview.present?
      lines << "Visibility: #{@project.visible_to}"
      lines << ''
      lines << 'Current phases, in order (refer to them by number):'
      if ordered_phases.empty?
        lines << '  (no phases yet)'
      else
        ordered_phases.each_with_index do |phase, index|
          lines << %(  #{index + 1}. "#{localized(phase.title_multiloc)}" — #{phase.participation_method}, #{phase.start_at} to #{phase.end_at})
        end
      end
      lines.join("\n")
    end

    # ---- persistence ------------------------------------------------------------------

    def persist(plan)
      errors = []
      operations = Array(plan['operations'])
      applied = operations.count { |op| apply(op.is_a?(Hash) ? op : {}, errors) }

      store_summary(plan['summary'])

      # Nothing applied (when edits were requested) is a real failure; a partial
      # tool error is reported but still leaves the project edited.
      failed = operations.any? && applied.zero?
      GenerationResult.new(errors: errors, failed: failed)
    end

    def apply(op, errors)
      case op['action']
      when 'update_project' then apply_update_project(op, errors)
      when 'update_page_body' then apply_update_page_body(op, errors)
      when 'add_phase' then apply_add_phase(op, errors)
      when 'update_phase' then apply_update_phase(op, errors)
      when 'remove_phase' then apply_remove_phase(op, errors)
      when 'set_phase_access' then apply_set_phase_access(op, errors)
      else false
      end
    rescue StandardError => e
      errors << "#{op['action']}: #{e.message}"
      false
    end

    def apply_update_project(op, errors)
      args = { project_id: @project.id }
      title = op['title'].to_s.strip
      preview = op['description_preview'].to_s.strip
      visibility = op['visibility'].to_s

      args[:title_multiloc] = { @locale => title } if title.present?
      args[:description_preview_multiloc] = { @locale => preview } if preview.present?
      args[:visible_to] = visibility if EDIT_VISIBILITIES.include?(visibility)
      return false if args.keys == [:project_id]

      run_tool(McpServer::Tools::UpdateProject, args, 'update_project', errors)
    end

    def apply_add_phase(op, errors)
      method = op['participation_method'].to_s
      return false unless PARTICIPATION_METHODS.include?(method)

      title = op['title'].to_s.strip.presence || default_phase_title(method)
      duration = op['duration_days'].to_i
      duration = DEFAULT_PHASE_DURATION_DAYS unless duration.positive?
      duration = duration.clamp(PHASE_DURATION_DAYS)

      start = next_phase_start
      finish = start + (duration - 1).days

      args = {
        project_id: @project.id,
        title_multiloc: multiloc(title),
        start_at: start.iso8601,
        end_at: finish.iso8601,
        participation_method: method
      }
      description = op['description'].to_s.strip
      args[:description_multiloc] = html_multiloc(description) if description.present?

      if method == 'native_survey'
        args[:native_survey_title_multiloc] = multiloc(title)
        args[:native_survey_button_multiloc] = multiloc(take_the_survey_label)
      elsif method == 'voting'
        # A minimal, valid approval-voting setup; the manager configures options later.
        args[:voting_method] = ProjectGenerator::DEFAULT_VOTING_METHOD
        args[:vote_term] = ProjectGenerator::DEFAULT_VOTE_TERM
      end

      run_tool(McpServer::Tools::CreatePhase, args, 'add_phase', errors)
    end

    def apply_update_phase(op, errors)
      phase = phase_by_number(op['phase_number'])
      return false unless phase

      args = { phase_id: phase.id }
      title = op['title'].to_s.strip
      description = op['description'].to_s.strip
      # *_multiloc fields merge per locale in update_phase, so other locales are kept.
      args[:title_multiloc] = multiloc(title) if title.present?
      args[:description_multiloc] = html_multiloc(description) if description.present?

      duration = op['duration_days'].to_i
      if duration.positive? && phase.start_at
        duration = duration.clamp(PHASE_DURATION_DAYS)
        args[:end_at] = (phase.start_at.to_date + (duration - 1).days).iso8601
      end
      return false if args.keys == [:phase_id]

      run_tool(McpServer::Tools::UpdatePhase, args, 'update_phase', errors)
    end

    def apply_remove_phase(op, errors)
      phase = phase_by_number(op['phase_number'])
      return false unless phase

      run_tool(McpServer::Tools::DestroyResource, { resource_type: 'phase', id: phase.id }, 'remove_phase', errors)
    end

    def apply_set_phase_access(op, errors)
      phase = phase_by_number(op['phase_number'])
      return false unless phase

      index = op['audience_index'].to_i
      return false unless (0..2).cover?(index)

      action = PRIMARY_ACTION[phase.participation_method]
      return false if action.nil?

      permitted_by = PERMITTED_BY_BY_INDEX[index]
      args = { phase_id: phase.id, action: action, permitted_by: permitted_by }
      args[:require_verification] = true if op['verification_required'] == true && permitted_by == 'users'

      run_tool(McpServer::Tools::UpdatePhasePermission, args, 'set_phase_access', errors)
    end

    # Replace the generated text blocks on the project page body, keeping the
    # phases/events widgets in place. Mirrors the generator's update_layout.
    def apply_update_page_body(op, errors)
      blocks = Array(op['page_blocks']).filter_map { |block| clean_block(block.is_a?(Hash) ? block : {}) }
      return false if blocks.empty?

      layout = ContentBuilder::Layout.find_by(
        content_buildable: @project,
        code: ContentBuilder::ProjectPageLayoutService::CODE
      )
      if layout.nil?
        errors << 'update_page_body: the project has no page layout'
        return false
      end

      stored = layout.craftjs_json || {}
      body_id = stored.keys.find { |id| resolved_name(stored[id]) == 'ProjectPageBody' }
      if body_id.nil?
        errors << 'update_page_body: the layout has no ProjectPageBody node'
        return false
      end

      body = stored[body_id]
      kept = Array(body['nodes']).select { |id| KEPT_PAGE_WIDGETS.include?(resolved_name(stored[id])) }
      removable = Array(body['nodes']) - kept

      new_nodes = {}
      new_ids = blocks.map do |block|
        id = SecureRandom.alphanumeric(10)
        new_nodes[id] = text_node(block, body_id)
        id
      end

      patch_nodes = new_nodes.merge(body_id => body.merge('nodes' => [*new_ids, *kept]))
      args = { project_id: @project.id, nodes: patch_nodes, delete_node_ids: removable }
      run_tool(McpServer::Tools::UpdateProjectLayout, args, 'update_page_body', errors)
    end

    # The assistant's account of what it changed, kept on the project so the
    # updated_at bump refreshes the page preview. Merged in so the generation
    # briefing (headline / highlights / next_steps checklist) is preserved.
    def store_summary(summary)
      existing = @project.ai_generation_summary.is_a?(Hash) ? @project.ai_generation_summary : {}
      text = summary.to_s.strip
      payload = text.present? ? existing.merge('last_edit' => text) : existing
      @project.update_columns(ai_generation_summary: payload, updated_at: Time.current)
    end

    # ---- helpers ----------------------------------------------------------------------

    def run_tool(tool_class, args, label, errors)
      response = call_tool(tool_class, args)
      if response.error?
        errors << "#{label}: #{response.content.to_json}"
        return false
      end
      true
    end

    def call_tool(tool_class, arguments)
      tool = tool_class.for(current_user: @user, token_scopes: [])
      tool.input_schema.validate_arguments(arguments)
      tool.call(server_context: {}, **arguments)
    end

    def ordered_phases
      @ordered_phases ||= @project.phases.order(:start_at, :created_at).to_a
    end

    def phase_by_number(number)
      index = number.to_i - 1
      return if index.negative?

      ordered_phases[index]
    end

    def next_phase_start
      last_end = ordered_phases.filter_map(&:end_at).max
      last_end ? last_end.to_date + 1.day : Time.zone.today
    end

    def clean_block(block)
      heading = block['heading'].to_s.strip
      body = block['body'].to_s.strip
      return if heading.blank? && body.blank?

      { 'heading' => heading, 'body' => body }
    end

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

    def resolved_name(node)
      ContentBuilder::Craftjs::Query.resolved_name(node || {})
    end

    def default_phase_title(method)
      I18n.t("project_generation.default_phase_title.#{method}", locale: @locale, default: method.humanize)
    end

    def take_the_survey_label
      I18n.t('project_generation.take_the_survey', locale: @locale, default: 'Take the survey')
    end

    def localized(multiloc)
      values = multiloc.is_a?(Hash) ? multiloc : {}
      (values[@locale] || values.values.first).to_s.strip
    end

    def multiloc(text)
      text.to_s.strip.present? ? { @locale => text.to_s.strip } : {}
    end

    def html_multiloc(text)
      text.to_s.strip.present? ? { @locale => "<p>#{ERB::Util.html_escape(text.to_s.strip)}</p>" } : {}
    end

    def llm
      @llm ||= LLMSelector.new.llm_class_for_use_case('project_generation').new
    end

    def organisation_rules
      AppConfiguration.instance.settings('core', 'ai_project_rules').to_s.strip
    end
  end
end
