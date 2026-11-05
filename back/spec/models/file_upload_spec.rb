# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FileUpload do
  let(:idea) { create(:idea) }

  describe 'extension allowlist validation' do
    it 'is valid for an allowlisted file extension' do
      file_upload = create(:file_upload)
      expect(file_upload).to be_valid
    end

    it 'rejects disallowed extensions on upload' do
      file_upload = described_class.new(
        idea: idea,
        file_by_content: {
          content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...',
          name: 'some_file_name.notwhitelisted'
        }
      )

      expect(file_upload).not_to be_valid
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
