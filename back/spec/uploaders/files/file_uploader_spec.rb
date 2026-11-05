# frozen_string_literal: true

require 'rails_helper'
require 'tempfile'

RSpec.describe Files::FileUploader do
  let(:model) { build_stubbed(:global_file) }
  let(:uploader) { described_class.new(model, :content) }

  def tempfile_with(name, content)
    file = Tempfile.new([File.basename(name, '.*'), File.extname(name)])
    file.binmode
    file.write(content)
    file.rewind
    file
  end

  describe 'allowlists' do
    it 'sources extensions from SafeUploadAllowlist' do
      expect(uploader.extension_allowlist).to be(SafeUploadAllowlist::EXTENSIONS)
    end

    it 'sources content types from SafeUploadAllowlist' do
      expect(uploader.content_type_allowlist).to be(SafeUploadAllowlist::CONTENT_TYPES)
    end
  end

  describe 'happy paths' do
    it 'accepts a PDF' do
      expect { uploader.cache!(file_fixture('minimal_pdf.pdf').open) }.not_to raise_error
    end

    it 'accepts a JPEG' do
      expect { uploader.cache!(file_fixture('header.jpg').open) }.not_to raise_error
    end

    it 'accepts a docx' do
      expect { uploader.cache!(file_fixture('david.docx').open) }.not_to raise_error
    end

    it 'accepts an xlsx' do
      expect { uploader.cache!(file_fixture('example.xlsx').open) }.not_to raise_error
    end

    it 'accepts a zip with valid magic bytes' do
      empty_zip_bytes = "PK\x05\x06#{"\x00" * 18}".b
      file = tempfile_with('archive.zip', empty_zip_bytes)
      expect { uploader.cache!(file) }.not_to raise_error
    end
  end

  describe 'AD1 bypass attempts' do
    it 'rejects the literal pentest payload (eicar.txt.exe)' do
      file = file_fixture('keylogger.exe').open
      file.define_singleton_method(:original_filename) { 'eicar.txt.exe' }
      expect { uploader.cache!(file) }.to raise_error(CarrierWave::IntegrityError)
    end

    it 'rejects an executable renamed to .pdf (extension passes, content-type fails)' do
      file = file_fixture('keylogger.exe').open
      file.define_singleton_method(:original_filename) { 'payload.pdf' }
      expect { uploader.cache!(file) }.to raise_error(CarrierWave::IntegrityError)
    end

    it 'rejects an HTML upload' do
      file = tempfile_with('phish.html', '<html><body><script>alert(1)</script></body></html>')
      expect { uploader.cache!(file) }.to raise_error(CarrierWave::IntegrityError)
    end

    it 'rejects a macro-enabled Word document by extension' do
      file = tempfile_with('macros.docm', "PK\x03\x04stub")
      expect { uploader.cache!(file) }.to raise_error(CarrierWave::IntegrityError)
    end

    it 'rejects an SVG' do
      file = tempfile_with('image.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>')
      expect { uploader.cache!(file) }.to raise_error(CarrierWave::IntegrityError)
    end
  end
end
