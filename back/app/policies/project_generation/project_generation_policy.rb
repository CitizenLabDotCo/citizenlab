# frozen_string_literal: true

module ProjectGeneration
  # The record is the project the generator fills in. Generation writes through the MCP
  # tools (create_phase, update_project_layout, replace_form_fields, ...), so the tools'
  # own restriction (draft projects only, except on demo/trial) is checked here too,
  # before enqueueing the job. Re-generation is allowed: a second run fully replaces the
  # previously generated phases, survey and page content (see ProjectGenerator#persist).
  class ProjectGenerationPolicy < ApplicationPolicy
    def create?
      project = record
      return false unless project.is_a?(Project)
      return false unless can_moderate?(project)

      writable_project?(project)
    end

    private

    def writable_project?(project)
      project.admin_publication.draft? ||
        McpServer::BaseTool::Runner::PUBLISHED_WRITABLE_LIFECYCLES.include?(AppConfiguration.instance.lifecycle_stage)
    end
  end
end
