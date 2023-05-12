# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserUiSchemaGeneratorService do
  subject(:generator) { described_class.new }

  let(:field_key) { 'field_key' }

  describe '#generate_for' do
    let(:project) { create(:continuous_project, input_term: 'contribution') }
    let(:custom_form) { create(:custom_form, participation_context: project) }
    let(:field1) do
      create(
        :custom_field_birthyear,
        title_multiloc: { 'en' => 'Birthyear title' },
        description_multiloc: { 'en' => 'Birthyear description' }
      )
    end
    let(:field2) do
      create(
        :custom_field,
        :for_custom_form,
        resource: custom_form,
        input_type: 'text',
        title_multiloc: { 'en' => 'Text title' },
        description_multiloc: { 'en' => 'Text description' }
      )
    end

    it 'returns the schema for the given fields' do
      expect(generator.generate_for([field1, field2])).to eq({
        'en' => {
          type: 'VerticalLayout',
          options: {
            formId: 'user-form'
          },
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field1.key}",
              label: 'Birthyear title',
              options: { input_type: field1.input_type, description: 'Birthyear description' }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field2.key}",
              label: 'Text title',
              options: { input_type: field2.input_type, description: 'Text description', transform: 'trim_on_blur' }
            }
          ]
        },
        'fr-BE' => {
          type: 'VerticalLayout',
          options: {
            formId: 'user-form'
          },
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field1.key}",
              label: 'Birthyear title',
              options: { input_type: field1.input_type, description: 'Birthyear description' }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field2.key}",
              label: 'Text title',
              options: { input_type: field2.input_type, description: 'Text description', transform: 'trim_on_blur' }
            }
          ]
        },
        'nl-BE' => {
          type: 'VerticalLayout',
          options: {
            formId: 'user-form'
          },
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field1.key}",
              label: 'Birthyear title',
              options: { input_type: field1.input_type, description: 'Birthyear description' }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field2.key}",
              label: 'Text title',
              options: { input_type: field2.input_type, description: 'Text description', transform: 'trim_on_blur' }
            }
          ]
        }
      })
    end
  end
end
