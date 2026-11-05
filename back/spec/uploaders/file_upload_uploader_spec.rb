# frozen_string_literal: true

require 'rails_helper'
require 'tempfile'

RSpec.describe FileUploadUploader do
  let(:model) { FileUpload.new(name: 'placeholder.pdf') }
  let(:uploader) { described_class.new(model, :file) }

  describe 'allowlists' do
    it 'shares the SafeUploadAllowlist extension list with Files::FileUploader' do
      expect(uploader.extension_allowlist).to be(SafeUploadAllowlist::EXTENSIONS)
    end

    it 'shares the SafeUploadAllowlist content-type list with Files::FileUploader' do
      expect(uploader.content_type_allowlist).to be(SafeUploadAllowlist::CONTENT_TYPES)
    end
  end

  describe 'AD1 bypass attempts' do
    it 'rejects an executable masquerading as .pdf' do
      file = Rails.root.join('spec/fixtures/keylogger.exe').open
      file.define_singleton_method(:original_filename) { 'survey-attachment.pdf' }
      expect { uploader.cache!(file) }.to raise_error(CarrierWave::IntegrityError)
    end

    it 'rejects an .exe by extension' do
      file = Rails.root.join('spec/fixtures/keylogger.exe').open
      expect { uploader.cache!(file) }.to raise_error(CarrierWave::IntegrityError)
    end
  end

  describe 'happy paths' do
    it 'accepts a PDF (the dominant survey upload format, ~73% of historical data)' do
      file = Rails.root.join('spec/fixtures/minimal_pdf.pdf').open
      expect { uploader.cache!(file) }.not_to raise_error
    end

    it 'accepts a zip (17.5% of historical survey uploads)' do
      empty_zip_bytes = "PK\x05\x06#{"\x00" * 18}".b
      file = Tempfile.new(['archive', '.zip'])
      file.binmode
      file.write(empty_zip_bytes)
      file.rewind
      expect { uploader.cache!(file) }.not_to raise_error
    end
  end
end
