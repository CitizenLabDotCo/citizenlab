# frozen_string_literal: true

module BulkImportIdeas
  module Patches
    module ProjectPolicy
      def bulk_create?
        active_moderator?
      end

      def export_form?
        active_moderator?
      end

      def draft_ideas?
        active_moderator?
      end

      def approve_all?
        active_moderator?
      end

      def show_idea_import_file?
        active_moderator?
      end

      def create_user?
        active_moderator?
      end
    end
  end
end
