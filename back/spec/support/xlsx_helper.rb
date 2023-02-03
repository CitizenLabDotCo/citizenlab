# frozen_string_literal: true

module XlsxHelper
  def xlsx_contents(xlsx)
    workbook = RubyXL::Parser.parse_buffer(xlsx)
    workbook.worksheets.map do |sheet|
      column_headers = sheet[0].cells.map(&:value)
      rows = sheet[1..].map do |row|
        row.cells.map(&:value)
      end
      {
        sheet_name: sheet.sheet_name,
        column_headers: column_headers,
        rows: rows
      }
    end
  end
end
