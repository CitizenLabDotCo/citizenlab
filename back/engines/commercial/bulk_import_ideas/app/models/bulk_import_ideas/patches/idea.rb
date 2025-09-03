# frozen_string_literal: true

module BulkImportIdeas::Patches::Idea
  def self.included(base)
    base.class_eval do
      has_one :idea_import, class_name: 'BulkImportIdeas::IdeaImport', dependent: :destroy

      before_update :update_idea_import
      before_destroy :remove_import_author

      private

      def import_approval?
        idea_import && publication_status_changed?(from: 'draft', to: 'published')
      end

      def update_idea_import
        return unless import_approval?

        # Delete an author that was created but then replaced (either by another user or nil)
        User.find(author_id_was).destroy! if author_id_changed? && idea_import&.user_created == true

        # Update the idea import record with the current changes
        update_attributes = {
          approved_at: Time.now,
          content_changes: changes.except('publication_status', 'published_at', 'submitted_at', 'updated_at'),
          user_consent: !!author
        }

        update_attributes = update_attributes.merge({ user_created: false }) if author.nil?

        # Did the author change and was a new one created? Assume if created within the last 30 minutes it probably was
        new_author_created = author_id_changed? && (author&.created_at&.>= 30.minutes.ago)
        update_attributes = update_attributes.merge({ user_created: true }) if new_author_created

        idea_import.update!(update_attributes)
      end

      def remove_import_author
        return unless author && idea_import&.user_created == true && publication_status == 'draft' && author.ideas.count == 1 && author.no_password? && !author.sso?

        DeleteUserJob.perform_now(author)
      end
    end
  end
end
