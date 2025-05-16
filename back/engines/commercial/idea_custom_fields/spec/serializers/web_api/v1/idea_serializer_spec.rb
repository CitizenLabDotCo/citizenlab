# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::IdeaSerializer do
  context 'with custom_field_values' do
    describe '#serializable_hash' do
      let(:project) { create(:project) }
      let(:form) { create(:custom_form, participation_context: project) }

      let(:visible_public_field) { create(:custom_field, :for_custom_form, resource: form, enabled: true, input_type: 'number', code: 'proposed_budget') }
      let(:visible_admin_field) { create(:custom_field, :for_custom_form, resource: form, enabled: true, input_type: 'number') }
      let(:disabled_field) { create(:custom_field, :for_custom_form, resource: form, enabled: false, input_type: 'number') }

      let(:visible_public_value) { 1 }
      let(:visible_admin_value) { 2 }
      let(:disabled_value) { 3 }

      let(:custom_field_values) do
        {
          visible_public_field.key => visible_public_value,
          visible_admin_field.key => visible_admin_value,
          disabled_field.key => disabled_value
        }
      end
      let(:idea_author) { create(:user) }
      let(:idea) { create(:idea, project: project, custom_field_values: custom_field_values, author: idea_author) }

      it 'serializes all visible extra fields at the same level as the idea fields for the idea author' do
        output = described_class.new(idea, params: { current_user: idea_author }).serializable_hash
        expect(output.dig(:data, :attributes, visible_public_field.key.to_sym)).to eq visible_public_value
        expect(output.dig(:data, :attributes, visible_admin_field.key.to_sym)).to eq visible_admin_value
        expect(output.dig(:data, :attributes)).not_to have_key disabled_field.key.to_sym
        expect(output.dig(:data, :attributes)).not_to have_key :custom_field_values
      end

      it 'serializes all visible extra fields at the same level as the idea fields for an admin user' do
        admin_user = create(:admin)
        output = described_class.new(idea, params: { current_user: admin_user }).serializable_hash
        expect(output.dig(:data, :attributes, visible_public_field.key.to_sym)).to eq visible_public_value
        expect(output.dig(:data, :attributes, visible_admin_field.key.to_sym)).to eq visible_admin_value
        expect(output.dig(:data, :attributes)).not_to have_key disabled_field.key.to_sym
        expect(output.dig(:data, :attributes)).not_to have_key :custom_field_values
      end

      it 'only serializes public fields for a public user' do
        output = described_class.new(idea, params: { current_user: nil }).serializable_hash
        expect(output.dig(:data, :attributes, visible_public_field.key.to_sym)).to eq visible_public_value
        expect(output.dig(:data, :attributes)).not_to have_key visible_admin_field.key.to_sym
        expect(output.dig(:data, :attributes)).not_to have_key disabled_field.key.to_sym
        expect(output.dig(:data, :attributes)).not_to have_key :custom_field_values
      end
    end
  end
end
