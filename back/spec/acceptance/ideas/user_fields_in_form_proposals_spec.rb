# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  before do
    header 'Content-Type', 'application/json'
    # create(:idea_status_proposed)
    create(:proposals_status, code: 'proposed')
  end

  post 'web_api/v1/ideas' do
    before do
      # Create project with form
      @project = create(:single_phase_proposals_project, phase_attrs: { with_permissions: true })
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
        enabled: true
      )
      create(:permissions_custom_field, custom_field: @user_select_field, permission: @permission)
    end

    context 'permitted_by: everyone' do
      # If permission: everyone, the fields are always asked as last page of the form
      before do
        @permission.update!(permitted_by: 'everyone')
      end

      context 'when visitor' do
        it 'stores values in idea' do
          do_request({
            idea: {
              project_id: @project.id,
              title_multiloc: { 'en' => 'My Proposal Title' },
              body_multiloc: { 'en' => 'My Proposal Body' },
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
          expect(idea.title_multiloc).to eq({ 'en' => 'My Proposal Title' })
          expect(idea.body_multiloc).to eq({ 'en' => 'My Proposal Body' })
        end
      end

      context 'when logged in' do
        before do
          @user = create(:user)
          header_token_for @user
        end

        it 'stores values in idea and profile, adds author_id' do
          do_request({
            idea: {
              project_id: @project.id,
              title_multiloc: { 'en' => 'My Proposal Title' },
              body_multiloc: { 'en' => 'My Proposal Body' },
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
          expect(idea.title_multiloc).to eq({ 'en' => 'My Proposal Title' })
          expect(idea.body_multiloc).to eq({ 'en' => 'My Proposal Body' })

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

        it 'stores values in idea but not profile, does not add author_id' do
          do_request({
            idea: {
              project_id: @project.id,
              title_multiloc: { 'en' => 'My Proposal Title' },
              body_multiloc: { 'en' => 'My Proposal Body' },
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
          expect(idea.title_multiloc).to eq({ 'en' => 'My Proposal Title' })
          expect(idea.body_multiloc).to eq({ 'en' => 'My Proposal Body' })

          # Make sure user id is not linked to idea
          expect(idea.author_id).to be_nil

          # Make sure not stored in user profile
          user = User.find(@user.id)
          expect(user.custom_field_values).to eq({})
        end
      end
    end

    context 'permitted_by: users' do
      before do
        @permission.update!(permitted_by: 'users')
      end

      context 'user fields in reg flow' do
        before do
          @permission.update!(user_fields_in_form: false)
        end

        context 'when logged in' do
          before do
            @user = create(:user, custom_field_values: { select_field: 'option2' })
            header_token_for @user
          end

          it 'copies values from profile into idea' do
            do_request({
              idea: {
                project_id: @project.id,
                title_multiloc: { 'en' => 'My Proposal Title' },
                body_multiloc: { 'en' => 'My Proposal Body' },
              }
            })

            assert_status 201
            expect(Idea.count).to eq 1
            idea = Idea.first
            expect(idea.custom_field_values).to eq({
              'u_select_field' => 'option2'
            })
            expect(idea.title_multiloc).to eq({ 'en' => 'My Proposal Title' })
            expect(idea.body_multiloc).to eq({ 'en' => 'My Proposal Body' })

            # Make sure user id is linked to idea
            expect(idea.author_id).to eq(@user.id)
          end
        end

        context 'when logged in but anonymous' do
          before do
            @user = create(:user, custom_field_values: { select_field: 'option2' })
            header_token_for @user
            @phase.update!(allow_anonymous_participation: true)
          end

          it 'does not copy values from profile into idea' do
            do_request({
              idea: {
                project_id: @project.id,
                title_multiloc: { 'en' => 'My Proposal Title' },
                body_multiloc: { 'en' => 'My Proposal Body' },
                anonymous: true
              }
            })

            assert_status 201
            expect(Idea.count).to eq 1
            idea = Idea.first
            expect(idea.custom_field_values).to eq({})
            expect(idea.title_multiloc).to eq({ 'en' => 'My Proposal Title' })
            expect(idea.body_multiloc).to eq({ 'en' => 'My Proposal Body' })

            # Make sure user id is not linked to idea
            expect(idea.author_id).to be_nil
          end
        end
      end

      context 'user fields in form' do
        before do
          @permission.update!(user_fields_in_form: true)
        end

        context 'when logged in' do
          before do
            @user = create(:user)
            header_token_for @user
          end

          it 'stores values in idea and profile, adds author_id' do
            do_request({
              idea: {
                project_id: @project.id,
                title_multiloc: { 'en' => 'My Proposal Title' },
                body_multiloc: { 'en' => 'My Proposal Body' },
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
            expect(idea.title_multiloc).to eq({ 'en' => 'My Proposal Title' })
            expect(idea.body_multiloc).to eq({ 'en' => 'My Proposal Body' })

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

          it 'stores values in idea but not profile, does not add author_id' do
            do_request({
              idea: {
                publication_status: 'published',
                project_id: @project.id,
                title_multiloc: { 'en' => 'My Proposal Title' },
                body_multiloc: { 'en' => 'My Proposal Body' },
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
            expect(idea.title_multiloc).to eq({ 'en' => 'My Proposal Title' })
            expect(idea.body_multiloc).to eq({ 'en' => 'My Proposal Body' })

            # Make sure user id is not linked to idea
            expect(idea.author_id).to be_nil

            # Make sure not stored in user profile
            user = User.find(@user.id)
            expect(user.custom_field_values).to eq({})
          end
        end
      end
    end
  end
end
