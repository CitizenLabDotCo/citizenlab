# frozen_string_literal: true

module BulkImportIdeas
  module Extensions
    module IdeasFinder
      # Only moderators can see whether an idea was imported, so the filter
      # never reaches beyond the ideas the user can moderate.
      def imported_condition(imported)
        return if imported.nil?

        imported_ids = BulkImportIdeas::IdeaImport.select(:idea_id)
        ideas = moderatable_records
        Utils.to_bool(imported) ? ideas.where(id: imported_ids) : ideas.where.not(id: imported_ids)
      end
    end
  end
end
