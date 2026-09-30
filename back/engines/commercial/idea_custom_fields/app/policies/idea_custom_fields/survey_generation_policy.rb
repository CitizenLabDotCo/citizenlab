# frozen_string_literal: true

module IdeaCustomFields
  # The record is the phase whose survey gets generated. The generated survey is saved
  # through the `replace_form_fields` MCP tool, so the tool's own restrictions (draft
  # projects only, no responses yet) are checked here too, before enqueueing the job.
  class SurveyGenerationPolicy < ApplicationPolicy
    def create?
      phase = record
      return false unless phase.is_a?(Phase) && phase.participation_method == 'native_survey'
      return false unless can_moderate?(phase)

      writable_project?(phase.project) && phase.ideas_count.to_i.zero?
    end

    private

    def writable_project?(project)
      project.admin_publication.draft? ||
        McpServer::BaseTool::Runner::PUBLISHED_WRITABLE_LIFECYCLES.include?(AppConfiguration.instance.lifecycle_stage)
    end
  end
end
