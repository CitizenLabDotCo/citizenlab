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
      ],
      reorder: false
    },
    'cause' => {
      model: Volunteering::Cause,
      sidefx: Volunteering::SideFxCauseService,
      attrs: %i[title_multiloc description_multiloc],
      reorder: true
    },
    'poll_question' => {
      model: Polls::Question,
      sidefx: Polls::SideFxQuestionService,
      attrs: %i[title_multiloc question_type max_options],
      reorder: true
    },
    'poll_option' => {
      model: Polls::Option,
      sidefx: Polls::SideFxOptionService,
      attrs: %i[title_multiloc],
      reorder: true
    }
  }.freeze

  def name = 'update_resource'

  def description
    <<~DESC.squish
      Updates an existing resource of one of these types: #{RESOURCES.keys.join(', ')}.
      Partial update — only the fields you pass change, and `*_multiloc` fields merge per
      locale (pass every locale you want to set). For each type's available fields, see the
      matching create_<type> tool (e.g. create_poll_question); the same field names apply,
      minus the parent id — a resource can't be moved to a different parent. Where supported,
      pass `ordering` (0-based integer) to reposition the resource among its siblings.
    DESC
  end

  def input_schema
    {
      properties: {
        type: { type: 'string', enum: RESOURCES.keys, description: 'The type of resource to update.' },
        id: { type: 'string', description: 'The ID of the resource to update.' },
        attributes: {
          type: 'object',
          description: 'The fields to update. See the matching create_<type> tool for field names and shapes.'
        }
      },
      required: %w[type id attributes]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      return error("Unsupported resource type: #{params[:type]}") unless config
      return error('`attributes` must be an object.') unless params[:attributes].is_a?(Hash)

      attributes = params[:attributes].symbolize_keys
      ordering = attributes.delete(:ordering)&.to_i

      rejected = attributes.keys - config[:attrs]
      rejected << :ordering unless ordering.nil? || config[:reorder]
      if rejected.any?
        return error(
          "These fields can't be updated on #{params[:type]}: #{rejected.join(', ')}. " \
          "See create_#{params[:type]} for the updatable fields."
        )
      end

      record = config[:model].find(params[:id])
      record.update!(merge_multilocs(record, attributes))
      record.insert_at(ordering) if config[:reorder] && !ordering.nil?
      side_fx.after_update(record, current_user)

      ok("Updated #{params[:type]} #{record.id}")
    rescue ActiveRecord::RecordNotFound
      error("#{params[:type]} not found: #{params[:id]}")
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end

    private

    def side_fx
      @side_fx ||= config[:sidefx].new
    end

    def config
      @config ||= RESOURCES[params[:type]]
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
