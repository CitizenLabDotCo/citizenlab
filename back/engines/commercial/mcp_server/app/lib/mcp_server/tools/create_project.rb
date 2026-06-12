# frozen_string_literal: true

class McpServer::Tools::CreateProject < McpServer::BaseTool
  def name = 'create_project'
  def description = 'Creates a new project in draft'

  def input_schema
    {
      properties: {
        title_multiloc: { **multiloc_schema, description: 'Project title.' },
        description_multiloc: { **multiloc_schema, description: 'Project description (HTML).' },
        description_preview_multiloc: { **multiloc_schema, description: 'Plain-text summary for search/previews.' },
        visible_to: { type: 'string', enum: %w[public groups admins], description: 'Who can see the project. Defaults to "public".' },
        area_ids: { type: 'array', items: { type: 'string' }, description: 'Array of area IDs to associate with the project. Use list_areas to find valid IDs.' },
        global_topic_ids: { type: 'array', items: { type: 'string' }, description: 'Array of global topic IDs. Use list_global_topics to find valid IDs.' },
        folder_id: { type: 'string', description: 'ID of the project folder. Use list_folders to find valid IDs.' },
        live_auto_input_topics_enabled: { type: 'boolean', description: 'Auto-detect and assign topics to inputs. Defaults to false.' },
        include_all_areas: { type: 'boolean', description: 'Whether the project is associated with all areas.' },
        listed: { type: 'boolean', description: 'Whether the project is listed/discoverable (vs accessible by link only).' },
        track_participation_location: { type: 'boolean', description: "Whether to track participants' location (requires the participation-location feature)." }
      },
      required: %w[title_multiloc]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      project = Project.new(**params, admin_publication_attributes: { publication_status: 'draft' })

      SideFxProjectService.new.before_create(project, current_user)
      project.save!
      SideFxProjectService.new.after_create(project, current_user)

      ok(
        "Created project #{project.id}",
        structured: project.as_json(only: %i[id title_multiloc slug visible_to created_at])
      )
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
