# frozen_string_literal: true

module BulkImportIdeas
  module Patches
    module XlsxService
      def generate_idea_xlsx_columns(ideas, view_private_attributes: false, with_tags: false, with_cosponsors: false)
        super + [{ header: 'imported', f: ->(i) { i.idea_import ? true : false } }]
      end

      # Splits a single sheet XLSX into multiple XLSXs, each containing at most
      # `max_rows` rows. Rows are not rewritten — we re-parse the original xlsx
      # per chunk and delete the rows outside it, so all cell fidelity
      # (rich text, styles, hyperlinks, formulas) is preserved.
      def split_xlsx(xlsx, max_rows)
        # Normalize to a byte string — callers pass either a String or a
        # StringIO (e.g. from Axlsx#to_stream), and RubyXL::Parser.parse_buffer
        # consumes its input, so we dup per parse.
        xlsx_bytes = xlsx.respond_to?(:string) ? xlsx.string : xlsx.to_s

        source_workbook = RubyXL::Parser.parse_buffer(xlsx_bytes.dup)
        trim_trailing_empty_rows!(source_workbook[0])
        data_row_count = [source_workbook[0].sheet_data.rows.size - 1, 0].max

        (0...data_row_count).each_slice(max_rows).map do |chunk_indices|
          chunk_workbook = RubyXL::Parser.parse_buffer(xlsx_bytes.dup)
          trim_trailing_empty_rows!(chunk_workbook[0])
          rows = chunk_workbook[0].sheet_data.rows
          first = chunk_indices.first + 1
          last = chunk_indices.last + 1
          rows.slice!((last + 1)..) if last + 1 < rows.size
          rows.slice!(1...first) if first > 1
          chunk_workbook.stream
        end
      end

      private

      def trim_trailing_empty_rows!(worksheet)
        rows = worksheet.sheet_data.rows
        rows.pop while rows.size > 1 && row_empty?(rows.last)
      end

      def row_empty?(row)
        return true if row.nil?

        (row.cells || []).all? { |c| c.nil? || c.value.nil? || c.value.to_s.strip.empty? }
      end
    end
  end
end
