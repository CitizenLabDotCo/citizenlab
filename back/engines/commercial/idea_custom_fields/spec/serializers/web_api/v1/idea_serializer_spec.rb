# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::IdeaSerializer do
  context 'with custom_field_values' do
    describe '#serializable_hash' do
      let(:project) { create :project }
      let(:form) { create :custom_form, participation_context: project }
      let(:visible_field_value) { 1 }
      let(:visible_field) { create :custom_field, :for_custom_form, resource: form, enabled: true, input_type: 'number' }
      let(:disabled_field) { create :custom_field, :for_custom_form, resource: form, enabled: false, input_type: 'number' }
      let(:custom_field_values) { { visible_field.key => visible_field_value, disabled_field.key => 2 } }
      let(:idea) { create :idea, project: project, custom_field_values: custom_field_values }

      it 'serializes all visible extra fields at the same level of the idea fields' do
        SettingsService.new.activate_feature! 'idea_custom_fields'

        output = described_class.new(idea, params: { current_user: create(:user) }).serializable_hash
        expect(output.dig(:data, :attributes, visible_field.key.to_sym)).to eq visible_field_value
        expect(output.dig(:data, :attributes)).not_to have_key disabled_field.key
        expect(output.dig(:data, :attributes)).not_to have_key :custom_field_values
      end
    end
  end
end
