# frozen_string_literal: true

module BulkImportIdeas::Patches::Idea
  def self.included(base)
    base.class_eval do
      has_one :idea_import, class_name: 'BulkImportIdeas::IdeaImport', dependent: :destroy

      before_update :update_import

      # TODO: Won't work for the global import where ideas are never draft - but not really needed there
      def update_import
        return unless publication_status_changed?(from: 'draft', to: 'published')

        idea_import.update!(approved_at: Time.now)
      end
    end
  end
end
