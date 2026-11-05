# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::IdeaSerializer do
  describe 'custom field answers' do
    let(:form) { create(:custom_form, participation_context: create(:project)) }
    let(:public_field) { create(:custom_field, resource: form, input_type: 'number', answers_visible_to: 'public') }
    let(:private_field) { create(:custom_field, resource: form, input_type: 'number', answers_visible_to: 'moderators') }
    let(:idea) do
      create(:idea, project: form.participation_context, custom_field_answers: [
        build(:custom_field_answer, custom_field: public_field, key: public_field.key, value: 1),
        build(:custom_field_answer, custom_field: private_field, key: private_field.key, value: 2)
      ])
    end

    it 'serializes the answers the policy permits at the same level as the idea attributes' do
      attributes = described_class.new(idea, params: { current_user: nil }).serializable_hash.dig(:data, :attributes)
      expect(attributes[public_field.key.to_sym]).to eq 1
      expect(attributes).not_to have_key private_field.key.to_sym
    end
  end
end
