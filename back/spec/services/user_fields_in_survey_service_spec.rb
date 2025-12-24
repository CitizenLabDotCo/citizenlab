# frozen_string_literal: true

require 'rails_helper'

describe UserFieldsInSurveyService do
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

  describe '#should_merge_user_fields_into_idea?' do
    it 'returns true when all conditions are met' do
      user = build(:user, { custom_field_values: { age: 30 } })
      project = create(:single_phase_native_survey_project, phase_attrs: {
        with_permissions: true
      })
      phase = project.phases.first

      idea = build(:idea, author: user, custom_field_values: {})

      permission = phase.permissions.find_by(action: 'posting_idea')
      permission.update!(global_custom_fields: false, user_fields_in_form: false, user_data_collection: 'all_data')
      create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field, key: 'age'))

      expect(described_class.should_merge_user_fields_into_idea?(user, phase, idea)).to be true
    end
  end
end
