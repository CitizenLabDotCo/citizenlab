# frozen_string_literal: true

require 'rails_helper'

describe Export::Xlsx::InputSheetGenerator do
  describe '#generate_sheet' do
    before { create(:idea_status_proposed) }

    let(:phase) { create(:phase, participation_method: 'ideation') }
    let(:service) { described_class.new(inputs, phase) }
    let(:xlsx) do
      package = Axlsx::Package.new
      service.generate_sheet package.workbook, 'Sheet'
      xlsx_contents package.to_stream
    end

    let(:column_headers) { xlsx.first[:column_headers] }
    let(:rows) { xlsx.first[:rows] }

    context 'when an idea is imported' do
      let(:idea1) { create(:idea, project: phase.project, phases: [phase]) }
      let(:idea2) { create(:idea, project: phase.project, phases: [phase]) }
      let(:inputs) { [idea1, idea2] }

      before { create(:idea_import, idea: idea2) }

      it 'includes an Imported column with correct values' do
        imported_index = column_headers.index('Imported')
        expect(imported_index).to be_present
        expect(rows[0][imported_index]).to eq 'false'
        expect(rows[1][imported_index]).to eq 'true'
      end
    end
  end
end
