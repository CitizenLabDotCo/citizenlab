# frozen_string_literal: true

module BulkImportIdeas::Patches::Idea
  def self.included(base)
    base.class_eval do
      has_one :idea_import, class_name: 'BulkImportIdeas::IdeaImport', dependent: :destroy

      before_update :update_idea_import_approved_at
      before_destroy :remove_imported_user

      def update_idea_import_approved_at
        return unless idea_import && publication_status_changed?(from: 'draft', to: 'published')

        idea_import.update!(approved_at: Time.now)
      end

      def remove_imported_user
        return unless idea_import&.user_created == true && publication_status == 'draft'

        idea_import.import_user.destroy!
      end
    end
  end
end
