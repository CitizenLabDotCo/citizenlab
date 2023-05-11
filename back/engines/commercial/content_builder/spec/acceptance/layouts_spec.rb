# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ContentBuilderLayouts' do
  explanation 'Content builder layouts for projects.'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'when not authorized' do
    let(:user) { create(:user) }
    let(:layout) { create(:layout) }
    let(:project_id) { layout.content_buildable_id }
    let(:code) { layout.code }

    get 'web_api/v1/projects/:project_id/content_builder_layouts/:code' do
      example_request 'Get one layout by project_id and code' do
        expect(status).to eq 200

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

    context 'when the layout does not exist' do
      let(:layout) { create(:layout) }
      let(:project_id) { layout.content_buildable_id }
      let(:code) { 'unknown' }

      post 'web_api/v1/projects/:project_id/content_builder_layouts/:code/upsert' do
        example_request '[error] Try to create a layout for a project without authorization' do
          expect(status).to eq 401
        end
      end
    end

    context 'when the layout exists' do
      let(:layout) { create(:layout) }
      let(:project_id) { layout.content_buildable_id }
      let(:code) { layout.code }

      post 'web_api/v1/projects/:project_id/content_builder_layouts/:code/upsert' do
        example_request '[error] Try to update a layout of a project without authorization' do
          expect(status).to eq 401
        end
      end

      delete 'web_api/v1/projects/:project_id/content_builder_layouts/:code' do
        example_request '[error] Try to delete a layout of a project without authorization' do
          expect(status).to eq 401
        end
      end
    end
  end

  context 'when admin' do
    before { admin_header_token }

    describe 'GET' do
      context 'when the layout exists' do
        let(:layout) { create(:layout) }
        let(:project_id) { layout.content_buildable_id }
        let(:code) { layout.code }

        get 'web_api/v1/projects/:project_id/content_builder_layouts/:code' do
          example_request 'Get one layout by project_id and code' do
            expect(status).to eq 200
          end
        end
      end

      context 'when the project does not exist' do
        let(:layout) { create(:layout) }
        let(:project_id) { 'unknown' }
        let(:code) { layout.code }

        get 'web_api/v1/projects/:project_id/content_builder_layouts/:code' do
          example_request '[error] Try to get a layout of a project when the project does not exist' do
            expect(status).to eq 404
          end
        end
      end

      context 'when no layout with the given code exists for the given project' do
        let(:layout) { create(:layout) }
        let(:project_id) { layout.content_buildable_id }
        let(:code) { 'unknown' }

        get 'web_api/v1/projects/:project_id/content_builder_layouts/:code' do
          example_request '[error] Try to get a layout of a project when the code is unknown' do
            expect(status).to eq 404
          end
        end
      end
    end

    describe 'POST' do
      with_options scope: :content_builder_layout do
        parameter :enabled, 'Indicates that the layout is enabled.'
        parameter :craftjs_jsonmultiloc, 'The craftjs layout configuration, as a multiloc string.'
      end

      context 'when the project does not exist' do
        let(:layout) { create(:layout) }
        let(:project_id) { 'unknown' }
        let(:code) { layout.code }

        post 'web_api/v1/projects/:project_id/content_builder_layouts/:code/upsert' do
          example_request '[error] Try to upsert a layout for a project that does not exist' do
            expect(status).to eq 404
          end
        end
      end

      context 'when the layout does not exist' do
        let(:project) { create(:project) }
        let(:project_id) { project.id }
        let(:code) { 'project_description' }
        let(:enabled) { true }
        let :craftjs_jsonmultiloc do
          {
            'nl-BE': {
              ROOT: {
                type: {
                  resolvedName: 'Container'
                }
              }
            }
          }
        end

        post 'web_api/v1/projects/:project_id/content_builder_layouts/:code/upsert' do
          example_request 'Create a layout for a project' do
            expect(status).to eq 201
            json_response = json_parse(response_body)
            expect(json_response).to include(
              {
                data: {
                  id: be_a(String),
                  type: 'content_builder_layout',
                  attributes: {
                    craftjs_jsonmultiloc: {
                      'nl-BE': {
                        ROOT: {
                          type: {
                            resolvedName: 'Container'
                          }
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
      end

      context 'when the layout exists' do
        let(:layout) { create(:layout) }
        let(:project_id) { layout.content_buildable_id }
        let(:code) { layout.code }

        describe 'updating one locale' do
          let! :layout do
            create(:layout, craftjs_jsonmultiloc: { 'kl-GL': { ROOT: {} } })
          end
          let :craftjs_jsonmultiloc do
            {
              'da-DK': {
                ROOT: {
                  type: {
                    resolvedName: 'Container'
                  }
                }
              }
            }
          end

          post 'web_api/v1/projects/:project_id/content_builder_layouts/:code/upsert' do
            example_request 'Update one locale of a layout of a project' do
              expect(status).to eq 200
              json_response = json_parse(response_body)
              expect(json_response).to include(
                {
                  data: {
                    id: layout.id,
                    type: 'content_builder_layout',
                    attributes: {
                      craftjs_jsonmultiloc: {
                        'da-DK': {
                          ROOT: {
                            type: {
                              resolvedName: 'Container'
                            }
                          }
                        },
                        'kl-GL': {
                          ROOT: {}
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
              expect(updated_at).to be > created_at
            end
          end
        end

        describe 'updating multiple locales' do
          let! :layout do
            create(:layout)
          end
          let :craftjs_jsonmultiloc do
            {
              'nl-BE': {
                ROOT: {
                  type: {
                    resolvedName: 'Container'
                  }
                }
              },
              'kl-GL': {
                ROOT: {}
              }
            }
          end

          post 'web_api/v1/projects/:project_id/content_builder_layouts/:code/upsert' do
            example_request 'Update multiple locales of a layout of a project' do
              expect(status).to eq 200
              json_response = json_parse(response_body)
              expect(json_response).to include(
                {
                  data: {
                    id: layout.id,
                    type: 'content_builder_layout',
                    attributes: {
                      craftjs_jsonmultiloc: {
                        'nl-BE': {
                          ROOT: {
                            type: {
                              resolvedName: 'Container'
                            }
                          }
                        },
                        'kl-GL': {
                          ROOT: {}
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
              expect(updated_at).to be > created_at
            end
          end
        end

        describe 'disabling a layout' do
          let! :layout do
            create(
              :layout,
              craftjs_jsonmultiloc: { 'kl-GL': { ROOT: {} } }
            )
          end
          let(:enabled) { false }

          post 'web_api/v1/projects/:project_id/content_builder_layouts/:code/upsert' do
            example_request 'Disable a layout of a project' do
              expect(status).to eq 200
              json_response = json_parse(response_body)
              expect(json_response).to include(
                {
                  data: {
                    id: layout.id,
                    type: 'content_builder_layout',
                    attributes: {
                      craftjs_jsonmultiloc: {
                        'kl-GL': {
                          ROOT: {}
                        }
                      },
                      enabled: false,
                      code: code,
                      created_at: match(time_regex),
                      updated_at: match(time_regex)
                    }
                  }
                }
              )
              created_at = json_response.dig(:data, :attributes, :created_at)
              updated_at = json_response.dig(:data, :attributes, :updated_at)
              expect(updated_at).to be > created_at
            end
          end
        end

        describe 'enabling a layout' do
          let! :layout do
            create(
              :layout,
              enabled: false,
              craftjs_jsonmultiloc: { 'kl-GL': { ROOT: {} } }
            )
          end
          let(:enabled) { true }

          post 'web_api/v1/projects/:project_id/content_builder_layouts/:code/upsert' do
            example_request 'Enable a layout of a project' do
              expect(status).to eq 200
              json_response = json_parse(response_body)
              expect(json_response).to include(
                {
                  data: {
                    id: layout.id,
                    type: 'content_builder_layout',
                    attributes: {
                      craftjs_jsonmultiloc: {
                        'kl-GL': {
                          ROOT: {}
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
              expect(updated_at).to be > created_at
            end
          end
        end
      end
    end

    describe 'DELETE' do
      context 'when the layout exists' do
        let(:layout) { create(:layout) }
        let(:project_id) { layout.content_buildable_id }
        let(:code) { layout.code }

        delete 'web_api/v1/projects/:project_id/content_builder_layouts/:code' do
          example_request 'Delete one layout by project_id and code' do
            expect(status).to eq 200
          end
        end
      end

      context 'when the project does not exist' do
        let(:layout) { create(:layout) }
        let(:project_id) { 'unknown' }
        let(:code) { layout.code }

        delete 'web_api/v1/projects/:project_id/content_builder_layouts/:code' do
          example_request '[error] Try to delete a layout of a project when the project does not exist' do
            expect(status).to eq 404
          end
        end
      end

      context 'when no layout with the given code exists for the given project' do
        let(:layout) { create(:layout) }
        let(:project_id) { layout.content_buildable_id }
        let(:code) { 'unknown' }

        delete 'web_api/v1/projects/:project_id/content_builder_layouts/:code' do
          example_request '[error] Try to delete a layout of a project when the code is unknown' do
            expect(status).to eq 404
          end
        end
      end
    end
  end
end
