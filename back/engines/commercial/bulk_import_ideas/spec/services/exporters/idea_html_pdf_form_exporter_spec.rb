# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Exporters::IdeaHtmlPdfFormExporter do
  let(:service) { described_class.new project.phases.first, 'en', false }

  let(:project) { create(:single_phase_ideation_project) }
  let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
  let!(:custom_field) do
    field = create(:custom_field_select, resource: custom_form, key: 'text_field', title_multiloc: { 'en' => 'Would you like some help?' })
    field.options.create!(key: 'yes', title_multiloc: { 'en' => 'yes' })
    field.options.create!(key: 'no', title_multiloc: { 'en' => 'no' })
    field
  end

  # NOTE: Content of PDF generated cannot be tested as it relies on external container, but content of HTML being transformed is tested elsewhere

  describe 'importer_data' do
    before do
      # Stub the export method to return a PDF file from fixtures
      allow(service).to receive(:export).and_return(Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_1.pdf').read)
    end

    it 'returns form meta data for importer - page count, fields, options and positions' do
      importer_data = service.importer_data
      expect(importer_data[:page_count]).to eq 1
      expect(importer_data[:fields].pluck(:key)).to eq %w[
        title_multiloc
        body_multiloc
        text_field
        yes
        no
      ]
      expect(importer_data[:fields].pluck(:position)).to eq [23, 38, 85, 93, 98]
    end
  end
end
