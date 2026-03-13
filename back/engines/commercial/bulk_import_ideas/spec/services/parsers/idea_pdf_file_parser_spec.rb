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

  describe 'parse_file_async' do
    let(:service_with_split) { described_class.new create(:admin), 'en', project.phases.first&.id, false, pages_per_form: 2 }

    before { allow(service_with_split).to receive(:template_data).and_return(template_data) }

    it 'creates jobs to process 5 ideas at a time' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_12.pdf').read
      expect do
        service.parse_file_async("data:application/pdf;base64,#{base_64_content}")
      end.to have_enqueued_job(BulkImportIdeas::IdeaPdfImportJob).exactly(:twice)
    end
  end

  describe 'create_files' do
    let(:service_with_split) { described_class.new create(:admin), 'en', project.phases.first&.id, false, pages_per_form: 2 }

    before { allow(service_with_split).to receive(:template_data).and_return(template_data) }

    it 'splits a 12 page PDF file into a file per idea based on pages_per_form (2)' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_12.pdf').read
      service_with_split.send(:create_files, "data:application/pdf;base64,#{base_64_content}")
      expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 7
      expect(BulkImportIdeas::IdeaImportFile.all.pluck(:num_pages)).to contain_exactly(2, 2, 2, 2, 2, 2, 12)
      expect(BulkImportIdeas::IdeaImportFile.where(parent: nil).pluck(:num_pages)).to eq [12]
    end

    it 'raises an error if a PDF file has too many pages (more than 100)' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_128.pdf').read
      expect { service.send(:create_files, "data:application/pdf;base64,#{base_64_content}") }.to raise_error(
        an_instance_of(BulkImportIdeas::Error).and(having_attributes(key: 'bulk_import_maximum_pdf_pages_exceeded'))
      )
    end
  end
end
