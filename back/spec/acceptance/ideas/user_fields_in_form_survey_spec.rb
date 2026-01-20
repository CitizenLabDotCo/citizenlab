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
    context 'when visitor and permitted_by is everyone' do
      # For surveys, this is the only case where we use the POST endpoint to submit
      # the whole survey at once. In all other cases we first create the idea
      # when we submit the first page, and every subsequent page is an UPDATE.

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
          enabled: true
        )
        create(:permissions_custom_field, custom_field: @user_select_field, permission: @permission)
      end

      it 'stores values that have corresponding custom field in form' do
        do_request({
          idea: {
            publication_status: 'published',
            project_id: @project.id,
            @custom_field.key => 'option2',
            u_select_field: 'option1',
            u_nonexistent_field: 'whatever'
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
