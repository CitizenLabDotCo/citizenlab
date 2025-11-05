# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FileUpload do
  let(:idea) { create(:idea) }
  let(:file_upload) do
    create(:file_upload, name: 'some_file_name.notwhitelisted')
  end

  describe 'extension_whitelist validation' do
    it 'is valid for any non-whitelisted file extension' do
      expect(file_upload).to be_valid
    end
  end

  describe 'path' do
    let(:file_upload) { create(:file_upload) }

    it 'is the location on disk in the "idea_file" directory' do
      expected_path = Regexp.new('/citizenlab/back/public/uploads/.+/idea_file/file/.+/afvalkalender.pdf')
      expect(file_upload.file.path).to match expected_path
    end
  end
end
