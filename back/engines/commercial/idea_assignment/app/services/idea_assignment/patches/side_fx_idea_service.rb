# frozen_string_literal: true

module IdeaAssignment
  module Patches
    module SideFxIdeaService
      def before_update(idea, user)
        super
        return unless idea.project_id_changed? && idea.assignee && !UserRoleService.new.can_moderate_project?(idea.project, idea.assignee)

        idea.assignee = nil
      end

      def after_update(idea, user)
        super
        # remove_duplicate_survey_responses_on_publish(idea)
        return unless idea.assignee_id_previously_changed?

        LogActivityJob.perform_later(idea, 'changed_assignee', user, idea.updated_at.to_i,
          payload: { change: idea.assignee_id_previous_change })
      end

      def before_create(idea, user)
        super
        return if idea.assignee

        idea.assignee = IdeaAssignmentService.new.automatically_assigned_idea_assignee idea
      end

      private

      # If a survey is opened in multiple tabs then different draft responses can be created for the same user.
      # We need to remove any duplicates when the survey is submitted.
      def remove_duplicate_survey_responses_on_publish(idea)
        return unless idea.creation_phase&.native_survey? && idea.publication_status_previously_changed?(from: 'draft', to: 'published')

        Idea.where(
          creation_phase_id: idea.creation_phase_id,
          author: idea.author,
          publication_status: 'draft'
        ).where.not(
          id: idea.id
        ).destroy_all
      end
    end
  end
end
