# frozen_string_literal: true

class McpServer::Tools::CreateDemoInputs < McpServer::BaseTool
  MAX_INPUTS_PER_CALL = 50

  def name = 'create_demo_inputs'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: false,
      idempotent_hint: false,
      open_world_hint: false
    }
  end

  def description
    <<~DESC.squish
      Creates demo inputs (ideas, proposals or native survey responses) in a phase.
      Each input gets a generated fake demo author and a backdated timestamp spread
      over the phase's date range, so participation charts look realistic. Only
      available on demo and trial platforms. Write content that fits the project's
      context. For form fields (native surveys, extra ideation fields), read the
      form via get_form_fields first and answer via custom_field_values.
      Max #{MAX_INPUTS_PER_CALL} inputs per call; call repeatedly for more.
    DESC
  end

  def input_schema
    {
      properties: {
        phase_id: { type: 'string', description: 'The ID of the phase to create the inputs in.' },
        inputs: {
          type: 'array',
          minItems: 1,
          maxItems: MAX_INPUTS_PER_CALL,
          items: {
            type: 'object',
            properties: {
              title_multiloc: {
                **multiloc_schema,
                description: 'Input title. Required for ideation and proposals phases.'
              },
              body_multiloc: {
                **multiloc_schema,
                description: 'Input body (HTML). Required for ideation and proposals phases.'
              },
              custom_field_values: {
                type: 'object',
                description: 'Answers keyed by form field key (see get_form_fields). ' \
                             'Required for native_survey phases; optional extra form fields on ideation phases.'
              },
              location: {
                type: 'object',
                properties: {
                  lat: { type: 'number' },
                  lng: { type: 'number' },
                  description: { type: 'string', description: 'Human-readable address or place name.' }
                },
                required: %w[lat lng],
                additionalProperties: false,
                description: 'Where the input is located, for map views.'
              },
              budget: {
                type: 'number',
                description: 'Cost of the input. Only for budgeting (participatory budget) phases.'
              }
            },
            additionalProperties: false
          }
        }
      },
      required: %w[phase_id inputs],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    DEMO_ONLY_MESSAGE = 'Demo inputs can only be created on demo and trial platforms.'

    def run
      phase = Phase.find_by(id: params[:phase_id])
      return not_found_error('Phase', params[:phase_id]) unless phase
      return error(DEMO_ONLY_MESSAGE) unless published_writable_platform?

      ceiling = ceiling_error(phase.project)
      return ceiling if ceiling

      ideas = build_ideas(phase)
      ideas.each { |idea| authorize(idea, :create?) }

      errors = ideas.each_with_index.filter_map do |idea, index|
        { index:, errors: record_errors(idea) } if idea.invalid?
      end
      return error('Validation failed:', structured: { errors: }) if errors.any?

      ActiveRecord::Base.transaction do
        ideas.each do |idea|
          idea.author.save!
          idea.save!
        end
      end

      response(
        "Created #{ideas.size} demo inputs in phase #{phase.id}",
        structured: { idea_ids: ideas.map(&:id) }
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    def ceiling_error(project)
      requested = params[:inputs].size

      input_count = McpServer::DemoData.demo_input_count(project)
      if input_count + requested > McpServer::DemoData::MAX_INPUTS_PER_PROJECT
        return error("Demo input ceiling reached: this project has #{input_count} demo inputs " \
                     "of max #{McpServer::DemoData::MAX_INPUTS_PER_PROJECT}. Do not create more.")
      end

      user_ceiling_message = McpServer::DemoData.user_ceiling_error_message(requested)
      error(user_ceiling_message) if user_ceiling_message
    end

    def build_ideas(phase)
      times = McpServer::DemoData.sample_times(
        params[:inputs].size,
        from: input_window_start(phase),
        to: phase.end_at&.in_time_zone&.end_of_day || Time.zone.now,
        event_times: phase.project.events.pluck(:start_at)
      )
      params[:inputs].zip(times).map { |attributes, time| build_idea(phase, attributes, time) }
    end

    def build_idea(phase, attributes, time)
      location = attributes[:location]
      Idea.new(
        project: phase.project,
        phases: [phase],
        creation_phase: phase.pmethod.transitive? ? nil : phase,
        publication_status: 'published',
        author: McpServer::DemoData.build_author(time - rand(72).hours),
        created_at: time,
        published_at: time,
        title_multiloc: attributes[:title_multiloc],
        body_multiloc: attributes[:body_multiloc],
        custom_field_values: attributes[:custom_field_values] || {},
        budget: attributes[:budget],
        location_description: location&.dig(:description),
        location_point_geojson: location && { 'type' => 'Point', 'coordinates' => [location[:lng], location[:lat]] }
      )
    end

    def input_window_start(phase)
      start = phase.start_at.in_time_zone
      expire_days = phase.expire_days_limit
      return start unless phase.participation_method == 'proposals' && expire_days

      # Proposals backdated past the expiry window would render as expired.
      [start, (expire_days - 1).days.ago.beginning_of_day].max
    end
  end
end
