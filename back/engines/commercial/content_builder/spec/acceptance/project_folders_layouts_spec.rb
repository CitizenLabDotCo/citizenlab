# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ContentBuilderLayouts' do
  explanation 'Content builder layouts for projects.'

  before { header 'Content-Type', 'application/json' }

  let(:folder) { create(:project_folder) }
  let!(:layout) { create(:layout, content_buildable: folder, code: 'project_folder_description') }

  # URL parameters
  let(:folder_id) { folder.id }
  let(:code) { 'project_folder_description' }

  context 'when not authorized' do
    get 'web_api/v1/project_folders/:folder_id/content_builder_layouts/:code' do
      example_request 'Get one layout by folder_id and code' do
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

    post 'web_api/v1/project_folders/:folder_id/content_builder_layouts/:code/upsert' do
      context 'when the layout code does not exist' do
        let(:code) { 'unknown' }

        example_request '[error] Try to create a layout for a project without authorization' do
          expect(status).to eq 401
        end
      end

      context 'when the layout code exists' do
        example_request '[error] Try to update a layout of a project without authorization' do
          expect(status).to eq 401
        end
      end
    end

    delete 'web_api/v1/project_folders/:folder_id/content_builder_layouts/:code' do
      context 'when the layout exists' do
        example_request '[error] Try to delete a layout of a project without authorization' do
          expect(status).to eq 401
        end
      end
    end
  end

  context 'when admin' do
    before { admin_header_token }

    describe 'GET' do
      get 'web_api/v1/project_folders/:folder_id/content_builder_layouts/:code' do
        context 'when the layout exists' do
          example_request 'Get one layout by folder_id and code' do
            expect(status).to eq 200
          end
        end

        context 'when the project folder does not exist' do
          let(:folder_id) { 'unknown' }

          example_request '[error] Try to get a layout of a folder when the folder does not exist' do
            expect(status).to eq 404
          end
        end

        context 'when no layout with the given code exists for the given folder' do
          let(:code) { 'unknown' }

          example_request '[error] Try to get a layout of a folder when the code is unknown' do
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

      post 'web_api/v1/project_folders/:folder_id/content_builder_layouts/:code/upsert' do
        context 'when the folder does not exist' do
          let(:folder_id) { 'unknown' }

          example_request '[error] Try to upsert a layout for a folder that does not exist' do
            expect(status).to eq 404
          end
        end

        context 'when the layout does not exist' do
          before { layout.destroy! }

          context 'when craftjs_json is supplied' do
            let(:craftjs_json) do
              {
                ROOT: {
                  type: {
                    resolvedName: 'Container'
                  }
                }
              }
            end

            example_request 'Create a layout for a folder' do
              assert_status 201
              expect(json_response_body).to include(
                {
                  data: {
                    id: be_a(String),
                    type: 'content_builder_layout',
                    attributes: {
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
              created_at = json_response_body.dig(:data, :attributes, :created_at)
              updated_at = json_response_body.dig(:data, :attributes, :updated_at)
              expect(updated_at).to eq created_at
            end
          end

          context 'when craftjs_json is NOT supplied, it returns a default layout' do
            example_request 'Create a layout for a folder' do
              assert_status 201

              craftjs_json = json_response_body.dig(:data, :attributes, :craftjs_json)
              expect(craftjs_json[:TEXT]).not_to be_nil
              expect(craftjs_json[:PUBLISHED_PROJECTS]).not_to be_nil
              expect(craftjs_json.dig(:PUBLISHED_PROJECTS, :props, :folderId)).to eq folder_id
            end
          end
        end

        context 'when the layout exists' do
          describe 'updating one locale' do
            let :craftjs_json do
              {
                ROOT: {
                  type: {
                    resolvedName: 'Container'
                  }
                }
              }
            end

            example_request 'Update one locale of a layout of a folder' do
              assert_status 200
              expect(json_response_body).to include(
                {
                  data: {
                    id: layout.id,
                    type: 'content_builder_layout',
                    attributes: {
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
              created_at = json_response_body.dig(:data, :attributes, :created_at)
              updated_at = json_response_body.dig(:data, :attributes, :updated_at)
              expect(updated_at).to be > created_at
            end
          end

          describe 'disabling a layout' do
            let(:enabled) { false }

            example_request 'Disable a layout of a folder' do
              assert_status 200
              expect(json_response_body).to include(
                {
                  data: {
                    id: layout.id,
                    type: 'content_builder_layout',
                    attributes: {
                      craftjs_json: {},
                      enabled: false,
                      code: code,
                      created_at: match(time_regex),
                      updated_at: match(time_regex)
                    }
                  }
                }
              )
              created_at = json_response_body.dig(:data, :attributes, :created_at)
              updated_at = json_response_body.dig(:data, :attributes, :updated_at)
              expect(updated_at).to be > created_at
            end
          end

          describe 'enabling a layout' do
            before { layout.update!(enabled: false) }

            let(:enabled) { true }

            example_request 'Enable a layout of a folder' do
              assert_status 200
              expect(json_response_body).to include(
                {
                  data: {
                    id: layout.id,
                    type: 'content_builder_layout',
                    attributes: {
                      craftjs_json: {},
                      enabled: true,
                      code: code,
                      created_at: match(time_regex),
                      updated_at: match(time_regex)
                    }
                  }
                }
              )
              created_at = json_response_body.dig(:data, :attributes, :created_at)
              updated_at = json_response_body.dig(:data, :attributes, :updated_at)
              expect(updated_at).to be > created_at
            end
          end
        end
      end
    end

    describe 'DELETE' do
      delete 'web_api/v1/project_folders/:folder_id/content_builder_layouts/:code' do
        context 'when the layout exists' do
          example_request 'Delete one layout by folder_id and code' do
            expect(status).to eq 200
          end
        end

        context 'when the folder does not exist' do
          let(:folder_id) { 'unknown' }

          example_request '[error] Try to delete a layout of a folder when the folder does not exist' do
            expect(status).to eq 404
          end
        end

        context 'when no layout with the given code exists for the given folder' do
          let(:code) { 'unknown' }

          example_request '[error] Try to delete a layout of a folder when the code is unknown' do
            expect(status).to eq 404
          end
        end
      end
    end
  end
end
