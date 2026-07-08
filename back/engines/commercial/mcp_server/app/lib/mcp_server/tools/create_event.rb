# frozen_string_literal: true

class McpServer::Tools::CreateEvent < McpServer::BaseTool
  def name = 'create_event'
  def description = 'Creates an event for a project'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: false,
      idempotent_hint: false,
      open_world_hint: false
    }
  end

  def input_schema
    {
      properties: {
        project_id: { type: 'string', description: 'The ID of the project to create the event for' },
        title_multiloc: { **multiloc_schema, description: 'Event title.' },
        start_at: { type: 'string', description: 'Event start date/time in ISO 8601 format' },
        end_at: { type: 'string', description: 'Event end date/time in ISO 8601 format' },
        description_multiloc: { **multiloc_schema, description: 'Event description.' },
        location_multiloc: { **multiloc_schema, description: 'Event location.' },
        address_1: { type: 'string', description: 'Street address of the event location.' },
        address_2_multiloc: { **multiloc_schema, description: 'Additional address details (e.g. room or floor).' },
        attend_button_multiloc: { **multiloc_schema, description: 'Text for the event attendance/registration button.' },
        online_link: { type: 'string', description: 'URL where the online event takes place (e.g. Zoom, Google Meet). Used for online or hybrid events.' },
        using_url: { type: 'string', description: 'External URL the "Attend" button links to (e.g. Eventbrite, Meetup). When set, replaces the platform default RSVP.' },
        maximum_attendees: {
          type: %w[integer null],
          minimum: 1,
          description: 'Maximum number of attendees. Pass null for no cap.'
        },
        location_point_geojson: {
          type: 'object',
          description: 'GeoJSON point for the location.',
          properties: {
            type: { const: 'Point' },
            coordinates: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 }
          },
          required: %w[type coordinates],
          additionalProperties: false
        }
      },
      required: %w[project_id title_multiloc start_at end_at]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      event = Event.new(**params)
      authorize_project!(event.project)
      authorize(event, :create?)

      event.save!
      SideFxEventService.new.after_create(event, current_user)

      ok(
        "Created event #{event.id}",
        structured: McpServer::Serializers::Event.serialize(event, params: { current_user: })
      )
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
