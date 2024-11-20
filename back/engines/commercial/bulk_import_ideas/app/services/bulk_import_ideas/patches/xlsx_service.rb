# frozen_string_literal: true

module BulkImportIdeas
  module Patches
    module XlsxService
      def generate_idea_xlsx_columns(ideas, view_private_attributes: false, with_tags: false, with_cosponsors: false)
        super + [{ header: 'imported', f: ->(i) { i.idea_import ? true : false } }]
      end

      # Splits a single sheet XLSX into multiple XLSXs, each containing at most `max_rows` rows.
      def split_xlsx(xlsx, max_rows)
        workbook = RubyXL::Parser.parse_buffer(xlsx)
        worksheet = workbook[0]
        header = worksheet[0]
        data_rows = worksheet.drop(1)

        data_rows.each_slice(max_rows).map do |rows|
          new_package = Axlsx::Package.new
          new_workbook = new_package.workbook
          new_workbook.add_worksheet(name: worksheet.sheet_name) do |new_sheet|
            new_sheet.add_row(header.cells.map { |c| c&.value })

            rows.each do |row|
              next unless row&.cells

              new_sheet.add_row(row.cells.map { |c| c&.value })
            end
          end

          new_package.to_stream
        end
      end
    end
  end
end
