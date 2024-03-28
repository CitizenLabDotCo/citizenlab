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

  describe 'publicPages' do
    let(:query_string) do
      %(
        {
          publicPages {
            edges {
              node {
                id
                href
                titleMultiloc {
                  en
                  nlBe
                }
                topInfoSectionMultiloc {
                  en
                  nlBe
                }
                slug
              }
            }
          }
        }
      )
    end

    it 'returns all public pages' do
      p1, _p2, _p3 = create_list(:static_page, 3)
      response = result
      edges = response.dig('data', 'publicPages', 'edges')
      expect(edges&.size).to eq 3
      expect(edges&.first&.dig('node', 'id')).to eq p1.id
      expect(edges&.first&.dig('node', 'href')).to eq "#{AppConfiguration.instance.base_frontend_uri}/pages/#{p1.slug}"

      # 'nlBe' because field names are camelized for the GraphQL API.
      expect(edges&.first&.dig('node', 'titleMultiloc', 'nlBe')).to eq p1.title_multiloc['nl-BE']
      expect(edges&.first&.dig('node', 'topInfoSectionMultiloc', 'nlBe')).to eq p1.top_info_section_multiloc['nl-BE']
      expect(edges&.first&.dig('node', 'slug')).to eq p1.slug
    end
  end
end
