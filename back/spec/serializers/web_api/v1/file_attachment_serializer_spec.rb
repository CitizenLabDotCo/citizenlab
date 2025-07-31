# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WebApi::V1::FileAttachmentSerializer do
  describe 'equivalence with WebApi::V1::FileSerializer' do
    let(:file_attachment) { @file_attachment }
    let(:idea_file) { @idea_file }

    before do
      freeze_time do
        @file_attachment = create(:file_attachment)

        @idea_file = create(
          :idea_file,
          file: file_attachment.file.content,
          name: file_attachment.file.name,
          ordering: file_attachment.position
        )
      end
    end

    it 'serializes file attachment and idea file the same way' do
      serialized_attachment = described_class.new(file_attachment).serializable_hash.as_json
      serialized_idea_file = WebApi::V1::FileSerializer.new(idea_file).serializable_hash.as_json

      # Ensure both have a file URL
      expect(serialized_attachment.dig('data', 'attributes', 'file')).to have_key('url')
      expect(serialized_idea_file.dig('data', 'attributes', 'file')).to have_key('url')

      # Remove fields that cannot be compared
      serialized_attachment['data'].delete('id')
      serialized_idea_file['data'].delete('id')
      serialized_attachment.dig('data', 'attributes', 'file').delete('url')
      serialized_idea_file.dig('data', 'attributes', 'file').delete('url')

      expect(serialized_attachment).to eq(serialized_idea_file)
    end
  end
end
