# frozen_string_literal: true

# Dedicated update tool for projects (too side-effect-heavy for the generic update_resource).
# Content/settings only: publication state, folder/space moves, and the header image are
# intentionally NOT updatable here — publishing stays a deliberate human action.
class McpServer::Tools::UpdateProject < McpServer::BaseTool
  def name = 'update_project'

  def description
    <<~DESC.squish
      Updates an existing project's content and settings. Partial update — only the fields you pass
      change, and `*_multiloc` fields merge per locale. Does not change publication status (draft/
      published/archived), move the project between folders/spaces, or set the header image.
    DESC
  end

  def input_schema
    {
      properties: {
        project_id: { type: 'string', description: 'The ID of the project to update.' },
        title_multiloc: { **multiloc_schema, description: 'Project title.' },
        description_multiloc: { **multiloc_schema, description: 'Project description (HTML).' },
        description_preview_multiloc: { **multiloc_schema, description: 'Plain-text summary for search/previews.' },
        visible_to: { type: 'string', enum: %w[public groups admins], description: 'Who can see the project.' },
        area_ids: { type: 'array', items: { type: 'string' }, description: 'Area IDs to associate (replaces the current set; pass [] to clear). Use list_areas.' },
        global_topic_ids: { type: 'array', items: { type: 'string' }, description: 'Global topic IDs (replaces the current set; pass [] to clear). Use list_global_topics.' },
        include_all_areas: { type: 'boolean', description: 'Whether the project is associated with all areas.' },
        listed: { type: 'boolean', description: 'Whether the project is listed/discoverable (vs accessible by link only).' },
        live_auto_input_topics_enabled: { type: 'boolean', description: 'Auto-detect and assign topics to inputs.' },
        track_participation_location: { type: 'boolean', description: "Whether to track participants' location (requires the participation-location feature)." }
      },
      required: %w[project_id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      attributes = params.except(:project_id).symbolize_keys
      rejected = attributes.keys - updatable_attributes
      return error("These fields can't be updated on a project: #{rejected.join(', ')}.") if rejected.any?

      project = Project.find(params[:project_id])
      apply_attributes(project, attributes)

      SideFxProjectService.new.before_update(project, current_user)
      project.save!
      SideFxProjectService.new.after_update(project, current_user)

      ok("Updated project #{project.id}")
    rescue ActiveRecord::RecordNotFound
      error("Project not found: #{params[:project_id]}")
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end

    private

    # The allowlist is the tool's own schema fields (minus the id locator) — single source of truth.
    def updatable_attributes
      McpServer::Tools::UpdateProject.new.input_schema[:properties].keys.map(&:to_sym) - [:project_id]
    end
  end
end
