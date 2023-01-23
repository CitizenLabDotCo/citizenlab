# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdeaFile, type: :model do
  describe 'extension_whitelist validation' do
    let(:idea) { create(:idea) }

    it 'is valid for all whitelisted file extensions' do
      IdeaFile::EXTENSION_WHITELIST.each do |extension|
        idea_file = described_class.new(
          idea: idea,
          name: "some_file_name.#{extension}"
        )
        expect(idea_file).to be_valid
      end
    end

    it 'is not valid for any non-whitelisted file extension' do
      idea_file = described_class.new(
        idea: idea,
        name: 'some_file_name.notwhitelisted'
      )
      expect(idea_file).not_to be_valid
    end
  end

  describe 'path' do
    let(:idea_file) { create(:idea_file) }

    it 'is the location on disk in the "idea_file" directory' do
      expected_path = Regexp.new('/cl2_back/public/uploads/idea_file/file/.+/afvalkalender.pdf')
      expect(idea_file.file.path).to match expected_path
    end
  end
end
