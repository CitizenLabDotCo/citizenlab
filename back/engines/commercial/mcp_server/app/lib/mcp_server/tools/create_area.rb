# frozen_string_literal: true

class McpServer::Tools::CreateArea < McpServer::BaseTool
  def name = 'create_area'

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
      Creates a geographic/administrative area (a district or neighbourhood). Each area
      also becomes a selectable option on the 'domicile' registration field, so residents
      can be grouped by area for filtering and representativeness.
    DESC
  end

  def input_schema
    {
      properties: {
        title_multiloc: { **multiloc_schema, description: 'Area name.' },
        description_multiloc: { **multiloc_schema, description: 'Area description (HTML).' }
      },
      required: %w[title_multiloc],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      area = Area.new(params.slice(:title_multiloc, :description_multiloc))
      authorize(area, :create?)

      SideFxAreaService.new.before_create(area, current_user)
      area.save!
      SideFxAreaService.new.after_create(area, current_user)

      response(
        "Created area #{area.id}",
        structured: McpServer::Serializers::Area.serialize(area, params: { current_user: })
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end
  end
end
