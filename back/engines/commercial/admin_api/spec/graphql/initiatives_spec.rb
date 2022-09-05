# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminApi::Schema do
  let(:context) { {} }
  let(:variables) { {} }
  let(:result) do
    res = described_class.execute(
      query_string,
      context: context,
      variables: variables
    )
    if res['errors']
      pp res
    end
    res
  end

  describe 'publicInitiatives' do
    let(:query_string) do
      %|
        query {
          publicInitiatives(first: 5) {
            edges {
              node {
                id
                href
                titleMultiloc {
                  en
                  nlBe
                  frBe
                  frFr
                }
                images(first: 1) {
                  edges {
                    node {
                      smallUrl
                    }
                  }
                }
                upvotesCount
                commentsCount
              }
            }
          }
        }
      |
    end

    it 'returns all public initiatives with fields' do
      create_list(:initiative, 5)
      create(:initiative, publication_status: 'draft')
      response = result
      edges = response.dig('data', 'publicInitiatives', 'edges')
      expect(edges&.size).to eq 5
      expect(edges&.first&.dig('node', 'id')).to be_present
      expect(edges&.first&.dig('node', 'href')).to be_present
      expect(edges&.first&.dig('node', 'titleMultiloc')&.values&.compact&.size).to be >= 1
      expect(edges&.first&.dig('node', 'upvotesCount')).to be_present
      expect(edges&.first&.dig('node', 'commentsCount')).to be_present
    end
  end
end
