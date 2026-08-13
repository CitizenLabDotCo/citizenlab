# frozen_string_literal: true

# Dedicated update tool for projects (too side-effect-heavy for the generic update_resource).
# Content/settings only: publication state and folder/space moves are intentionally NOT
# updatable here — publishing stays a deliberate human action.
class McpServer::Tools::UpdateProject < McpServer::BaseTool
  def name = 'update_project'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true,
      idempotent_hint: true,
      open_world_hint: true # Fetches `remote_header_bg_url` from an arbitrary public URL.
    }
  end

  def description
    <<~DESC.squish
      Updates an existing project's content and settings. Partial update — only the fields you pass
      change, and `*_multiloc` fields merge per locale. Accepts the same content fields as
      create_project (see that tool for field semantics), except folder_id — a project can't be
      moved between folders here. Does not change publication status (draft/published/archived).
    DESC
  end

  def input_schema
    create_properties = McpServer::Tools::CreateProject.new.input_schema[:properties].except(:folder_id)
    {
      properties: { project_id: { type: 'string', description: 'The ID of the project to update.' }, **create_properties },
      additionalProperties: false,
      required: %w[project_id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      project = Project.find_by(id: params[:project_id])
      return not_found_error('Project', params[:project_id]) unless project

      authorize_project!(project)
      authorize(project, :update?)

      attributes = clear_uploaders!(project, params.except(:project_id))
      project.assign_attributes(merge_multilocs(project, attributes))

      SideFxProjectService.new.before_update(project, current_user)
      project.save!
      SideFxProjectService.new.after_update(project, current_user)

      response(
        "Updated project #{project.id}",
        structured: McpServer::Serializers::Project.serialize(project, params: { current_user: })
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end
  end
end
