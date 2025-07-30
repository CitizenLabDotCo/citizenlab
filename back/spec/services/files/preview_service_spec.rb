# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::PreviewService do
  subject(:service) { described_class.new }

  let!(:pdf_file) { create(:file) }
  let!(:docx_file) { create(:file, name: 'david.docx') }

  describe '#enqueue_preview' do
    it 'enqueues a job to generate a preview for a docx file' do
      expect { service.enqueue_preview(docx_file) }.to have_enqueued_job(Files::GeneratePreviewJob)
      expect(docx_file.preview).to be_present
      expect(docx_file.preview.status).to eq('pending')
    end

    it 'does not enqueue a job for a PDF file' do
      expect { service.enqueue_preview(pdf_file) }.not_to have_enqueued_job(Files::GeneratePreviewJob)
      expect(pdf_file.preview).to be_nil
    end
  end

  describe '#generate_preview_content' do
    it 'generates a preview PDF for a docx file' do
      preview = docx_file.create_preview!
      expect(preview.content).to be_blank

      VCR.use_cassette('generate_preview_content_docx') do
        service.generate_preview_content(preview)
        expect(preview.content).to be_present
      end
    end
  end
end
