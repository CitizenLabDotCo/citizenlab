# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Proposals from citizens to the city.'

  let(:user) { create(:user) }

  before do
    header 'Content-Type', 'application/json'
    header_token_for user
  end

  describe 'Create' do
    before { create(:idea_status_proposed) }

    with_options scope: :idea do
      parameter :project_id, 'The identifier of the project that hosts the idea', extra: ''
      parameter :publication_status, 'Publication status', required: true, extra: "One of #{Idea::PUBLICATION_STATUSES.join(',')}"
      parameter :title_multiloc, 'Multi-locale field with the idea title', required: true, extra: 'Maximum 100 characters'
      parameter :body_multiloc, 'Multi-locale field with the idea body', extra: 'Required if not draft'
      parameter :input_topic_ids, 'Array of ids of the associated input topics'
      parameter :area_ids, 'Array of ids of the associated areas'
      parameter :custom_field_name1, 'A value for one custom field'
    end

    let(:idea) { build(:idea) }
    let(:project) { create(:single_phase_ideation_project) }
    let(:project_id) { project.id }
    let(:publication_status) { 'published' }
    let(:title_multiloc) { idea.title_multiloc }
    let(:body_multiloc) { idea.body_multiloc }
    let(:input_topic_ids) { create_list(:input_topic, 2, project:).map(&:id) }
    let(:area_ids) { create_list(:area, 2).map(&:id) }
    let(:extra_field_name) { 'custom_field_name1' }

    context 'when the extra field is required' do
      let(:form) { create(:custom_form, :with_default_fields, participation_context: project) }

      context 'when the field value is given' do
        # TODO: Refactoring
        # - Validate input types in params + spec (can't create html_multiloc field in ideation or native survey)
        post 'web_api/v1/ideas' do
          [
            { factory: :custom_field_number, value: 42 },
            { factory: :custom_field_linear_scale, value: 3 },
            { factory: :custom_field_text, value: 'test value' },
            { factory: :custom_field_multiline_text, value: 'test value' },
            { factory: :custom_field_select, options: [:with_options], value: 'option1' },
            { factory: :custom_field_multiselect, options: [:with_options], value: %w[option1 option2] },
            { factory: :custom_field_multiselect_image, options: [:with_options], value: %w[image1] },
            { factory: :custom_field_html_multiloc, value: { 'fr-FR' => '<p>test value</p>' } } # This field is not supported but rarely occurs on production, because it was possible at some point to make a copy of the description field.
          ].each do |field_desc|
            describe do
              let!(:extra_field) { create(field_desc[:factory], key: extra_field_name, required: true, resource: form) }
              let(:custom_field_name1) { field_desc[:value] }

              example_request "Create an idea with a #{field_desc[:factory]} field" do
                assert_status 201
                json_response = json_parse(response_body)
                idea_from_db = Idea.find(json_response[:data][:id])
                expect(idea_from_db.custom_field_values).to eq({
                  extra_field_name => field_desc[:value]
                })
              end
            end
          end
        end
      end

      context 'when the field value is not given', skip: 'Cannot be implemented yet' do
        let(:custom_field_name1) { nil }

        post 'web_api/v1/ideas' do
          example_request 'Create an idea with an extra field' do
            assert_status 422
            json_response = json_parse(response_body)
            errors = json_response.dig(:errors, extra_field_name.to_sym)
            expect(errors.size).to eq 1
            expect(errors.first[:error]).to eq(
              "The property '#/#{extra_field_name}' of type null did not match the following type: string"
            )
          end
        end
      end

      context 'when the field value is not valid', skip: 'Cannot be implemented yet' do
        let!(:select_field) { create(:custom_field_select, :with_options, :for_custom_form, key: 'custom_field_name2', resource: form, required: false) }
        let(:custom_field_name1) { 'test value' }
        let(:custom_field_name2) { 'unknown_option' }

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
        form = create(:custom_form, :with_default_fields, participation_context: project)
        create(:custom_field, key: extra_field_name, required: false, resource: form)
      end

      context 'when the field value is given' do
        let(:custom_field_name1) { 'test value' }

        post 'web_api/v1/ideas' do
          example_request 'Create an idea with an extra field' do
            assert_status 201
            json_response = json_parse(response_body)
            idea_from_db = Idea.find(json_response[:data][:id])
            expect(idea_from_db.custom_field_values.to_h).to eq({
              extra_field_name => 'test value'
            })
          end
        end
      end

      context 'when the field value is not given' do
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
    let(:project) { create(:single_phase_ideation_project) }
    let(:form) { create(:custom_form, :with_default_fields, participation_context: project) }
    let(:idea) { create(:idea, author: user, project: project, custom_field_values: { extra_field_name1 => 'test value' }) }
    let(:id) { idea.id }
    let(:extra_field_name1) { 'custom_field_name1' }
    let(:extra_field_name2) { 'custom_field_name2' }

    with_options scope: :idea do
      parameter :custom_field_name1, 'A value for one custom field'
      parameter :custom_field_name2, 'A value for another custom field'
    end

    context 'when the extra field is required' do
      let!(:text_field) { create(:custom_field, key: extra_field_name1, required: true, resource: form) }
      let(:custom_field_name1) { 'Changed Value' }

      context 'when the field value is given' do
        patch 'web_api/v1/ideas/:id' do
          example_request 'Update an idea with a required extra field' do
            assert_status 200
            json_response = json_parse(response_body)
            idea_from_db = Idea.find(json_response[:data][:id])
            expect(idea_from_db.custom_field_values.to_h).to eq({
              extra_field_name1 => 'Changed Value'
            })
          end
        end
      end

      context 'when the field value is cleared', skip: 'Cannot be implemented yet' do
        let(:custom_field_values) { { extra_field_name1 => '' } }

        patch 'web_api/v1/ideas/:id' do
          example_request 'Clear a required extra field of an idea' do
            assert_status 422
            json_response = json_parse(response_body)
            errors = json_response.dig(:errors, extra_field_name.to_sym)
            expect(errors.size).to eq 1
            expect(errors.first[:error]).to match %r{The property '#/' did not contain a required property of '#{extra_field_name}' in schema .+}
          end
        end
      end

      context 'when the field value is given and another field value is added' do
        let!(:select_field) { create(:custom_field_select, :with_options, :for_custom_form, key: extra_field_name2, resource: form, required: false) }
        let(:custom_field_name2) { 'option1' }

        patch 'web_api/v1/ideas/:id' do
          example_request 'Update an idea with a required extra field and add an extra field' do
            assert_status 200
            json_response = json_parse(response_body)
            idea_from_db = Idea.find(json_response[:data][:id])
            expect(idea_from_db.custom_field_values.to_h).to eq({
              extra_field_name1 => 'Changed Value',
              extra_field_name2 => 'option1'
            })
          end
        end
      end

      context 'when the field value is not given', skip: 'Cannot be implemented yet' do
        patch 'web_api/v1/ideas/:id' do
          example_request 'Update an idea with a required extra field' do
            assert_status 422
            json_response = json_parse(response_body)
            errors = json_response.dig(:errors, extra_field_name.to_sym)
            expect(errors.size).to eq 1
            expect(errors.first[:error]).to match %r{The property '#/' did not contain a required property of '#{extra_field_name}' in schema .+}
          end
        end
      end
    end

    context 'when the extra field is optional' do
      let!(:text_field) { create(:custom_field, key: extra_field_name1, required: false, resource: form) }

      context 'when the field value is given' do
        let(:custom_field_name1) { 'Changed Value' }

        patch 'web_api/v1/ideas/:id' do
          example_request 'Update an idea with an optional extra field' do
            assert_status 200
            json_response = json_parse(response_body)
            idea_from_db = Idea.find(json_response[:data][:id])
            expect(idea_from_db.custom_field_values.to_h).to eq({
              extra_field_name1 => 'Changed Value'
            })
          end
        end
      end

      context 'when the field value is cleared' do
        let(:custom_field_name1) { '' }

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

      let(:project) { create(:project) }
      let(:project_id) { project.id }

      example 'Moving an idea to a project with required custom custom field', document: false do
        user.add_role 'admin'
        user.save!
        form = create(:custom_form, participation_context: project)
        create(:custom_field, :for_custom_form, resource: form, required: true, input_type: 'number')
        do_request

        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
      end
    end
  end
end
