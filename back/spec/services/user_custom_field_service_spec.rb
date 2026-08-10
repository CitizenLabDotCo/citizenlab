# frozen_string_literal: true

require 'rails_helper'

describe UserCustomFieldService do
  let(:service) { described_class.new }

  describe 'delete_custom_field_values' do
    it 'deletes the custom field values from all users' do
      cf1 = create(:custom_field)
      cf2 = create(:custom_field)
      create_list(:user, 5, custom_field_values: { cf1.key => 'some_value', cf2.key => 'other_value' })
      create_list(:user, 5)
      service.delete_custom_field_values(cf1)
      expect(User.all.map { |u| u.custom_field_values.keys }.flatten).to include(cf2.key)
      expect(User.all.map { |u| u.custom_field_values.keys }.flatten).not_to include(cf1.key)
    end

    it 'deletes the values that a user field stored on inputs through user fields in form' do
      field = create(:custom_field, key: 'the_field')
      user = create(:user, custom_field_values: { 'the_field' => 'gone' })
      input = create(:idea, custom_field_values: { 'u_the_field' => 'gone', 'other_field' => 'stays' })

      service.delete_custom_field_values(field)

      expect(user.reload.custom_field_values).to eq({})
      expect(input.reload.custom_field_values).to eq({ 'other_field' => 'stays' })
    end

    it 'deletes the values of a phase-level form field from the inputs of its phase' do
      phase = create(:single_phase_native_survey_project).phases.first
      form = create(:custom_form, participation_context: phase)
      field = create(:custom_field_text, resource: form, key: 'extra_field')
      input = create(
        :idea,
        project: phase.project,
        creation_phase: phase,
        custom_field_values: { 'extra_field' => 'gone', 'another_field' => 'stays' }
      )

      service.delete_custom_field_values(field)

      expect(input.reload.custom_field_values).to eq({ 'another_field' => 'stays' })
    end

    it 'does not delete values of inputs in other participation contexts with the same field key' do
      other_phase = create(:single_phase_native_survey_project).phases.first
      create(:custom_form, participation_context: other_phase)
      other_input = create(
        :idea,
        project: other_phase.project,
        creation_phase: other_phase,
        custom_field_values: { 'extra_field' => 'stays' }
      )

      phase = create(:single_phase_native_survey_project).phases.first
      form = create(:custom_form, participation_context: phase)
      field = create(:custom_field_text, resource: form, key: 'extra_field')

      service.delete_custom_field_values(field)

      expect(other_input.reload.custom_field_values).to eq({ 'extra_field' => 'stays' })
    end
  end

  describe 'delete_custom_field_option_values' do
    it 'deletes the custom field option values from all users for a multiselect' do
      cf1 = create(:custom_field_multiselect)
      cfo1 = create(:custom_field_option, custom_field: cf1)
      cfo2 = create(:custom_field_option, custom_field: cf1)
      cf2 = create(:custom_field_select)
      cfo3 = create(:custom_field_option, custom_field: cf2)
      v1 = { cf1.key => [cfo1.key], cf2.key => cfo3.key }
      u1 = create(:user, custom_field_values: v1)
      v2 = { cf1.key => [cfo1.key, cfo2.key] }
      u2 = create(:user, custom_field_values: v2)
      v3 = { cf1.key => [cfo2.key] }
      u3 = create(:user, custom_field_values: v3)

      service.delete_custom_field_option_values(cfo1.key, cfo1.custom_field)

      expect(u1.reload.custom_field_values).to eq({ cf2.key => cfo3.key })
      expect(u2.reload.custom_field_values).to eq({ cf1.key => [cfo2.key] })
      expect(u3.reload.custom_field_values).to eq v3
    end

    it 'deletes the custom field option values from all users for a single select' do
      cf1 = create(:custom_field_select)
      cfo1 = create(:custom_field_option, custom_field: cf1)
      cfo2 = create(:custom_field_option, custom_field: cf1)
      v1 = { cf1.key => cfo1.key }
      u1 = create(:user, custom_field_values: v1)
      v2 = { cf1.key => cfo2.key }
      u2 = create(:user, custom_field_values: v2)

      service.delete_custom_field_option_values(cfo1.key, cfo1.custom_field)

      expect(u1.reload.custom_field_values).to eq({})
      expect(u2.reload.custom_field_values).to eq v2
    end
  end
end
