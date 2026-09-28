# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::IdeaSerializer do
  context 'with custom field answers' do
    describe '#serializable_hash' do
      let(:project) { create(:project) }
      let(:form) { create(:custom_form, participation_context: project) }
      let(:field) { create(:custom_field, resource: form, input_type: 'number') }
      let(:registration_field) { create(:custom_field_gender) }

      let(:idea_author) { create(:user) }
      let(:idea) do
        create(:idea, project: project, author: idea_author, custom_field_answers: [
          build(:custom_field_answer, custom_field: field, key: field.key, value: 2),
          build(:custom_field_answer, custom_field: registration_field, key: 'u_gender', value: 'female'),
          build(:custom_field_answer, custom_field: nil, key: 'no_such_field', value: 'foo')
        ])
      end

      it 'serializes the answers the user may see at the same level as the idea attributes' do
        output = described_class.new(idea, params: { current_user: idea_author }).serializable_hash
        attributes = output.dig(:data, :attributes)
        expect(attributes[field.key.to_sym]).to eq 2
        expect(attributes[:u_gender]).to eq 'female'
        expect(attributes).not_to have_key :no_such_field
      end

      it 'serializes no answers for a visitor' do
        output = described_class.new(idea, params: { current_user: nil }).serializable_hash
        attributes = output.dig(:data, :attributes)
        expect(attributes).not_to have_key field.key.to_sym
        expect(attributes).not_to have_key :u_gender
      end
    end
  end
end
