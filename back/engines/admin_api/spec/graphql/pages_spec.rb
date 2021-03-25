require 'rails_helper'

RSpec.describe "Graphql pages" do
  let(:context) { {} }
  let(:variables) { {} }
  let(:result) {
    res = AdminApi::Schema.execute(
      query_string,
      context: context,
      variables: variables
    )
    if res["errors"]
      pp res
    end
    res
  }

  describe "publicPages" do
    let(:query_string) { %|
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
            bodyMultiloc {
              en
              nlBe
            }
            slug
          }
        }
      }
    }
    |}


    it "returns all public pages" do
      p1, _p2, _p3 = create_list(:page, 3)
      response = result
      edges = response.dig("data", "publicPages", "edges")
      expect(edges&.size).to eq 3
      expect(edges&.first&.dig('node','id')).to eq p1.id
      expect(edges&.first&.dig('node','href')).to eq "#{AppConfiguration.instance.base_frontend_uri}/pages/#{p1.slug}"
      expect(edges&.first&.dig('node','titleMultiloc','en')).to eq p1.title_multiloc['en']
      expect(edges&.first&.dig('node','bodyMultiloc','en')).to eq p1.body_multiloc['en']
      expect(edges&.first&.dig('node','slug')).to eq p1.slug
    end

  end
end