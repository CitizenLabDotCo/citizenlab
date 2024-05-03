# frozen_string_literal: true

module BulkImportIdeas
  module Patches
    module XlsxService
      def generate_idea_xlsx_columns(ideas, view_private_attributes: false, with_tags: false)
        super + [{ header: 'imported', f: ->(i) { i.idea_import ? true : false } }]
      end

      # Splits a single sheet XLSX into multiple XLSXs, each containing at most `max_rows` rows.
      def split_xlsx(xlsx, max_rows)
        workbook = RubyXL::Parser.parse_buffer(xlsx)
        worksheet = workbook[0]
        header = worksheet[0]
        data_rows = worksheet.drop(1)

        data_rows.each_slice(max_rows).map do |rows|
          # Create new workbook
          new_workbook = RubyXL::Workbook.new
          new_worksheet = new_workbook[0]
          new_worksheet.sheet_name = worksheet.sheet_name

          # Add header
          header.cells.each_with_index do |cell, i|
            new_worksheet.add_cell(0, i, cell.value)
          end

          # Add data rows
          rows.each_with_index do |row, i|
            row.cells.each_with_index do |cell, j|
              new_worksheet.add_cell(i + 1, j, cell.value) unless cell.nil?
            end
          end
          new_workbook.stream
        end
      end
    end
  end
end
