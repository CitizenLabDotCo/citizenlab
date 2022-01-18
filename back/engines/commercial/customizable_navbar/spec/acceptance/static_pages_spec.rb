require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'StaticPages' do
  explanation 'Static pages with static HTML content (e.g. privacy policy, cookie policy).'

  context 'when admin' do
    before do
      @admin = create :admin
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Content-Type', 'application/json'
      header 'Authorization', "Bearer #{token}"
    end

    post 'web_api/v1/static_pages' do
      with_options scope: :static_page do
        parameter :title_multiloc, 'The title of the page, as a multiloc string', required: true
        parameter :body_multiloc, 'The content of the page, as a multiloc HTML string', required: true
        parameter :slug, 'The unique slug of the page. If not given, it will be auto generated'
      end
      with_options scope: %i[static_page nav_bar_item_attributes] do
        parameter :title_multiloc, 'The title of the corresponding NavBarItem'
      end
      ValidationErrorHelper.new.error_fields self, StaticPage
      ValidationErrorHelper.new.error_fields self, NavBarItem

      example 'Create a static page with NavBarItem' do
        page = build :static_page
        item_title_multiloc = { 'en' => 'Awesome item' }

        do_request(
          static_page: {
            title_multiloc: page.title_multiloc,
            body_multiloc: page.body_multiloc,
            nav_bar_item_attributes: { title_multiloc: item_title_multiloc }
          }
        )
        expect(response_status).to eq 201
        json_response = json_parse response_body
        expect(StaticPage.find(json_response.dig(:data, :id)).nav_bar_item&.title_multiloc).to match item_title_multiloc
      end
    end

    patch 'web_api/v1/static_pages/:id' do
      with_options scope: :static_page do
        parameter :title_multiloc, 'The title of the static page, as a multiloc string'
        parameter :body_multiloc, 'The content of the static page, as a multiloc HTML string'
        parameter :slug, 'The unique slug of the static page'
      end
      with_options scope: %i[static_page nav_bar_item_attributes] do
        parameter :title_multiloc, 'The title of the corresponding NavBarItem'
      end
      ValidationErrorHelper.new.error_fields self, StaticPage
      ValidationErrorHelper.new.error_fields self, NavBarItem

      let(:page) { create :static_page }
      let(:id) { page.id }

      example 'Update the NavBarItem title of a static page' do
        title_multiloc = { 'en' => 'Awesome item' }
        item = create :nav_bar_item, static_page: page

        do_request(static_page: { nav_bar_item_attributes: { title_multiloc: title_multiloc } })
        expect(response_status).to eq 200
        expect(item.reload.title_multiloc).to match title_multiloc
      end

      example 'Update the NavBarItem title of a static page with no NavBarItem' do
        title_multiloc = { 'en' => 'Awesome item' }
        page.nav_bar_item&.destroy!
        do_request(static_page: { nav_bar_item_attributes: { title_multiloc: title_multiloc } })
        expect(response_status).to eq 200
      end

      example '[error] Update an invalid NavBarItem title of a static page' do
        title_multiloc = { 'en' => 42 }
        create :nav_bar_item, static_page: page

        do_request(static_page: { nav_bar_item_attributes: { title_multiloc: title_multiloc } })
        expect(response_status).to eq 422
      end
    end
  end
end
