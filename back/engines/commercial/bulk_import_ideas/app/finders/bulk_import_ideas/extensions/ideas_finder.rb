# frozen_string_literal: true

module BulkImportIdeas
  module Extensions
    module IdeasFinder
      def imported_condition(imported)
        return if imported.nil?

        imported_ids = BulkImportIdeas::IdeaImport.select(:idea_id)
        ideas = moderatable_records
        Utils.to_bool(imported) ? ideas.where(id: imported_ids) : ideas.where.not(id: imported_ids)
      end
    end
  end
end
