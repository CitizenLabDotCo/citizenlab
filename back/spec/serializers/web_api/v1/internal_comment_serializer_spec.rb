# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::InternalCommentSerializer do
  context 'when the internal comment is marked as deleted' do
    let(:internal_comment) { create(:internal_comment, publication_status: 'deleted') }

    it 'does not include the body text' do
      body = described_class.new(internal_comment).serializable_hash.dig(:data, :attributes, :body)
      expect(body).to be_nil
    end

    it 'does not include the author relationship data' do
      author_data = described_class.new(internal_comment).serializable_hash.dig(:data, :relationships, :author, :data)
      expect(author_data).to be_nil
    end
  end
end
