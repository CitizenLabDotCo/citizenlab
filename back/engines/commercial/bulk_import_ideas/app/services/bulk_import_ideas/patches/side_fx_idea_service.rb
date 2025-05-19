# frozen_string_literal: true

module BulkImportIdeas
  module Patches
    module SideFxIdeaService
      def after_import(idea, current_user)
        return unless idea.author

        # Apply user custom field values from the idea to the author's user profile (if any)
        update_user_profile(idea, idea.author)

        return unless idea.idea_import&.user_created

        # Log a user 'create' activity - when the idea has been published
        LogActivityJob.perform_later(idea.author, 'created', current_user, idea.author.created_at.to_i, payload: { flow: 'importer' })
      end

      private

      def log_activity_jobs_after_published(idea, user)
        super
        after_import(idea, user)
      end
    end
  end
end
