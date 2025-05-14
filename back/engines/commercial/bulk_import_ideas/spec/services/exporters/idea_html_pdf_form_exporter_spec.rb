# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Exporters::IdeaHtmlPdfFormExporter do
  let(:service) { described_class.new project.phases.first, 'en', false }

  # NOTE: Content of PDF generated cannot be tested as it relies on an external container
  # The content of HTML being transformed is tested in the tests for IdeaHtmlFormExporter

  # TODO: Add tests for a native survey too
  describe 'importer_data' do
    context 'ideation form' do
      let(:project) { create(:single_phase_ideation_project) }
      let(:importer_data) { service.importer_data }
      let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

      before do
        # Stub the export method to return a PDF file from fixtures
        allow(service).to receive(:export).and_return(Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/ideation_form.pdf'))
      end

      it 'returns meta data about the fields in the form for the importer - page count, fields, options and positions' do
        expect(importer_data[:page_count]).to eq 2
        expect(importer_data[:fields].count).to eq 3
        expect(importer_data[:fields].pluck(:key)).to eq %w[
          title_multiloc body_multiloc location_description
        ]
        expect(importer_data[:fields].pluck(:name)).to eq [
          '1. Title', '2. Description', '6. Location'
        ]
        expect(importer_data[:fields].pluck(:page)).to eq [1, 1, 2]
        expect(importer_data[:fields].pluck(:position)).to eq [26, 39, 17]
      end

      it 'returns text strings to identify the start of the next field that is NOT importable' do
        expect(importer_data[:fields].pluck(:next_page_split_text)).to eq [
          'Tell us more', 'Images and attachments', nil
        ]
      end

      it 'returns text string to identify end text of the form that is not importable' do
        custom_form.update!(
          print_end_multiloc: { 'en' => '<h1>End of form</h1><p>Here is some other text too</p>' }
        )
        expect(importer_data[:fields].pluck(:next_page_split_text)).to eq [
          'Tell us more', 'Images and attachments', 'End of formHere is some other text too'
        ]
      end
    end
  end
end
