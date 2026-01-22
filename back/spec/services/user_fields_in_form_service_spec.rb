# frozen_string_literal: true

require 'rails_helper'

describe UserFieldsInFormService do
  describe '#should_merge_user_fields_into_idea?' do
    context 'native survey' do
      before do
        @user = create(:user, { custom_field_values: { age: 30 } })
        @project = create(:single_phase_native_survey_project, phase_attrs: {
          with_permissions: true
        })
        @phase = @project.phases.first

        @permission = @phase.permissions.find_by(action: 'posting_idea')
        @permission.update!(global_custom_fields: false, user_fields_in_form: false, user_data_collection: 'all_data')
        create(:permissions_custom_field, permission: @permission, custom_field: create(:custom_field, key: 'age'))

        @idea = create(:idea, author: @user, custom_field_values: {})
      end

      it 'returns true when all conditions are met' do
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be true
      end

      it 'returns false if user is not the author of the idea' do
        idea = create(:idea, author: create(:user), custom_field_values: {})
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, idea)).to be false
      end

      it 'returns false if user fields are in form' do
        @permission.update!(user_fields_in_form: true)
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be false
      end

      it 'returns false if user_data_collection is set to anonymous' do
        @permission.update!(user_data_collection: 'anonymous')
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be false
      end
    end

    context 'ideation' do
      before do
        @user = create(:user, { custom_field_values: { age: 30 } })
        @project = create(:single_phase_ideation_project, phase_attrs: {
          with_permissions: true
        })
        @phase = @project.phases.first

        @permission = @phase.permissions.find_by(action: 'posting_idea')
        @permission.update!(global_custom_fields: false, user_fields_in_form: false, user_data_collection: 'all_data')
        create(:permissions_custom_field, permission: @permission, custom_field: create(:custom_field, key: 'age'))

        @idea = create(:idea, author: @user, custom_field_values: {})
      end

      it 'returns true when all conditions are met' do
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be true
      end

      it 'returns false if user is not the author of the idea' do
        idea = create(:idea, author: create(:user), custom_field_values: {})
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, idea)).to be false
      end

      it 'returns true if user_data_collection is set to anonymous (attribute should be ignored)' do
        # This attribute is only used in surveys and should always be `all_data` in ideation.
        # However, since we support changing participation methods, it might be that someone
        # switched from a survey with user_data_collection: 'anonymous' or whatever.
        # So just adding this check to be sure it really gets ignored.
        @permission.update!(user_data_collection: 'anonymous')
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be true
      end

      it 'returns false if user is anonymous' do
        @idea.update!(anonymous: true)
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be false
      end
    end
  end

  describe '#merge_user_fields_into_idea' do
    before do
      @phase = create(:native_survey_phase, with_permissions: true)
      permission = @phase.permissions.find_by(action: 'posting_idea')
      permission.update!(global_custom_fields: false)
      create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field, key: 'age'))
      create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field, key: 'city'))
    end

    it 'merges user custom fields into idea custom fields with prefixed keys' do
      user = build(:user, custom_field_values: { 'age' => 30, 'city' => 'New York' })
      idea = build(:idea, custom_field_values: { 'satisfaction' => 'high' })

      merged_values = described_class.merge_user_fields_into_idea(
        user,
        @phase,
        idea.custom_field_values
      )

      expect(merged_values).to eq({
        'u_age' => 30,
        'u_city' => 'New York',
        'satisfaction' => 'high'
      })
    end

    it 'does not include user fields that are not explicitly asked' do
      user = build(:user, custom_field_values: { 'age' => 30, 'city' => 'New York', 'gender' => 'female' })
      idea = build(:idea, custom_field_values: { 'satisfaction' => 'high' })

      merged_values = described_class.merge_user_fields_into_idea(
        user,
        @phase,
        idea.custom_field_values
      )

      expect(merged_values).to eq({
        'u_age' => 30,
        'u_city' => 'New York',
        'satisfaction' => 'high'
      })
    end

    it 'pre-populates user fields when using global_custom_fields being the default' do
      user = build(:user, custom_field_values: { 'age' => 30, 'city' => 'New York' })
      idea = build(:idea, custom_field_values: {})

      phase = create(:native_survey_phase, with_permissions: true)

      merged_values = described_class.merge_user_fields_into_idea(
        user,
        phase,
        idea.custom_field_values
      )

      # Should include user fields even though permissions_custom_fields are not persisted to database
      expect(merged_values).to eq({
        'u_age' => 30,
        'u_city' => 'New York'
      })
    end
  end

  describe '#should_merge_user_fields_from_idea_into_user?' do
    context 'native survey' do
      before do
        @user = create(:user, { custom_field_values: { age: 30 } })
        @project = create(:single_phase_native_survey_project, phase_attrs: {
          with_permissions: true
        })
        @phase = @project.phases.first

        @permission = @phase.permissions.find_by(action: 'posting_idea')
        @permission.update!(global_custom_fields: false, user_fields_in_form: true, user_data_collection: 'all_data')
        create(:permissions_custom_field, permission: @permission, custom_field: create(:custom_field, key: 'age'))

        @idea = create(
          :idea,
          author: @user,
          custom_field_values: {},
          project: @project,
          creation_phase: @phase
        )
      end

      it 'returns true when all conditions are met' do
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be true
      end

      it 'returns false if user is not the author of the idea' do
        idea = create(
          :idea,
          author: create(:user),
          custom_field_values: {},
          project: @project,
          creation_phase: @phase
        )
        expect(described_class.should_merge_user_fields_from_idea_into_user?(idea, @user, @phase)).to be false
      end

      it 'returns false if user fields are in not form' do
        @permission.update!(user_fields_in_form: false)
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be false
      end

      it 'returns false if user_data_collection is set to anonymous' do
        @permission.update!(user_data_collection: 'anonymous')
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be false
      end

      it 'returns true if user_data_collection is set to demographics_only' do
        @permission.update!(user_data_collection: 'demographics_only')
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be true
      end
    end

    context 'ideation' do
      before do
        @user = create(:user, { custom_field_values: { age: 30 } })
        @project = create(:single_phase_ideation_project, phase_attrs: {
          with_permissions: true
        })
        @phase = @project.phases.first

        @permission = @phase.permissions.find_by(action: 'posting_idea')
        @permission.update!(global_custom_fields: false, user_fields_in_form: true, user_data_collection: 'all_data')
        create(:permissions_custom_field, permission: @permission, custom_field: create(:custom_field, key: 'age'))

        @idea = create(
          :idea,
          author: @user,
          custom_field_values: {},
          project: @project
        )
      end

      it 'returns true when all conditions are met' do
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be true
      end

      it 'returns false if user is not the author of the idea' do
        idea = create(
          :idea,
          author: create(:user),
          custom_field_values: {},
          project: @project
        )
        expect(described_class.should_merge_user_fields_from_idea_into_user?(idea, @user, @phase)).to be false
      end

      it 'returns false if user fields are in not form' do
        @permission.update!(user_fields_in_form: false)
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be false
      end

      it 'returns true if user_data_collection is set to anonymous (attribute should be ignored)' do
        # This attribute is only used in surveys and should always be `all_data` in ideation.
        # However, since we support changing participation methods, it might be that someone
        # switched from a survey with user_data_collection: 'anonymous' or whatever.
        # So just adding this check to be sure it really gets ignored.
        @permission.update!(user_data_collection: 'anonymous')
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be true
      end
    end
  end

  describe '#merge_user_fields_from_idea_into_user!' do
    it 'merges user fields from idea into user' do
      user = build(:user, custom_field_values: { 'city' => 'New York' })
      idea = build(:idea, custom_field_values: { 'satisfaction' => 'high', 'u_age' => 30 })

      described_class.merge_user_fields_from_idea_into_user!(idea, user)
      expect(user.custom_field_values).to include('city' => 'New York', 'age' => 30)
    end

    it 'overwrites user fields if they already exist' do
      user = build(:user, custom_field_values: { 'age' => 25 })
      idea = build(:idea, custom_field_values: { 'satisfaction' => 'high', 'u_age' => 30 })

      described_class.merge_user_fields_from_idea_into_user!(idea, user)
      expect(user.custom_field_values).to include('age' => 30)
    end
  end

  describe '#add_user_fields_to_form' do
    it 'adds user custom fields to the form with prefixed keys' do
      project = create(:single_phase_native_survey_project, phase_attrs: {
        with_permissions: true
      })
      phase = project.phases.first

      # Create permission with user custom field
      permission = phase.permissions.find_by(action: 'posting_idea')
      permission.update!(global_custom_fields: false, user_fields_in_form: true)
      create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field, key: 'age'))

      # Create survey form
      custom_form = create(:custom_form, :with_default_fields, participation_context: phase)
      create(:custom_field_page, resource: custom_form)
      select_field = create(:custom_field_select, resource: custom_form)
      create(:custom_field_option, custom_field: select_field)
      create(:custom_field_page, resource: custom_form)
      create(:custom_field_text, resource: custom_form)
      create(:custom_field_matrix_linear_scale, resource: custom_form)
      create(:custom_field_form_end_page, resource: custom_form)

      fields = custom_form.custom_fields
      participation_method = phase.pmethod

      updated_fields = described_class.add_user_fields_to_form(
        fields,
        participation_method,
        custom_form
      )

      keys = updated_fields.pluck(:key)
      expect(keys.slice(keys.length - 3, keys.length)).to eq(%w[
        user_page
        u_age
        form_end
      ])
    end
  end
end
