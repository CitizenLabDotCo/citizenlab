# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  before do
    header 'Content-Type', 'application/json'
    create(:idea_status_proposed)

    # Create project with form
    @project = create(:single_phase_native_survey_project, phase_attrs: { with_permissions: true })
    @phase = @project.phases.first
    @permission = @phase.permissions.find_by(action: 'posting_idea')
    @permission.update!(
      global_custom_fields: false
    )

    @custom_form = create(:custom_form, :with_default_fields, participation_context: @phase)
    @custom_field = @custom_form.custom_fields.find_by(input_type: 'select')

    # Create registration (demographic) question and
    # add to permission
    @user_select_field = create(
      :custom_field_select,
      :for_registration,
      :with_options,
      key: 'user_select_field',
      enabled: true
    )
    create(:permissions_custom_field, custom_field: @user_select_field, permission: @permission)
  end

  # This endpoint is used in the context of surveys in 3 situations:
  # 1. The user is a visitor and permitted_by is everyone.
  #   In this case, the whole survey gets submitted at once at the end in one POST request.
  # 2. The user is logged in and the survey has >1 page.
  #   In this case, the survey is submitted in multiple steps, with the first step being a POST request.
  #   After that, each request is a PATCH. Only the final PATCH publishes the idea.
  # 3. The user is logged in and the survey has exactly 1 page.
  #   In this case, the survey is submitted in one POST request and published immediately at
  #   after filling out the first page.
  #
  # In this POST block, we are going to focus on 1 and 3. Below, we will tackle 2
  post 'web_api/v1/ideas' do
    context 'when visitor and permitted_by is everyone' do
      before do
        @permission.update!(
          permitted_by: 'everyone'
        )
      end

      it 'stores values that have corresponding custom field in form' do
        do_request({
          idea: {
            publication_status: 'published',
            project_id: @project.id,
            @custom_field.key => 'option2',
            u_user_select_field: 'option1',
            u_nonexistent_field: 'whatever'
          }
        })

        assert_status 201
        expect(Idea.count).to eq 1
        expect(Idea.first.custom_field_values).to eq({
          @custom_field.key => 'option2',
          'u_user_select_field' => 'option1'
        })
      end
    end

    context 'when logged in and permitted_by is users and user_fields_in_form is false' do
      before do
        @permission.update!(
          permitted_by: 'users',
          user_fields_in_form: false
        )
        @user = create(:user, custom_field_values: { @user_select_field.key => 'option1' })
        header_token_for @user
      end

      context 'when user_data_collection is all_data' do
        before do
          @permission.update!(
            user_data_collection: 'all_data'
          )
        end

        it 'stores values from profile in idea, adds author_id' do
          do_request({
            idea: {
              publication_status: 'published',
              project_id: @project.id,
              @custom_field.key => 'option2'
            }
          })

          assert_status 201
          expect(Idea.count).to eq 1
          idea = Idea.first
          expect(idea.custom_field_values).to eq({
            @custom_field.key => 'option2',
            'u_user_select_field' => 'option1'
          })
          expect(idea.author_id).to eq(@user.id)
        end
      end

      context 'when user_data_collection is demographics_only' do
        before do
          @permission.update!(
            user_data_collection: 'demographics_only'
          )
        end

        it 'stores values from profile in idea, does not add author_id' do
          do_request({
            idea: {
              publication_status: 'published',
              project_id: @project.id,
              @custom_field.key => 'option2'
            }
          })

          assert_status 201
          expect(Idea.count).to eq 1
          idea = Idea.first
          expect(idea.custom_field_values).to eq({
            @custom_field.key => 'option2',
            'u_user_select_field' => 'option1'
          })
          expect(idea.author_id).to be_nil
        end
      end

      context 'when user_data_collection is anonymous' do
        before do
          @permission.update!(
            user_data_collection: 'anonymous'
          )
        end

        it 'does not store values from profile in idea, does not add author_id' do
          do_request({
            idea: {
              publication_status: 'published',
              project_id: @project.id,
              @custom_field.key => 'option2'
            }
          })

          assert_status 201
          expect(Idea.count).to eq 1
          idea = Idea.first
          expect(idea.custom_field_values).to eq({
            @custom_field.key => 'option2'
          })
          expect(idea.author_id).to be_nil
        end
      end
    end
  end

  patch 'web_api/v1/ideas/:id' do
    context 'when logged in and permitted_by is users and user_fields_in_form is true' do
      before do
        @permission.update!(
          permitted_by: 'users',
          user_fields_in_form: true
        )
        @user = create(:user)
        header_token_for @user
      end

      context 'when user_data_collection is all_data' do
        before do
          @permission.update!(
            user_data_collection: 'all_data'
          )
        end

        let(:idea) do
          create(
            :idea,
            author: @user,
            project: @project,
            creation_phase: @phase,
            phases: [@phase],
            custom_field_values: { @custom_field.key => 'option2' },
            publication_status: 'draft'
          )
        end
        let(:id) { idea.id }

        it 'updates the user profile with the provided custom field values and author_id' do
          create(:idea, custom_field_values: { @custom_field.key => 'option2' })
          do_request({
            idea: {
              publication_status: 'published',
              'u_user_select_field' => 'option1',
              @custom_field.key => 'option2'
            }
          })

          assert_status 200
          idea = Idea.find(id)
          expect(idea.reload.custom_field_values).to eq({
            @custom_field.key => 'option2',
            'u_user_select_field' => 'option1'
          })
          expect(idea.author_id).to eq(@user.id)
          user = User.find(@user.id)
          expect(user.reload.custom_field_values).to eq({
            'user_select_field' => 'option1'
          })
        end
      end

      context 'when user_data_collection is demographics_only' do
        before do
          @permission.update!(
            user_data_collection: 'demographics_only'
          )
        end

        let(:idea) do
          create(
            :idea,
            author: @user,
            project: @project,
            creation_phase: @phase,
            phases: [@phase],
            custom_field_values: { @custom_field.key => 'option2' },
            publication_status: 'draft'
          )
        end
        let(:id) { idea.id }

        it 'updates the user profile with the provided custom field values but not author_id' do
          create(:idea, custom_field_values: { @custom_field.key => 'option2' })
          do_request({
            idea: {
              publication_status: 'published',
              'u_user_select_field' => 'option1',
              @custom_field.key => 'option2'
            }
          })

          assert_status 200
          idea = Idea.find(id)
          expect(idea.reload.custom_field_values).to eq({
            @custom_field.key => 'option2',
            'u_user_select_field' => 'option1'
          })
          expect(idea.author_id).to be_nil
          user = User.find(@user.id)
          expect(user.reload.custom_field_values).to eq({
            'user_select_field' => 'option1'
          })
        end
      end
    end
  end
end
