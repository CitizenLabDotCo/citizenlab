# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Proposals from citizens to the city.'

  let(:user) { create(:user) }

  before do
    header 'Content-Type', 'application/json'
    token = Knock::AuthToken.new(payload: user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"

    SettingsService.new.activate_feature! 'idea_custom_fields'
    SettingsService.new.activate_feature! 'dynamic_idea_form'
  end

  describe 'Create' do
    before do
      IdeaStatus.create_defaults
    end

    with_options scope: :idea do
      parameter :project_id, 'The identifier of the project that hosts the idea', extra: ''
      parameter :publication_status, 'Publication status', required: true, extra: "One of #{Post::PUBLICATION_STATUSES.join(',')}"
      parameter :title_multiloc, 'Multi-locale field with the idea title', required: true, extra: 'Maximum 100 characters'
      parameter :body_multiloc, 'Multi-locale field with the idea body', extra: 'Required if not draft'
      parameter :topic_ids, 'Array of ids of the associated topics'
      parameter :area_ids, 'Array of ids of the associated areas'
      parameter :custom_field_values, 'a json representing custom fields'
    end

    let(:idea) { build(:idea) }
    let(:project) { create(:continuous_project) }
    let(:project_id) { project.id }
    let(:publication_status) { 'published' }
    let(:title_multiloc) { idea.title_multiloc }
    let(:body_multiloc) { idea.body_multiloc }
    let(:topic_ids) { create_list(:topic, 2, projects: [project]).map(&:id) }
    let(:area_ids) { create_list(:area, 2).map(&:id) }

    context 'when the extra field is required' do
      let(:form) { create(:custom_form, project: project) }
      let!(:text_field) { create(:custom_field_extra_custom_form, required: true, resource: form) }

      context 'when the field value is given' do
        let(:custom_field_values) { { text_field.key => 'test value' } }

        post 'web_api/v1/ideas' do
          example_request 'Create an idea with an extra field' do
            assert_status 201
            json_response = json_parse(response_body)
            idea_from_db = Idea.find(json_response[:data][:id])
            expect(idea_from_db.custom_field_values.to_h).to match custom_field_values
          end
        end
      end

      context 'when the field value is not given' do
        let(:custom_field_values) { { text_field.key => nil } }

        post 'web_api/v1/ideas' do
          example_request 'Create an idea with an extra field' do
            assert_status 422
            json_response = json_parse(response_body)
            errors = json_response.dig(:errors, :custom_field_values)
            expect(errors.size).to eq 1
            expect(errors.first[:error]).to match %r{The property '#/' did not contain a required property of 'extra_field' in schema .+}
          end
        end
      end

      context 'when the field value is not valid' do
        let!(:select_field) { create :custom_field_select, :with_options, :for_custom_form, resource: form, required: false }
        let(:custom_field_values) { { text_field.key => 'test value', select_field.key => 'unknown_option' } }

        post 'web_api/v1/ideas' do
          example_request 'Create an idea with an invalid value for an extra field' do
            assert_status 422
            json_response = json_parse(response_body)
            errors = json_response.dig(:errors, :custom_field_values)
            expect(errors.size).to eq 1
            expect(errors.first[:error]).to match %r{The property '#/#{select_field.key}' value "unknown_option" did not match one of the following values: option1, option2 in schema .+}
          end
        end
      end
    end

    context 'when the extra field is optional' do
      before do
        create(:custom_field_extra_custom_form, required: false, resource: create(:custom_form, project: project))
      end

      context 'when the field value is given' do
        let(:custom_field_values) { { 'extra_field' => 'test value' } }

        post 'web_api/v1/ideas' do
          example_request 'Create an idea with an extra field' do
            assert_status 201
            json_response = json_parse(response_body)
            idea_from_db = Idea.find(json_response[:data][:id])
            expect(idea_from_db.custom_field_values.to_h).to match custom_field_values
          end
        end
      end

      context 'when the field value is not given' do
        let(:custom_field_values) { { 'extra_field' => nil } }

        post 'web_api/v1/ideas' do
          example_request 'Create an idea with an extra field' do
            assert_status 201
            json_response = json_parse(response_body)
            idea_from_db = Idea.find(json_response[:data][:id])
            expect(idea_from_db.custom_field_values.to_h).to eq({})
          end
        end
      end
    end
  end

  describe 'Update' do
    let(:project) { create(:continuous_project) }
    let(:form) { create(:custom_form, project: project) }
    let(:idea) { create(:idea, author: user, project: project, custom_field_values: { 'extra_field' => 'test value' }) }
    let(:id) { idea.id }

    with_options scope: :idea do
      parameter :custom_field_values, 'a json representing custom fields'
    end

    context 'when the extra field is required' do
      let!(:text_field) { create(:custom_field_extra_custom_form, required: true, resource: form) }

      context 'when the field value is given' do
        let(:custom_field_values) { { text_field.key => 'Changed Value' } }

        patch 'web_api/v1/ideas/:id' do
          example_request 'Update an idea with a required extra field' do
            assert_status 200
            json_response = json_parse(response_body)
            idea_from_db = Idea.find(json_response[:data][:id])
            expect(idea_from_db.custom_field_values.to_h).to match custom_field_values
          end
        end
      end

      context 'when the field value is cleared' do
        let(:custom_field_values) { { text_field.key => '' } }

        patch 'web_api/v1/ideas/:id' do
          example_request 'Clear a required extra field of an idea' do
            assert_status 422
            json_response = json_parse(response_body)
            errors = json_response.dig(:errors, :custom_field_values)
            expect(errors.size).to eq 1
            expect(errors.first[:error]).to match %r{The property '#/' did not contain a required property of 'extra_field' in schema .+}
          end
        end
      end

      context 'when the field value is given and another field value is added' do
        let!(:select_field) { create :custom_field_select, :with_options, :for_custom_form, resource: form, required: false }
        let(:custom_field_values) { { text_field.key => 'Changed Value', select_field.key => 'option1' } }

        patch 'web_api/v1/ideas/:id' do
          example_request 'Update an idea with a required extra field and add an extra field' do
            assert_status 200
            json_response = json_parse(response_body)
            idea_from_db = Idea.find(json_response[:data][:id])
            expect(idea_from_db.custom_field_values.to_h).to match custom_field_values
          end
        end
      end

      context 'when the field value is not given' do
        let(:custom_field_values) { { text_field.key => nil } }

        patch 'web_api/v1/ideas/:id' do
          example_request 'Update an idea with a required extra field' do
            assert_status 422
            json_response = json_parse(response_body)
            errors = json_response.dig(:errors, :custom_field_values)
            expect(errors.size).to eq 1
            expect(errors.first[:error]).to match %r{The property '#/' did not contain a required property of 'extra_field' in schema .+}
          end
        end
      end
    end

    context 'when the extra field is optional' do
      let!(:text_field) { create(:custom_field_extra_custom_form, required: false, resource: form) }

      context 'when the field value is given' do
        let(:custom_field_values) { { text_field.key => 'Changed Value' } }

        patch 'web_api/v1/ideas/:id' do
          example_request 'Update an idea with an optional extra field' do
            assert_status 200
            json_response = json_parse(response_body)
            idea_from_db = Idea.find(json_response[:data][:id])
            expect(idea_from_db.custom_field_values.to_h).to match custom_field_values
          end
        end
      end

      context 'when the field value is cleared' do
        let(:custom_field_values) { { text_field.key => '' } }

        patch 'web_api/v1/ideas/:id' do
          example_request 'Clear an optional extra field of an idea' do
            assert_status 200
            json_response = json_parse(response_body)
            idea_from_db = Idea.find(json_response[:data][:id])
            expect(idea_from_db.custom_field_values.to_h).to eq({})
          end
        end
      end
    end

    patch 'web_api/v1/ideas/:id' do
      with_options(scope: :idea) { parameter :project_id }

      let(:project) { create :project }
      let(:project_id) { project.id }

      example 'Moving an idea to a project with required custom custom field', document: false do
        user.add_role 'admin'
        user.save!
        form = create :custom_form, project: project
        create :custom_field, :for_custom_form, resource: form, required: true, input_type: 'number'
        do_request

        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
      end
    end
  end
end
