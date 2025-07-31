# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::DescriptionGenerator do
  subject(:service) { described_class.new }

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

    it 'raises RubyLLM::BadRequestError for unsupported file', :vcr do
      file = create_ai_file(name: 'david.mp3')

      expect { service.generate_descriptions!(file) }
        .to raise_error(RubyLLM::BadRequestError)
    end

    it 'raises RubyLLM::UnsupportedAttachmentError for unsupported file' do
      file = create_ai_file(name: 'keylogger.exe')

      expect { service.generate_descriptions!(file) }
        .to raise_error(RubyLLM::UnsupportedAttachmentError)
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
        file = create(:file)
        expect(described_class.generate_descriptions?(file)).to be(false)
      end

      it 'returns false when file already has description' do
        file = create_ai_file(:with_description)
        expect(described_class.generate_descriptions?(file)).to be(false)
      end

      it 'returns false when content is not present' do
        file = create_ai_file
        allow(file.content).to receive(:present?).and_return(false)
        expect(described_class.generate_descriptions?(file)).to be(false)
      end
    end
  end
end
