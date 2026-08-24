# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ContentBuilderLayouts' do
  explanation 'Content builder layouts for custom pages.'

  before { header 'Content-Type', 'application/json' }

  let(:page) { create(:static_page) }
  let!(:layout) { create(:layout, content_buildable: page, code: 'custom_page') }

  # URL parameters
  let(:static_page_id) { page.id }
  let(:code) { 'custom_page' }

  context 'when not authorized' do
    get 'web_api/v1/static_pages/:static_page_id/content_builder_layouts/:code' do
      example_request 'Get one layout by static_page_id and code' do
        assert_status 200
        expect(json_response_body).to include(
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

    post 'web_api/v1/static_pages/:static_page_id/content_builder_layouts/:code/upsert' do
      example_request '[error] Try to update a layout of a custom page without authorization' do
        expect(status).to eq 401
      end
    end

    delete 'web_api/v1/static_pages/:static_page_id/content_builder_layouts/:code' do
      example_request '[error] Try to delete a layout of a custom page without authorization' do
        expect(status).to eq 401
      end
    end
  end

  context 'when a regular user' do
    before { header_token_for create(:user) }

    post 'web_api/v1/static_pages/:static_page_id/content_builder_layouts/:code/upsert' do
      example_request '[error] Try to update a layout of a custom page as a regular user' do
        expect(status).to eq 401
      end
    end
  end

  context 'when admin' do
    before { admin_header_token }

    describe 'GET' do
      get 'web_api/v1/static_pages/:static_page_id/content_builder_layouts/:code' do
        example_request 'Get one layout by static_page_id and code' do
          expect(status).to eq 200
        end

        context 'when the custom page does not exist' do
          let(:static_page_id) { 'unknown' }

          example_request '[error] Try to get a layout when the page does not exist' do
            expect(status).to eq 404
          end
        end

        context 'when no layout with the given code exists for the page' do
          let(:code) { 'unknown' }

          example_request '[error] Try to get a layout when the code is unknown' do
            expect(status).to eq 404
          end
        end
      end
    end

    describe 'POST' do
      with_options scope: :content_builder_layout do
        parameter :enabled, 'Indicates that the layout is enabled.'
        parameter :craftjs_json, 'The craftjs layout configuration'
      end

      let(:enabled) { true }

      post 'web_api/v1/static_pages/:static_page_id/content_builder_layouts/:code/upsert' do
        context 'when the custom page does not exist' do
          let(:static_page_id) { 'unknown' }

          example_request '[error] Try to upsert a layout for a page that does not exist' do
            expect(status).to eq 404
          end
        end

        context 'when the layout already exists' do
          let(:craftjs_json) { { ROOT: { type: { resolvedName: 'CustomPageRoot' } } } }

          example_request 'Update the layout of a custom page' do
            assert_status 200
            expect(layout.reload.craftjs_json).to eq({ 'ROOT' => { 'type' => { 'resolvedName' => 'CustomPageRoot' } } })
          end
        end

        context 'when the layout does not exist' do
          before { layout.destroy! }

          context 'when craftjs_json is supplied' do
            let(:craftjs_json) { { ROOT: { type: { resolvedName: 'CustomPageRoot' } } } }

            example_request 'Create a layout for a custom page' do
              assert_status 201
              expect(json_response_body.dig(:data, :attributes, :code)).to eq code
            end
          end

          # An empty craftjs_json is filled in by Craftjs::DefaultLayoutService, which for this
          # code derives the scaffold and info sections from the page itself.
          context 'when craftjs_json is NOT supplied, it returns a default layout' do
            let(:page) do
              create(:static_page, top_info_section_multiloc: { 'en' => '<p>Hello</p>' }, top_info_section_enabled: true)
            end

            example_request 'Create a layout for a custom page' do
              assert_status 201

              craftjs_json = json_response_body.dig(:data, :attributes, :craftjs_json)
              expect(craftjs_json.dig(:ROOT, :type, :resolvedName)).to eq 'CustomPageRoot'
              expect(craftjs_json.dig(:CUSTOM_PAGE_BODY, :type, :resolvedName)).to eq 'CustomPageBody'
              expect(craftjs_json.dig(:CUSTOM_PAGE_TOP_INFO, :props, :text, :en)).to eq '<p>Hello</p>'
            end
          end
        end
      end
    end

    describe 'DELETE' do
      delete 'web_api/v1/static_pages/:static_page_id/content_builder_layouts/:code' do
        example_request 'Delete the layout of a custom page' do
          assert_status 200
          expect { layout.reload }.to raise_error ActiveRecord::RecordNotFound
        end
      end
    end
  end
end
