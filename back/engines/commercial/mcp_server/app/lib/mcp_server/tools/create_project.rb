# frozen_string_literal: true

class McpServer::Tools::CreateProject < McpServer::BaseTool
  def self.make
    klass = self
    description = 'Creates a new project in draft'

    MCP::Tool.define(name: 'create_project', description:, input_schema:) do |**kwargs|
      klass.new.call(**kwargs)
    end
  end

  def self.input_schema
    {
      properties: {
        title: { description: 'Project title. A plain string (uses default locale) or a hash of locale => string.' },
        description: { description: 'Project description (HTML). A plain string or a hash of locale => string.' },
        description_preview: { description: 'Plain-text summary for search/previews. A plain string or a hash of locale => string.' },
        visible_to: { type: 'string', enum: %w[public groups admins], description: 'Who can see the project. Defaults to "public".' },
        area_ids: { type: 'array', items: { type: 'string' }, description: 'Array of area IDs to associate with the project. Use list_areas to find valid IDs.' },
        global_topic_ids: { type: 'array', items: { type: 'string' }, description: 'Array of global topic IDs. Use list_global_topics to find valid IDs.' },
        folder_id: { type: 'string', description: 'ID of the project folder. Use list_folders to find valid IDs.' },
        default_assignee_id: { type: 'string', description: 'User ID of the default idea assignee. Use list_users to find valid IDs.' },
        live_auto_input_topics_enabled: { type: 'boolean', description: 'Auto-detect and assign topics to inputs. Defaults to false.' }
      },
      required: %w[title]
    }
  end

  def call(title:, description: nil, description_preview: nil, visible_to: 'public',
           area_ids: nil, global_topic_ids: nil, folder_id: nil,
           default_assignee_id: nil, live_auto_input_topics_enabled: false, server_context:)
    project = Project.new(
      title_multiloc: to_multiloc(title),
      description_multiloc: description ? to_multiloc(description) : {},
      description_preview_multiloc: description_preview ? to_multiloc(description_preview) : {},
      visible_to: visible_to,
      admin_publication_attributes: { publication_status: 'draft' },
      area_ids: area_ids || [],
      global_topic_ids: global_topic_ids || [],
      folder_id: folder_id,
      default_assignee_id: default_assignee_id,
      live_auto_input_topics_enabled: live_auto_input_topics_enabled
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
