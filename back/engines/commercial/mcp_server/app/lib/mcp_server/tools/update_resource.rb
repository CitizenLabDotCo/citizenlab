# frozen_string_literal: true

# One generic update tool for the "simple" resources (minimal side effects, no
# conditional immutability). Complex resources (project, phase) get dedicated tools.
# The LLM is pointed at the matching create_<type> tool to learn each type's fields.
class McpServer::Tools::UpdateResource < McpServer::BaseTool
  # type => updatable config. `attrs` is an intentional allowlist of MCP-updatable fields
  # (≈ the create_<type> fields, minus the parent id — re-parenting is forbidden).
  RESOURCES = {
    'event' => {
      model: Event,
      sidefx: SideFxEventService,
      attrs: %i[
        title_multiloc description_multiloc location_multiloc address_2_multiloc attend_button_multiloc
        start_at end_at online_link address_1 using_url maximum_attendees location_point_geojson
      ]
    },
    'cause' => {
      model: Volunteering::Cause,
      sidefx: Volunteering::SideFxCauseService,
      attrs: %i[title_multiloc description_multiloc ordering]
    },
    'poll_question' => {
      model: Polls::Question,
      sidefx: Polls::SideFxQuestionService,
      attrs: %i[title_multiloc question_type max_options ordering]
    },
    'poll_option' => {
      model: Polls::Option,
      sidefx: Polls::SideFxOptionService,
      attrs: %i[title_multiloc ordering]
    }
  }.freeze

  def name = 'update_resource'

  def description
    intro = <<~DESC.squish
      Updates an existing resource. Partial update — only the fields you pass change.
      `*_multiloc` fields are deep-merged with the existing value, so pass every locale
      you want to set. For field shapes and semantics, see the matching create_<type>
      tool.
    DESC

    allowed = RESOURCES.map do |type, config|
      "- #{type}: #{config[:attrs].join(', ')}"
    end.join("\n")

    "#{intro}\n\nAllowed `attributes` keys per type:\n#{allowed}"
  end

  def input_schema
    {
      type: 'object',
      properties: {
        type: { type: 'string', enum: RESOURCES.keys, description: 'The type of resource to update.' },
        id: { type: 'string', description: 'The ID of the resource to update.' },
        attributes: {
          type: 'object',
          minProperties: 1,
          propertyNames: { enum: RESOURCES.values.flat_map { |c| c[:attrs] }.uniq },
          description: <<~DESC.squish
            The fields to update. Allowed keys depend on `type` — see the tool description
            for the per-type allowlist.
          DESC
        }
      },
      required: %w[type id attributes]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      attributes = params[:attributes].symbolize_keys
      rejected = attributes.keys - config[:attrs]

      if rejected.any?
        return error <<~ERROR.squish
          These fields can't be updated on #{params[:type]}: #{rejected.join(', ')}.
          Refer to the tool description for the list of updatable fields.
        ERROR
      end

      record.update!(merge_multilocs(record, attributes))
      side_fx.after_update(record, current_user)

      ok("Updated #{params[:type]} #{record.id}")
    rescue ActiveRecord::RecordNotFound
      error("#{params[:type]} not found: #{params[:id]}")
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end

    private

    def record = config.fetch(:model).find(params[:id])

    def side_fx
      @side_fx ||= config.fetch(:sidefx).new
    end

    def config
      @config ||= RESOURCES.fetch(params[:type])
    end

    # `*_multiloc` fields are deep-merged with the existing value:
    #   {en: 'Hi', fr: 'Bonjour'} + {fr: 'Salut', es: 'Hola'} -> {en: 'Hi', fr: 'Salut', es: 'Hola'}
    # Others attributes pass through as-is.
    def merge_multilocs(record, attributes)
      attributes.to_h do |key, value|
        next [key, value] unless multiloc?(key)

        current_value = record[key]
        [key, current_value.blank? ? value : current_value.merge(value)]
      end
    end

    def multiloc?(key) = key.to_s.end_with?('_multiloc')
  end
end
