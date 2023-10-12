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

        # TODO: What if there is another idea with the same user id - update the next idea import with user created true? So there is always one?

        # Create an anonymous author if no author supplied
        new_author_created = false
        if author.nil?
          new_author = User.new(unique_code: SecureRandom.uuid, locale: idea_import.locale)
          new_author.save!
          self.author = new_author
          new_author_created = true
        end

        idea_import.update!(
          approved_at: Time.now,
          user_created: new_author_created || idea_import&.user_created,
          user_consent: !new_author_created,
          content_changes: changes.except('publication_status', 'published_at', 'updated_at')
        )
      end

      def remove_import_author
        return unless idea_import&.user_created == true && publication_status == 'draft'

        author.destroy!
      end
    end
  end
end
