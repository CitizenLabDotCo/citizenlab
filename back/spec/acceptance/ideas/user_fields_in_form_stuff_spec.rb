# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'A new file because the other ones are impossible to work with.'

  before do
    header 'Content-Type', 'application/json'
    create(:idea_status_proposed)
  end

  post 'web_api/v1/ideas' do
    context 'in a native survey phase' do
      context 'when visitor' do
        before do
          # Create project with form
          @project = create(:single_phase_native_survey_project, phase_attrs: { with_permissions: true })
          @project.phases.first.permissions.find_by(action: 'posting_idea').update!(
            permitted_by: 'everyone',
            global_custom_fields: false
          )

          @permission = @project.phases.first.permissions.find_by(action: 'posting_idea')
          @custom_form = create(:custom_form, :with_default_fields, participation_context: @project.phases.first)
          @custom_field = @custom_form.custom_fields.find_by(input_type: 'select')

          # Create registration (demographic) question and
          # add to permission
          @user_select_field = create(
            :custom_field_select,
            :for_registration,
            :with_options,
            key: 'select_field',
            enabled: true,
            title_multiloc: { 'en' => 'Select your gender' },
            description_multiloc: { 'en' => 'Please select your gender.' }
          )
          create(:permissions_custom_field, custom_field: @user_select_field, permission: @permission)
        end

        it 'stores custom field value if in form' do
          do_request({
            idea: {
              publication_status: 'published',
              project_id: @project.id,
              @custom_field.key => 'option2'
            }
          })

          assert_status 201
          expect(Idea.count).to eq 1
          expect(Idea.first.custom_field_values).to eq({
            @custom_field.key => 'option2'
          })
        end

        it 'does not store custom field value if not in form' do
          do_request({
            idea: {
              publication_status: 'published',
              project_id: @project.id,
              @custom_field.key => 'option2',
              another_key: 'Another value'
            }
          })

          assert_status 201
          expect(Idea.count).to eq 1
          expect(Idea.first.custom_field_values).to eq({
            @custom_field.key => 'option2'
          })
        end

        it 'does not store custom field value not in form, even if it starts with u_' do
          do_request({
            idea: {
              publication_status: 'published',
              project_id: @project.id,
              @custom_field.key => 'option2',
              u_gender: 'female'
            }
          })

          assert_status 201
          expect(Idea.count).to eq 1
          expect(Idea.first.custom_field_values).to eq({
            @custom_field.key => 'option2'
          })
        end

        it 'DOES store custom field value not in form, if it starts with u_ AND there is a corresponding permissions_custom_field' do
          do_request({
            idea: {
              publication_status: 'published',
              project_id: @project.id,
              @custom_field.key => 'option2',
              u_select_field: 'option1'
            }
          })

          assert_status 201
          expect(Idea.count).to eq 1
          expect(Idea.first.custom_field_values).to eq({
            @custom_field.key => 'option2',
            'u_select_field' => 'option1'
          })
        end
      end
    end
  end
end
