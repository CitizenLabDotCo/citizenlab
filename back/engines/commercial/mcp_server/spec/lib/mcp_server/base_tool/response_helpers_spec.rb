# frozen_string_literal: true

require 'rails_helper'

describe McpServer::BaseTool::ResponseHelpers do
  subject(:host) { Class.new { include McpServer::BaseTool::ResponseHelpers }.new }

  describe '#response' do
    it 'builds a success response with the text' do
      response = host.response('All good')

      expect(response).not_to be_error
      expect(response.content).to eq([{ type: 'text', text: 'All good' }])
      expect(response.structured_content).to be_nil
    end

    it 'duplicates the structured content into the text block' do
      response = host.response('All good', structured: { id: '123' })

      expect(response.structured_content).to eq(id: '123')
      expect(response.content.first[:text]).to eq("All good\n\n#{{ id: '123' }.to_json}")
    end
  end

  describe '#error' do
    it 'builds an error response' do
      response = host.error('Something broke', structured: { id: '123' })

      expect(response).to be_error
      expect(response.structured_content).to eq(id: '123')
    end
  end

  describe '#invalid_record_error' do
    it 'reports each validation error with its attribute, error key, message and details' do
      record = Project.new
      record.errors.add(:title_multiloc, :blank)
      record.errors.add(:base, :duration_too_short, message: 'must be at least 3 hours', count: 3)

      response = host.invalid_record_error(record)

      expect(response).to be_error
      expect(response.content.sole[:text]).to include('Validation failed:')
      expect(response.structured_content[:errors]).to match([
        { attribute: 'title_multiloc', error: :blank, message: be_present },
        { attribute: 'base', error: :duration_too_short, count: 3, message: 'must be at least 3 hours' }
      ])
    end
  end

  describe '#not_found_error' do
    it 'builds the standard not-found error' do
      response = host.not_found_error('Phase', 'some-id')

      expect(response).to be_not_found('Phase')
      expect(response.content.first[:text]).to eq('Phase not found: some-id')
    end
  end
end
