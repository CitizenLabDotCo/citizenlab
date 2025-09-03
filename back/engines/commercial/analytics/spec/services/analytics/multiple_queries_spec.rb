# frozen_string_literal: true

require 'rails_helper'

describe Analytics::MultipleQueries do
  subject(:service) { described_class.new }

  before do
    create(:dimension_type, name: 'idea')
    create(:idea)
  end

  describe '#run' do
    it 'returns results of one query' do
      query = { fact: 'post', fields: 'id' }

      results, errors, paginations = service.run(query)
      expect(results.length).to eq(1)
      expect(errors).to be_empty
      expect(paginations).to be_present
    end

    it 'returns results of two queries' do
      query = [
        { fact: 'post', fields: 'id' },
        { fact: 'post', fields: 'id' }
      ]

      results, errors, paginations = service.run(query)
      expect(results.length).to eq(2)
      expect(errors).to be_empty
      expect(paginations).to be_present
    end

    context 'when original_url is present' do
      subject(:service) { described_class.new(original_url: 'http://example.com') }

      it 'returns paginations with urls' do
        query = { fact: 'post', fields: 'id' }

        _results, _errors, paginations = service.run(query)
        expect(paginations[:first].to_s).to start_with('http://example.com')
      end
    end
  end
end
