# frozen_string_literal: true

module BulkImportIdeas
  module Patches
    module XlsxService
      def generate_idea_xlsx_columns(ideas, view_private_attributes: false, with_tags: false)
        super + [{ header: 'imported', f: ->(i) { i.idea_import ? true : false } }]
      end
    end
  end
end
