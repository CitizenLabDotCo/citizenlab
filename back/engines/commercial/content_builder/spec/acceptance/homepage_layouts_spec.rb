# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ContentBuilderLayouts' do
  explanation 'Content builder layouts for projects.'

  before { header 'Content-Type', 'application/json' }

  context 'when not signed in' do
    let!(:homepage) { create(:home_page) }
    let(:code) { 'homepage' }
    let(:layout) { homepage.content_builder_layouts.find_by(code: code) }

    get 'web_api/v1/home_pages/content_builder_layouts/:code' do
      example_request 'Get one layout by code' do
        assert_status 200

        json_response = json_parse(response_body)
        expect(json_response).to include(
          {
            data: {
              id: layout.id,
              type: 'content_builder_layout',
              attributes: hash_including(
                code: code,
                created_at: match(time_regex),
                updated_at: match(time_regex)
              )
            }
          }
        )
      end
    end

    post 'web_api/v1/home_pages/content_builder_layouts/:code/upsert' do
      example_request '[error] Try to update a layout without authorization' do
        assert_status 401
      end
    end

    delete 'web_api/v1/home_pages/content_builder_layouts/:code' do
      example_request '[error] Try to delete a layout without authorization' do
        assert_status 401
      end
    end
  end

  context 'when admin' do
    before { admin_header_token }

    let!(:homepage) { create(:home_page) }
    let(:code) { 'homepage' }

    context 'when the layout exists' do
      let(:layout) { homepage.content_builder_layouts.find_by(code: code) }

      get 'web_api/v1/home_pages/content_builder_layouts/:code' do
        example_request 'Get one layout by code' do
          assert_status 200
        end
      end

      get 'web_api/v1/home_pages/content_builder_layouts/unknown' do
        example_request '[error] Try to get a layout when the code is unknown' do
          assert_status 404
        end
      end

      post 'web_api/v1/home_pages/content_builder_layouts/:code/upsert' do
        with_options scope: :content_builder_layout do
          parameter :enabled, 'Indicates that the layout is enabled.'
          parameter :craftjs_json, 'The craftjs layout configuration.'
        end

        let(:enabled) { false }
        let(:craftjs_json) { { ROOT: { type: { resolvedName: 'Container' } } } }

        example_request 'Update the layout of the homepage' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response).to include(
            {
              data: {
                id: layout.id,
                type: 'content_builder_layout',
                attributes: {
                  craftjs_json: { ROOT: { type: { resolvedName: 'Container' } } },
                  craftjs_jsonmultiloc: {},
                  enabled: false,
                  code: code,
                  created_at: match(time_regex),
                  updated_at: match(time_regex)
                }
              }
            }
          )
        end
      end

      delete 'web_api/v1/home_pages/content_builder_layouts/:code' do
        example_request 'Delete one layout by code' do
          assert_status 200
        end
      end

      delete 'web_api/v1/home_pages/content_builder_layouts/unknown' do
        example_request '[error] Try to delete a layout when the code is unknown' do
          assert_status 404
        end
      end
    end

    context 'when the layout does not exist' do
      let!(:homepage) { create(:home_page).tap { |homepage| homepage.content_builder_layouts.find_by(code: 'homepage').destroy! } }

      post 'web_api/v1/home_pages/content_builder_layouts/:code/upsert' do
        with_options scope: :content_builder_layout do
          parameter :enabled, 'Indicates that the layout is enabled.'
          parameter :craftjs_json, 'The craftjs layout configuration.'
        end

        let(:enabled) { true }
        let(:craftjs_json) { { ROOT: { type: { resolvedName: 'Container' } } } }

        example_request 'Create a layout for the homepage' do
          assert_status 201
          json_response = json_parse(response_body)
          expect(json_response).to include(
            {
              data: {
                id: be_a(String),
                type: 'content_builder_layout',
                attributes: {
                  craftjs_jsonmultiloc: {},
                  craftjs_json: {
                    ROOT: {
                      type: {
                        resolvedName: 'Container'
                      }
                    }
                  },
                  enabled: true,
                  code: code,
                  created_at: match(time_regex),
                  updated_at: match(time_regex)
                }
              }
            }
          )
          created_at = json_response.dig(:data, :attributes, :created_at)
          updated_at = json_response.dig(:data, :attributes, :updated_at)
          expect(updated_at).to eq created_at
        end
      end

      delete 'web_api/v1/home_pages/content_builder_layouts/:code' do
        example_request '[error] Try to delete a layout' do
          assert_status 404
        end
      end
    end
  end
end
