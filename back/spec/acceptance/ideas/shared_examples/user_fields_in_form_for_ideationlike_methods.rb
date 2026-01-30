# frozen_string_literal: true

# filepath: /Users/work/cl/citizenlab/back/spec/acceptance/ideas/shared_examples/user_fields_in_form_for_input_methods.rb

RSpec.shared_examples 'user fields in form for input methods' do
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
            title_multiloc: { 'en' => 'My Title' },
            body_multiloc: { 'en' => 'My Body' },
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
        expect(idea.title_multiloc).to eq({ 'en' => 'My Title' })
        expect(idea.body_multiloc).to eq({ 'en' => 'My Body' })
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
            title_multiloc: { 'en' => 'My Title' },
            body_multiloc: { 'en' => 'My Body' },
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
        expect(idea.title_multiloc).to eq({ 'en' => 'My Title' })
        expect(idea.body_multiloc).to eq({ 'en' => 'My Body' })

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
            title_multiloc: { 'en' => 'My Title' },
            body_multiloc: { 'en' => 'My Body' },
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
        expect(idea.title_multiloc).to eq({ 'en' => 'My Title' })
        expect(idea.body_multiloc).to eq({ 'en' => 'My Body' })

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
              title_multiloc: { 'en' => 'My Title' },
              body_multiloc: { 'en' => 'My Body' }
            }
          })

          assert_status 201
          expect(Idea.count).to eq 1
          idea = Idea.first
          expect(idea.custom_field_values).to eq({
            'u_select_field' => 'option2'
          })
          expect(idea.title_multiloc).to eq({ 'en' => 'My Title' })
          expect(idea.body_multiloc).to eq({ 'en' => 'My Body' })

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
              title_multiloc: { 'en' => 'My Title' },
              body_multiloc: { 'en' => 'My Body' },
              anonymous: true
            }
          })

          assert_status 201
          expect(Idea.count).to eq 1
          idea = Idea.first
          expect(idea.custom_field_values).to eq({})
          expect(idea.title_multiloc).to eq({ 'en' => 'My Title' })
          expect(idea.body_multiloc).to eq({ 'en' => 'My Body' })

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
              title_multiloc: { 'en' => 'My Title' },
              body_multiloc: { 'en' => 'My Body' },
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
          expect(idea.title_multiloc).to eq({ 'en' => 'My Title' })
          expect(idea.body_multiloc).to eq({ 'en' => 'My Body' })

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
              title_multiloc: { 'en' => 'My Title' },
              body_multiloc: { 'en' => 'My Body' },
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
          expect(idea.title_multiloc).to eq({ 'en' => 'My Title' })
          expect(idea.body_multiloc).to eq({ 'en' => 'My Body' })

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
