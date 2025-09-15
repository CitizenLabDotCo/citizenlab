# frozen_string_literal: true

require 'rails_helper'

describe UserFieldsInSurveyService do
  describe '#merge_user_fields_into_idea' do
    it 'merges user custom fields into idea custom fields with prefixed keys' do
      user = build(:user, custom_field_values: { 'age' => 30, 'city' => 'New York' })
      idea = build(:idea, custom_field_values: { 'satisfaction' => 'high' })

      merged_values = UserFieldsInSurveyService.merge_user_fields_into_idea(user, idea)

      expect(merged_values).to eq({
        'u_age' => 30,
        'u_city' => 'New York',
        'satisfaction' => 'high'
      })
    end
  end
end
