# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::DescriptionGenerator do
  subject(:service) { described_class.new }

  before do
    stub_const('ENV', ENV.to_h.merge('AWS_TOXICITY_DETECTION_REGION' => 'eu-central-1'))
  end

  # Helper method to create a file with AI processing allowed, but without queuing a
  # description generation job.
  def create_ai_file(...)
    # If the `ai_processing_allowed` attribute is set to true at creation time,
    # the uploader will automatically enqueue a description generation job.
    create(:file, ...).tap do |file|
      file.update!(ai_processing_allowed: true)
    end
  end

  describe '.enqueue_job', :active_job_que_adapter do
    it 'does not enqueue a job for a file without AI processing allowed' do
      file = create(:file)
      expect(described_class.enqueue_job(file)).to be(false)
    end

    it 'does not enqueue a job for a file with a description' do
      file = create_ai_file(:with_description)
      expect(described_class.enqueue_job(file)).to be(false)
    end

    it 'enqueues a job for an eligible file' do
      file = create_ai_file
      expect(described_class.enqueue_job(file)).to be(true)
    end

    it 'cannot enqueue more than one job for the same file' do
      file = create_ai_file
      expect(described_class.enqueue_job(file)).to be(true)
      expect(described_class.enqueue_job(file)).to be(false)
    end
  end

  describe '#generate_descriptions!' do
    it 'generates and updates the file descriptions for a supported file format', :vcr do
      file = create_ai_file(name: 'afvalkalender.pdf')
      service.generate_descriptions!(file)

      expect(file.description_multiloc).to be_present
      expect(file.description_multiloc.keys).to match_array %w[en nl-NL fr-FR]
    end

    # BadRequestError is raised when an unsupported file is included in the request sent
    # to the LLM. Sometimes, it's not possible to determine in advance whether a file is
    # supported. For example, some image formats are supported while others aren't,
    # depending on the model.
    it 'raises RubyLLM::BadRequestError for unsupported file', :vcr do
      file = create_ai_file(name: 'robot.tiff')

      expect { service.generate_descriptions!(file) }
        .to raise_error(RubyLLM::BadRequestError)
    end

    # UnsupportedAttachmentError is raised when a file is detected as an unsupported type
    # before the request is sent to the LLM.
    it 'raises RubyLLM::UnsupportedAttachmentError for unsupported file' do
      file = create_ai_file(name: 'keylogger.exe')

      expect { service.generate_descriptions!(file) }
        .to raise_error(RubyLLM::UnsupportedAttachmentError)
    end

    context 'when the file type is not supported by the LLM, but is previewable as PDF' do
      context 'when the preview is present', :vcr do
        it 'generates and updates the file descriptions' do
          file = create_ai_file(name: 'david.docx')
          create(:file_preview, file:)

          service.generate_descriptions!(file)

          expect(file.description_multiloc).to be_present
        end
      end

      context 'when the preview is pending' do
        it 'raises a PreviewPendingError' do
          file = create_ai_file(name: 'david.docx')

          expect { service.generate_descriptions!(file) }
            .to raise_error(Files::LLMFilePreprocessor::PreviewPendingError)
        end
      end

      context 'when the preview generation failed' do
        it 'converts docx to HTML and generates descriptions', :vcr do
          file = create_ai_file(name: 'david.docx')
          file.create_preview!(status: 'failed', content: nil)

          expect_any_instance_of(Files::LLMFilePreprocessor)
            .to receive(:docx_to_html)
            .with(satisfy { |f| f.id == file.id })
            .and_call_original

          service.generate_descriptions!(file)
          expect(file.description_multiloc).to be_present
        end

        it 'raises RubyLLM::UnsupportedAttachmentError for non-docx file' do
          file = create_ai_file(name: 'david.xlsx')
          file.create_preview!(status: 'failed', content: nil)

          expect { service.generate_descriptions!(file) }
            .to raise_error(RubyLLM::UnsupportedAttachmentError)
        end
      end
    end

    context 'the file is an image' do
      context 'when the image is small' do
        it 'generates descriptions without resizing', :vcr do
          file = create_ai_file(name: 'header.jpg')
          allow(file).to receive(:size).and_return(1.megabyte) # Simulate a small image

          expect_any_instance_of(Files::LLMFilePreprocessor).not_to receive(:resize_image)
          service.generate_descriptions!(file)
          expect(file.description_multiloc).to be_present
        end
      end

      context 'when the image is large' do
        it 'is resized and generates descriptions', :vcr do
          file = create_ai_file(name: 'header.jpg')
          allow(file).to receive(:size).and_return(15.megabytes) # Simulate a large image

          expect_any_instance_of(Files::LLMFilePreprocessor)
            .to receive(:resize_image)
            .with(satisfy { |f| f.id == file.id })
            .and_call_original

          service.generate_descriptions!(file)

          expect(file.description_multiloc).to be_present
        end
      end

      context 'when the image is TOO large' do
        it 'raises FileTooLargeError' do
          file = create_ai_file(name: 'header.jpg')
          allow(file).to receive(:size).and_return(60.megabytes) # Simulate an oversized image

          expect { service.generate_descriptions!(file) }
            .to raise_error(Files::LLMFilePreprocessor::ImageSizeLimitExceededError)
        end
      end
    end
  end

  describe '.generate_descriptions?' do
    context 'when file is eligible' do
      it 'returns true' do
        file = create_ai_file
        expect(described_class.generate_descriptions?(file)).to be(true)
      end
    end

    context 'when file is not eligible' do
      it 'returns false when AI processing is not allowed' do
        file = create(:file, ai_processing_allowed: false)
        expect(described_class.generate_descriptions?(file)).to be(false)
      end

      it 'returns false when file already has description' do
        file = create_ai_file(:with_description)
        expect(described_class.generate_descriptions?(file)).to be(false)
      end

      it 'returns false when content is not present' do
        file = create_ai_file
        allow(file.content).to receive(:blank?).and_return(true)
        expect(described_class.generate_descriptions?(file)).to be(false)
      end
    end
  end
end
