require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Navbar items" do
  explanation "Navbar items represent pages which are included to navigation bar"

  let(:json_response) { json_parse(response_body) }

  before do
    header "Content-Type", "application/json"
  end

  get "web_api/v1/navbar_items" do
    parameter :visible, "Return only visible or hidden items", required: false

    before do
      user_header_token
    end

    # reserved pages should exist for each tenant
    let!(:home_page) { create(:page, :home) }
    let!(:projects_page) { create(:page, :projects) }
    let!(:hidden_page) { create(:page, navbar_item: build(:navbar_item, visible: false, position: 0)) }

    def expect_data_to_be(json, navbar_item)
      expect(json).to include(type: 'navbar_item', id: navbar_item.id)
      expect(json.fetch(:attributes)).to eq(
        navbar_item.attributes.deep_symbolize_keys.slice(
          *%i[type title_multiloc visible position]
        )
      )
      expect(json.dig(:relationships, :page, :data)).to eq(id: navbar_item.page.id, type: 'page' )
    end

    def expect_included_to_be(json, page)
      expect(json).to include(type: 'page', id: page.id)
      expect(json.fetch(:attributes)).to include(
        page.attributes.deep_symbolize_keys.slice(
          *%i[slug publication_status title_multiloc body_multiloc]
        )
      )
      expect(json.fetch(:attributes)).to include(
        created_at: page.created_at.iso8601(3),
        updated_at: page.updated_at.iso8601(3)
      )
      expect(json.dig(:relationships, :navbar_item, :data)).to eq(
        id: page.navbar_item.id, type: 'navbar_item'
      )
    end

    example_request "Lists all the navbar items" do
      expect(status).to eq(200)

      data = json_response.fetch(:data)
      expect(data.count).to eq(3)
      expect_data_to_be(data.first, home_page.navbar_item)
      expect_data_to_be(data.second, projects_page.navbar_item)
      expect_data_to_be(data.third, hidden_page.navbar_item)

      included = json_response.fetch(:included)
      expect(included.count).to eq(3)
      expect_included_to_be(included.first, home_page)
      expect_included_to_be(included.second, projects_page)
      expect_included_to_be(included.third, hidden_page)
    end

    context "when visible is true" do
      let(:visible) { true }

      example_request "Lists only visible navbar items" do
        expect(status).to eq(200)

        data = json_response.fetch(:data)
        expect(data.count).to eq(2)
        expect_data_to_be(data.first, home_page.navbar_item)
        expect_data_to_be(data.second, projects_page.navbar_item)

        included = json_response.fetch(:included)
        expect(included.count).to eq(2)
        expect_included_to_be(included.first, home_page)
        expect_included_to_be(included.second, projects_page)
      end
    end

    context "when visible is false" do
      let(:visible) { false }

      example_request "Lists only hidden navbar items" do
        expect(status).to eq(200)

        data = json_response.fetch(:data)
        expect(data.count).to eq(1)
        expect_data_to_be(data.first, hidden_page.navbar_item)

        included = json_response.fetch(:included)
        expect(included.count).to eq(1)
        expect_included_to_be(included.first, hidden_page)
      end
    end
  end
end
