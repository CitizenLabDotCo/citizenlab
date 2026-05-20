# frozen_string_literal: true

class McpServer::Tools::CreateEvent < MCP::Tool
  description 'Creates an event for a project'
  input_schema(
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
  )

  def self.call(project_id:, title:, start_at:, end_at:, description: nil, location: nil, online_link: nil, server_context:)
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
      SideFxEventService.new.after_create(event, admin_user)
      MCP::Tool::Response.new([{
        type: 'text',
        text: "Event created successfully. ID: #{event.id}, Title: #{event.title_multiloc.values.first}"
      }])
    else
      MCP::Tool::Response.new([{
        type: 'text',
        text: "Failed to create event: #{event.errors.full_messages.join(', ')}"
      }], error: true)
    end
  rescue ActiveRecord::RecordNotFound
    MCP::Tool::Response.new([{
      type: 'text',
      text: "Project not found: #{project_id}"
    }], error: true)
  end

  def self.to_multiloc(value)
    return value if value.is_a?(Hash)

    locale = AppConfiguration.instance.settings.dig('core', 'locales')&.first || 'en'
    { locale => value }
  end

  def self.admin_user
    User.admin.first!
  end
end
