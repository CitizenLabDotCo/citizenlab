# frozen_string_literal: true

module BulkImportIdeas
  module Patches
    module ProjectPolicy
      def bulk_create?
        active_moderator?
      end

      def example_xlsx?
        active_moderator?
      end

      def draft_ideas?
        active_moderator?
      end

      def show_idea_import_file?
        active_moderator?
      end
    end
  end
end
