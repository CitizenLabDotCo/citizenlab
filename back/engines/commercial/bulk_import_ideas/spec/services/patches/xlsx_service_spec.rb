# frozen_string_literal: true

require 'rails_helper'
require 'rubyXL'

describe XlsxService do
  let(:service) { described_class.new }

  describe 'generate_ideas_xlsx' do
    before do
      @project = create(:project)
      @idea1 = create(:idea, project: @project)
      @idea2 = create(:idea, project: @project)
      create(:idea_import, idea: @idea2)
    end

    let(:xlsx) { service.generate_ideas_xlsx([@idea1, @idea2], view_private_attributes: false) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it 'includes column to show the idea was imported' do
      headers = worksheet[0].cells.map(&:value)
      import_column_index = headers.find_index 'imported'
      idea1_row = worksheet[1].cells.map(&:value)
      idea2_row = worksheet[2].cells.map(&:value)
      expect(import_column_index).to be_present
      expect(idea1_row[import_column_index]).to eq 'false'
      expect(idea2_row[import_column_index]).to eq 'true'
    end
  end

  describe 'split_xlsx' do
    it 'splits an xlsx into multiple xlsx files' do
      rows = [
        %w[col1 col2],
        ['a', 1],
        ['b', 2],
        ['c', 3],
        ['d', 4],
        ['e', 5],
        ['f', 6],
        ['g', 7]
      ]
      xlsx = service.xlsx_from_rows(rows)
      multiple_xlsx = service.split_xlsx(xlsx, 3)

      expect(multiple_xlsx.count).to eq 3

      document1 = RubyXL::Parser.parse_buffer(multiple_xlsx[0])
      expect(document1[0].count).to eq 4
      expect(document1[0].map { |r| r.cells.map(&:value) }).to eq [%w[col1 col2], ['a', 1], ['b', 2], ['c', 3]]

      document2 = RubyXL::Parser.parse_buffer(multiple_xlsx[1])
      expect(document2[0].count).to eq 4
      expect(document2[0].map { |r| r.cells.map(&:value) }).to eq [%w[col1 col2], ['d', 4], ['e', 5], ['f', 6]]

      document3 = RubyXL::Parser.parse_buffer(multiple_xlsx[2])
      expect(document3[0].count).to eq 2
      expect(document3[0].map { |r| r.cells.map(&:value) }).to eq [%w[col1 col2], ['g', 7]]
    end

    it 'writes dates correctly in split xlsx files' do
      sheet_rows = [
        %w[col1 col2],
        ['a', Date.new(2020, 1, 1)],
        ['b', Date.new(2020, 2, 2)],
        ['c', Date.new(2020, 3, 3)]
      ]
      # Copied from XlsxService#xlsx_from_rows.
      # We don't use xlsx_from_rows to save dates as dates.
      # W/o skip_sanitization, the dates are saved as strings.
      header, *rows = sheet_rows
      instances = rows.map { |row| header.zip(row).to_h }
      columns = header.map do |colname|
        { header: colname, f: ->(item) { item[colname] }, skip_sanitization: true }
      end
      xlsx = service.generate_xlsx('sheet 1', columns, instances)

      multiple_xlsx = service.split_xlsx(xlsx, 2)

      document1 = RubyXL::Parser.parse_buffer(multiple_xlsx[0])
      expect(document1[0].count).to eq 3
      expect(document1[0].map { |r| r.cells.map(&:value) }).to eq sheet_rows.first(3)
    end
  end
end
