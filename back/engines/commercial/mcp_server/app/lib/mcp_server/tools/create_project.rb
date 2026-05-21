# frozen_string_literal: true

class McpServer::Tools::CreateProject < McpServer::BaseTool
  description 'Creates a new project'
  input_schema(
    properties: {
      title: { description: 'Project title. A plain string (uses default locale) or a hash of locale => string.' },
      description: { description: 'Project description (HTML). A plain string or a hash of locale => string.' },
      visible_to: { type: 'string', enum: %w[public groups admins], description: 'Who can see the project. Defaults to "public".' },
      publication_status: { type: 'string', enum: %w[draft published], description: 'Publication status. Defaults to "draft".' }
    },
    required: %w[title]
  )

  def self.call(title:, description: nil, visible_to: 'public', publication_status: 'draft', server_context:)
    project = Project.new(
      title_multiloc: to_multiloc(title),
      description_multiloc: description ? to_multiloc(description) : {},
      visible_to: visible_to,
      admin_publication_attributes: { publication_status: publication_status }
    )

    user = server_context[:current_user]
    SideFxProjectService.new.before_create(project, user)

    if project.save
      SideFxProjectService.new.after_create(project, user)
      MCP::Tool::Response.new(
        [{ type: 'text', text: "Created project #{project.id}" }],
        structured_content: project.as_json(only: %i[id title_multiloc slug visible_to created_at])
      )
    else
      MCP::Tool::Response.new(
        [{ type: 'text', text: "Validation failed: #{project.errors.full_messages.join(', ')}" }],
        error: true
      )
    end
  end
end
