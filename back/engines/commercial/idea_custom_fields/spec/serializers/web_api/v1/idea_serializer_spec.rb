# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::IdeaSerializer do
  context 'custom_field_values' do
    it 'leaves out hidden and disabled fields' do
      SettingsService.new.activate_feature! 'idea_custom_fields'

      project = create :project
      form = create :custom_form, project: project
      visible_field = create :custom_field, :for_custom_form, resource: form, enabled: true, hidden: false, input_type: 'number'
      disabled_field = create :custom_field, :for_custom_form, resource: form, enabled: false, hidden: false, input_type: 'number'
      hidden_field = create :custom_field, :for_custom_form, resource: form, enabled: true, hidden: true, input_type: 'number'
      custom_field_values = { visible_field.key => 1, disabled_field.key => 2, hidden_field.key => 3 }
      idea = create :idea, project: project, custom_field_values: custom_field_values

      output = described_class.new(idea, params: { current_user: create(:user) }).serializable_hash
      expect(output.dig(:data, :attributes, :custom_field_values)).to eq({ visible_field.key => 1 })
    end
  end
end
