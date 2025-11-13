# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::LLMFilePreprocessor do
  subject(:service) { described_class.new }

  describe '#with_preprocessed_file_content' do
    it 'yields text file content without preprocessing' do
      file = create(:file, name: 'david.txt')

      service.with_preprocessed_file_content(file) do |source|
        expect(source).to eq(file.content.full_url)
      end
    end

    it 'yields PDF file content without preprocessing' do
      file = create(:file, name: 'minimal_pdf.pdf')

      service.with_preprocessed_file_content(file) do |source|
        expect(source).to eq(file.content.full_url)
      end
    end

    it 'yields small image content without resizing' do
      file = create(:file, name: 'favicon.png') # Small PNG < 10MB

      service.with_preprocessed_file_content(file) do |source|
        expect(source).to eq(file.content.full_url)
      end
    end

    it 'yields resized image path for medium-sized images' do
      file = create(:file, name: '3-methods-project-header-bg.png')
      allow(file).to receive(:size).and_return(15.megabytes) # Mock as 15MB

      service.with_preprocessed_file_content(file) do |source|
        expect(source).to start_with('/tmp/')
        expect(File).to exist(source)
      end
    end

    it 'raises ImageSizeLimitExceededError for images > 50MB' do
      file = create(:file, name: 'favicon.png')
      allow(file).to receive(:size).and_return(60.megabytes)

      expect do
        service.with_preprocessed_file_content(file) { nil }
      end.to raise_error(described_class::ImageSizeLimitExceededError)
    end

    it 'yields PDF preview when available' do
      file = create(:file, name: 'david.docx')
      create(:file_preview, file: file) # Creates preview with 'completed' status

      service.with_preprocessed_file_content(file) do |source|
        expect(source).to eq(file.preview.content.full_url)
      end
    end

    it 'raises PreviewPendingError when preview is pending' do
      file = create(:file, name: 'david.docx')

      expect do
        service.with_preprocessed_file_content(file) { nil }
      end.to raise_error(described_class::PreviewPendingError)
    end

    it 'converts DOCX to HTML when preview generation failed' do
      file = create(:file, name: 'david.docx')
      file.create_preview!(status: 'failed', content: nil)

      service.with_preprocessed_file_content(file) do |source|
        expect(source).to end_with('.html')
        expect(File).to exist(source)
      end
    end
  end
end
