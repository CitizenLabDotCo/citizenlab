# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Parsers::IdeaPdfFileParser do
  let(:project) { create(:single_phase_ideation_project) }
  let(:service) { described_class.new create(:admin), 'en', project.phases.first&.id, false }

  # Mock data to avoid Gutenberg dependency that renders PDF to get this data
  let(:template_data) do
    {
      page_count: 2,
      fields: []
    }
  end

  before { allow(service).to receive(:template_data).and_return(template_data) }

  describe 'parse_rows' do
    let(:file) { create(:idea_import_file, num_pages: 2) }
    let(:llm_parser) { instance_double(BulkImportIdeas::Parsers::Pdf::LLMFormParser, parser_name: 'claude-sonnet-4-6') }

    before do
      allow(BulkImportIdeas::Parsers::Pdf::LLMFormParser).to receive(:new).and_return(llm_parser)
      allow(llm_parser).to receive(:parse_idea).and_return(parsed_idea)
    end

    context 'when the LLM parser returns a parsed idea' do
      let(:parsed_idea) { { pdf_pages: [1, 2], fields: { 'title' => 'A title', 'body' => 'A body' } } }

      it 'returns a single idea row built from the parsed idea' do
        rows = service.parse_rows(file)

        expect(rows.count).to eq 1
        expect(rows[0]).to include(
          file: file,
          project_id: project.id,
          phase_id: project.phases.first.id,
          pdf_pages: [1, 2]
        )
      end

      it 'stores the parsed value on the file' do
        service.parse_rows(file)

        expect(file.reload.parsed_value).to eq({
          'parser' => 'claude-sonnet-4-6',
          'value' => { 'pdf_pages' => [1, 2], 'fields' => { 'title' => 'A title', 'body' => 'A body' } }
        })
      end
    end

    context 'when the LLM parser returns no fields' do
      let(:parsed_idea) { { pdf_pages: [1, 2], fields: {} } }

      it 'returns no rows' do
        expect(service.parse_rows(file)).to eq []
      end

      it 'still stores the parsed value on the file' do
        service.parse_rows(file)

        expect(file.reload.parsed_value).to eq({
          'parser' => 'claude-sonnet-4-6',
          'value' => { 'pdf_pages' => [1, 2], 'fields' => {} }
        })
      end
    end

    context 'when the LLM parser returns nothing' do
      let(:parsed_idea) { nil }

      it 'returns no rows' do
        expect(service.parse_rows(file)).to eq []
      end

      it 'still stores the parsed value on the file' do
        service.parse_rows(file)

        expect(file.reload.parsed_value).to eq({ 'parser' => 'claude-sonnet-4-6', 'value' => nil })
      end
    end
  end

  describe 'create_files' do
    let(:service_with_split) { described_class.new create(:admin), 'en', project.phases.first&.id, false, pages_per_form: 2 }

    before { allow(service_with_split).to receive(:template_data).and_return(template_data) }

    it 'splits a 12 page PDF file into a file per idea based on pages_per_form (2)' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_12.pdf').read
      service_with_split.create_files("data:application/pdf;base64,#{base_64_content}")
      expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 7
      expect(BulkImportIdeas::IdeaImportFile.all.pluck(:num_pages)).to contain_exactly(2, 2, 2, 2, 2, 2, 12)
      expect(BulkImportIdeas::IdeaImportFile.where(parent: nil).pluck(:num_pages)).to eq [12]
    end

    it 'raises an error if a PDF file has more pages than MAX_TOTAL_PAGES' do
      stub_const('BulkImportIdeas::Parsers::Pdf::PdfFileSplitter::MAX_TOTAL_PAGES', 100)
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_128.pdf').read
      expect { service.create_files("data:application/pdf;base64,#{base_64_content}") }.to raise_error(
        an_instance_of(BulkImportIdeas::Error).and(having_attributes(key: 'bulk_import_maximum_pdf_pages_exceeded'))
      )
    end
  end
end
