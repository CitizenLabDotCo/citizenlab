# frozen_string_literal: true

module BulkImportIdeas
  module Patches
    module ProjectPolicy
      def bulk_create_async?
        active_moderator?
      end

      def export_form?
        show?
      end

      def draft_records?
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

      # Bulk create projects is only allowed for super admins
      def bulk_create_projects?
        user.super_admin?
      end

      def show_project_import?
        user.super_admin?
      end
    end
  end
end
