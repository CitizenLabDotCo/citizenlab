# frozen_string_literal: true

require 'rails_helper'

describe Export::XlsxExport::AttendeesGenerator do
  let(:service) { described_class.new }

  describe 'generate_attendees_xlsx' do
    let(:users) { create_list(:user, 5) }
    let(:xlsx) { service.generate_attendees_xlsx(users, view_private_attributes: true) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it 'exports a valid excel file' do
      expect { workbook }.not_to raise_error
    end

    it 'contains a row for every user' do
      expect(worksheet.sheet_data.size).to eq(users.size + 1)
    end

    it 'contains extra columns for custom user fields' do
      create(:custom_field_domicile)
      area = create(:area, title_multiloc: { 'en' => 'Center' })
      users.first.update!(custom_field_values: { 'domicile' => area.id })

      title_row = worksheet[0].cells.map(&:value)
      user_rows = worksheet.map { |row| row.cells.map(&:value) }
      user_row = user_rows.find { |values| values.include? users.first.email }
      expect([user_row[title_row.find_index 'domicile']]).to eq ['Center']
    end

    it 'includes hidden custom fields' do
      create(:custom_field, hidden: true, title_multiloc: { 'en' => 'Hidden field' })
      headers = worksheet[0].cells.map(&:value)
      field_idx = headers.find_index 'Hidden field'
      expect(field_idx).to be_present
    end
  end
end
