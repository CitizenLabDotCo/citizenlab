require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Navbar items" do
  explanation "Navbar items represent pages which are included to navigation bar"

  let(:json_response) { json_parse(response_body) }

  before do
    header "Content-Type", "application/json"
  end

  patch "web_api/v1/navbar_items/:id" do
    with_options scope: :navbar_item do
      parameter :title_multiloc, "New title for the navbar item", required: false
      parameter :visible, "Hide or show the navbar item", required: false
      parameter :position, "Set new position for the navbar item", required: false
    end

    let(:id) { navbar_item.id }

    let!(:navbar_item) do
      build(
        :navbar_item,
        type: 'custom',
        visible: true,
        position: 2,
        title_multiloc: { "en" => "Title" }
      ).tap do |navbar_item|
        create(:page, navbar_item: navbar_item)
      end
    end

    before { auth_token }

    def auth_token
      admin_header_token
    end

    def expect_json_response_to_be(navbar_item)
      data = json_response.fetch(:data)
      expect(data).to include(id: navbar_item.id, type: 'navbar_item')
      expect(data.fetch(:attributes)).to eq(
        navbar_item.attributes.deep_symbolize_keys.slice(:type, :title_multiloc, :visible, :position)
      )
      expect(data.dig(:relationships, :page, :data)).to eq(
        id: navbar_item.page.id,
        type: "page"
      )

      included = json_response.fetch(:included)
      expect(included.count).to eq(1)
      json_page = included.first

      expect(json_page).to include(
        id: navbar_item.page.id,
        type: 'page'
      )
      expect(json_page.fetch(:attributes)).to include(
        navbar_item.page.attributes.deep_symbolize_keys.slice(
          :title_multiloc, :publication_status, :slug, :body_multiloc
        )
      )
      expect(json_page.fetch(:attributes)).to include(
        created_at: navbar_item.page.created_at.iso8601(3),
        updated_at: navbar_item.page.updated_at.iso8601(3)
      )
    end

    example_request "Returns 422", document: false do
      expect(status).to eq(422)
      expect(json_response).to eq(
        error: "param is missing or the value is empty: navbar_item"
      )
    end

    context "when title is provided" do
      let(:title_multiloc) { { "en" => "Changed title" } }

      example_request "Edits the title" do
        expect(navbar_item.reload).to have_attributes(
          title_multiloc: { "en" => "Changed title" }
        )
        expect(status).to eq(200)
        expect_json_response_to_be(navbar_item)
      end
    end

    context "when visible is false" do
      let(:visible) { false }

      example_request "Hides the navbar item" do
        navbar_item.reload

        expect(navbar_item).not_to be_visible
        expect(navbar_item.position).to eq(0)

        expect(status).to eq(200)
        expect_json_response_to_be(navbar_item)
      end
    end

    context "when position is provided" do
      let(:position) { 3 }

      let!(:navbar_item_1) do
        build(
          :navbar_item,
          visible: true,
          position: 3,
        ).tap do |navbar_item|
          create(:page, navbar_item: navbar_item)
        end
      end

      example_request "Chagnes the position" do
        expect(navbar_item.reload.position).to eq(3)
        expect(status).to eq(200)
        expect_json_response_to_be(navbar_item)
      end
    end

    context "when the current user is not an admin" do
      def auth_token
        user_header_token
      end

      example_request "Returns unauthorized", document: false do
        expect(status).to eq 401
        expect(json_response.fetch(:errors).fetch(:base).first.fetch(:error)).to eq("Unauthorized!")
      end
    end
  end
end
