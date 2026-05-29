# frozen_string_literal: true

class McpServer::Tools::CreateEvent < McpServer::BaseTool
  def name = 'create_event'
  def description = 'Creates an event for a project'

  def input_schema
    {
      properties: {
        project_id: { type: 'string', description: 'The ID of the project to create the event for' },
        title_multiloc: { **multiloc_schema, description: 'Event title.' },
        start_at: { type: 'string', description: 'Event start date/time in ISO 8601 format' },
        end_at: { type: 'string', description: 'Event end date/time in ISO 8601 format' },
        description_multiloc: { **multiloc_schema, description: 'Event description.' },
        location_multiloc: { **multiloc_schema, description: 'Event location.' },
        online_link: { type: 'string', description: 'URL for online events' }
      },
      required: %w[project_id title_multiloc start_at end_at]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      event = Event.create!(**params)
      SideFxEventService.new.after_create(event, current_user)

      ok(
        "Created event #{event.id}",
         structured: event.as_json(only: %i[id project_id title_multiloc description_multiloc location_multiloc start_at end_at online_link])
      )
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
