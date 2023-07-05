# frozen_string_literal: true

require 'rails_helper'

describe XlsxExport::InputSheetGenerator do
  describe '#generate_sheet' do
    let(:include_private_attributes) { false }
    let(:participation_method) { Factory.instance.participation_method_for(participation_context) }
    let(:form) { participation_method.custom_form }
    let(:service) { described_class.new(inputs, form, participation_method, include_private_attributes) }
    let(:sheetname) { 'My sheet' }
    let(:xlsx) do
      package = Axlsx::Package.new
      service.generate_sheet package.workbook, sheetname
      xlsx_contents package.to_stream
    end

    context 'for an ideation context' do
      let(:project) { create(:project, process_type: 'timeline') }
      let(:participation_context) { create(:phase, participation_method: 'ideation') }

      describe do
        let(:inputs) { [] }

        it 'Generates an empty sheet' do
          expect(xlsx).to eq([
            {
              sheet_name: 'My sheet',
              column_headers: [
                'ID',
                'Title',
                'Description',
                'Attachments',
                'Tags',
                'Latitude',
                'Longitude',
                'Location',
                'Proposed Budget',
                'Submitted at',
                'Published at',
                'Comments',
                'Likes',
                'Dislikes',
                'Baskets',
                'Budget',
                'URL',
                'Project',
                'Status'
              ],
              rows: []
            }
          ])
        end
      end
    end
  end
end
