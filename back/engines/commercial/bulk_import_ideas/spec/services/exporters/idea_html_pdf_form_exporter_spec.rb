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
      let!(:importer_data) { service.importer_data }
      let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
      # let!(:custom_field) do
      #   field = create(:custom_field_select, resource: custom_form, key: 'text_field', title_multiloc: { 'en' => 'Would you like some help?' })
      #   field.options.create!(key: 'yes', title_multiloc: { 'en' => 'yes' })
      #   field.options.create!(key: 'no', title_multiloc: { 'en' => 'no' })
      #   field
      # end

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

      it 'returns text strings to identify the start of the next that is NOT importable' do
        expect(importer_data[:fields].pluck(:next_page_split_text)).to eq [
          'Tell us more', 'Images and attachments', nil
        ]
      end
    end
  end
end
