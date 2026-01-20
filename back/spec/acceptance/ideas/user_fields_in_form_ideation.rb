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
    before do
      SettingsService.new.activate_feature!('ideation_accountless_posting')

      # Create project with form
      @project = create(:single_phase_ideation_project, phase_attrs: { with_permissions: true })
      @phase = @project.phases.first
      @phase.permissions.find_by(action: 'posting_idea').update!(
        global_custom_fields: false
      )

      @permission = @phase.permissions.find_by(action: 'posting_idea')
      @custom_form = create(:custom_form, :with_default_fields, participation_context: @phase)

      # Create registration (demographic) question and
      # add to permission
      @user_select_field = create(
        :custom_field_select,
        :for_registration,
        :with_options,
        key: 'select_field',
        enabled: true,
      )
      create(:permissions_custom_field, custom_field: @user_select_field, permission: @permission)
    end

    context 'permission: everyone' do
      before do
        @permission.update!(permitted_by: 'everyone')
      end

      context 'when visitor' do
        it 'stores values that have corresponding custom field in form' do
          do_request({
            idea: {
              publication_status: 'published',
              project_id: @project.id,
              title_multiloc: { 'en' => 'My Idea Title' },
              body_multiloc: { 'en' => 'My Idea Body' },
              u_select_field: 'option1',
              u_nonexistent_field: 'whatever'
            }
          })

          assert_status 201
          expect(Idea.count).to eq 1
          idea = Idea.first
          expect(idea.custom_field_values).to eq({
            'u_select_field' => 'option1'
          })
          expect(idea.title_multiloc).to eq({ 'en' => 'My Idea Title' })
          expect(idea.body_multiloc).to eq({ 'en' => 'My Idea Body' })
        end
      end

      context 'when logged in' do
        before do
          @user = create(:user)
          header_token_for @user
        end

        it 'stores values that have corresponding custom field in form' do
          do_request({
            idea: {
              publication_status: 'published',
              project_id: @project.id,
              title_multiloc: { 'en' => 'My Idea Title' },
              body_multiloc: { 'en' => 'My Idea Body' },
              u_select_field: 'option1',
              u_nonexistent_field: 'whatever'
            }
          })

          assert_status 201
          expect(Idea.count).to eq 1
          idea = Idea.first
          expect(idea.custom_field_values).to eq({
            'u_select_field' => 'option1'
          })
          expect(idea.title_multiloc).to eq({ 'en' => 'My Idea Title' })
          expect(idea.body_multiloc).to eq({ 'en' => 'My Idea Body' })

          # Make sure user id is linked to idea
          expect(idea.author_id).to eq(@user.id)

          # Make sure also stored in user profile
          user = User.find(@user.id)
          expect(user.custom_field_values).to eq({
            'select_field' => 'option1'
          })
        end
      end

      context 'when logged in but anonymous' do
        before do
          @user = create(:user)
          header_token_for @user
          @phase.update!(allow_anonymous_participation: true)
        end

        it 'stores values that have corresponding custom field in form' do
          do_request({
            idea: {
              publication_status: 'published',
              project_id: @project.id,
              title_multiloc: { 'en' => 'My Idea Title' },
              body_multiloc: { 'en' => 'My Idea Body' },
              u_select_field: 'option1',
              u_nonexistent_field: 'whatever',
              anonymous: true
            }
          })

          assert_status 201
          expect(Idea.count).to eq 1
          idea = Idea.first
          expect(idea.custom_field_values).to eq({
            'u_select_field' => 'option1'
          })
          expect(idea.title_multiloc).to eq({ 'en' => 'My Idea Title' })
          expect(idea.body_multiloc).to eq({ 'en' => 'My Idea Body' })

          # Make sure user id is not linked to idea
          expect(idea.author_id).to be(nil)

          # Make sure not stored in user profile
          user = User.find(@user.id)
          expect(user.custom_field_values).to eq({})
        end
      end
    end
  end
end
