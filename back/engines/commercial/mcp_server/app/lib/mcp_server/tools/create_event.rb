# frozen_string_literal: true

class McpServer::Tools::CreateEvent < McpServer::BaseTool
  def self.make
    klass = self
    description = 'Creates an event for a project'

    MCP::Tool.define(name: 'create_event', description:, input_schema:) do |**kwargs|
      klass.new.call(**kwargs)
    end
  end

  def self.input_schema
    {
      properties: {
        project_id: { type: 'string', description: 'The ID of the project to create the event for' },
        title: { description: 'Event title. A plain string (uses default locale) or a hash of locale => string.' },
        start_at: { type: 'string', description: 'Event start date/time in ISO 8601 format' },
        end_at: { type: 'string', description: 'Event end date/time in ISO 8601 format' },
        description: { description: 'Event description. A plain string or a hash of locale => string.' },
        location: { description: 'Event location. A plain string or a hash of locale => string.' },
        online_link: { type: 'string', description: 'URL for online events' }
      },
      required: %w[project_id title start_at end_at]
    }
  end

  def call(project_id:, title:, start_at:, end_at:, description: nil, location: nil, online_link: nil, server_context:)
    project = Project.find(project_id)

    event = Event.new(
      project: project,
      title_multiloc: to_multiloc(title),
      description_multiloc: description ? to_multiloc(description) : {},
      location_multiloc: location ? to_multiloc(location) : {},
      online_link: online_link,
      start_at: start_at,
      end_at: end_at
    )

    if event.save
      SideFxEventService.new.after_create(event, server_context[:current_user])
      MCP::Tool::Response.new(
        [{ type: 'text', text: "Created event #{event.id}" }],
        structured_content: event.as_json(only: %i[id project_id title_multiloc description_multiloc location_multiloc start_at end_at online_link])
      )
    else
      MCP::Tool::Response.new(
        [{ type: 'text', text: "Validation failed: #{event.errors.full_messages.join(', ')}" }],
        error: true
      )
    end
  rescue ActiveRecord::RecordNotFound
    MCP::Tool::Response.new(
      [{ type: 'text', text: "Project not found: #{project_id}" }],
      error: true
    )
  end
end
