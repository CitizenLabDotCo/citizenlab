# frozen_string_literal: true

require 'rails_helper'
require 'rubyXL'

describe XlsxService do
  let(:service) { Volunteering::XlsxService.new }

  describe 'generate_ideas_xlsx' do
    let(:cause) { create(:cause) }
    let!(:volunteers) { create_list(:volunteer, 5, cause: cause) }
    let(:xlsx) { service.generate_xlsx(cause.participation_context, Volunteering::Volunteer.all) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it 'exports a valid excel file' do
      expect { workbook }.not_to raise_error
    end

    it 'contains a row for every volunteer' do
      expect(worksheet.sheet_data.size).to eq(volunteers.size + 1)
    end

    describe 'with private attributes' do
      let(:xlsx) do
        service.generate_xlsx(
          cause.participation_context,
          Volunteering::Volunteer.all,
          view_private_attributes: false
        )
      end

      it 'hides private attributes' do
        expect(worksheet[0].cells.map(&:value)).not_to include 'email'
      end
    end

    describe 'when cause title includes illegal characters for excel sheet name' do
      let(:cause) { create(:cause, title_multiloc: { 'en' => 'With illegal characters \/*?:[]' }) }
      let(:xlsx) do
        service.generate_xlsx(
          cause.participation_context,
          Volunteering::Volunteer.all,
          view_private_attributes: false
        )
      end

      it 'exports a valid excel file' do
        expect { workbook }.not_to raise_error
      end
    end
  end
end
