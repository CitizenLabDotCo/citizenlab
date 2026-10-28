# frozen_string_literal: true

class McpServer::Tools::UpdateArea < McpServer::BaseTool
  DEMO_ONLY_MESSAGE = 'Updating areas via MCP is only available on demo and trial ' \
                      'platforms. On live platforms, area changes stay a human action ' \
                      'in the admin UI.'

  def name = 'update_area'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true,
      idempotent_hint: true,
      open_world_hint: false
    }
  end

  def description
    <<~DESC.squish
      Updates an area's name or description. Partial update — only the fields you pass change,
      and `*_multiloc` fields merge per locale. Renaming an area also renames its option on the
      'domicile' registration field. Only available on demo and trial platforms.
    DESC
  end

  def input_schema
    area_properties = McpServer::Tools::CreateArea.new.input_schema[:properties]
    {
      properties: { area_id: { type: 'string', description: 'The ID of the area to update.' }, **area_properties },
      required: %w[area_id],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      area = Area.find_by(id: params[:area_id])
      return not_found_error('Area', params[:area_id]) unless area

      return error(DEMO_ONLY_MESSAGE) unless published_writable_platform?

      authorize(area, :update?)

      area.assign_attributes(merge_multilocs(area, params.except(:area_id)))

      side_fx = SideFxAreaService.new
      side_fx.before_update(area, current_user)
      area.save!
      side_fx.after_update(area, current_user)

      response(
        "Updated area #{area.id}",
        structured: McpServer::Serializers::Area.serialize(area, params: { current_user: })
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end
  end
end
