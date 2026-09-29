# frozen_string_literal: true

module BulkImportIdeas
  module Extensions
    module IdeasFinder
      def imported_condition(imported)
        return if imported.nil?

        imported_ids = BulkImportIdeas::IdeaImport.select(:idea_id)
        Utils.to_bool(imported) ? where(id: imported_ids) : records.where.not(id: imported_ids)
      end
    end
  end
end
