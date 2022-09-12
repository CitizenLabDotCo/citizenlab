# frozen_string_literal: true

require 'rails_helper'

# This spec describes:
#   * Unsupported fields are not considered. Unsupported means that we do
#     not have a visit_xxx method on the described class.
#   * Results are generated only for reportable fields (i.e. enabled).
#   * Missing values for fields are not counted.
#   * Results are ordered in descending order.
#   * Result generation is supported for projects and phases.

RSpec.describe SurveyResultsGeneratorService do
  subject(:generator) { described_class.new participation_context }

  let(:text_field) do
    create(
      :custom_field,
      resource: form,
      title_multiloc: {
        'en' => 'What is your favourite colour?'
      },
      description_multiloc: {}
    )
  end
  let!(:disabled_multiselect_field) do
    create(
      :custom_field_multiselect,
      resource: form,
      title_multiloc: { 'en' => 'What are your favourite colours?' },
      description_multiloc: {},
      enabled: false
    )
  end
  let(:multiselect_field) do
    create(
      :custom_field_multiselect,
      resource: form,
      title_multiloc: {
        'en' => 'What are your favourite pets?',
        'fr-BE' => 'Quels sont vos animaux de compagnie préférés ?',
        'nl-BE' => 'Wat zijn je favoriete huisdieren?'
      },
      description_multiloc: {}
    )
  end
  let!(:cat_option) do
    create(
      :custom_field_option,
      custom_field: multiselect_field,
      key: 'cat',
      title_multiloc: { 'en' => 'Cat', 'fr-BE' => 'Chat', 'nl-BE' => 'Kat' }
    )
  end
  let!(:dog_option) do
    create(
      :custom_field_option,
      custom_field: multiselect_field,
      key: 'dog',
      title_multiloc: { 'en' => 'Dog', 'fr-BE' => 'Chien', 'nl-BE' => 'Hond' }
    )
  end
  let!(:cow_option) do
    create(
      :custom_field_option,
      custom_field: multiselect_field,
      key: 'cow',
      title_multiloc: { 'en' => 'Cow', 'fr-BE' => 'Vache', 'nl-BE' => 'Koe' }
    )
  end
  let!(:pig_option) do
    create(
      :custom_field_option,
      custom_field: multiselect_field,
      key: 'pig',
      title_multiloc: { 'en' => 'Pig', 'fr-BE' => 'Porc', 'nl-BE' => 'Varken' }
    )
  end

  before do
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: { text_field.key => 'Red', multiselect_field.key => %w[cat dog] }
    )
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: { text_field.key => 'Blue', multiselect_field.key => %w[cow pig cat] }
    )
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: { text_field.key => 'Green', multiselect_field.key => %w[cat dog] }
    )
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: { text_field.key => 'Pink', multiselect_field.key => %w[dog cat cow] }
    )
    create(:idea, project: project, phases: phases_of_inputs, custom_field_values: {})
  end

  describe '#generate' do
    let(:expected_result) do
      {
        data: {
          results: [
            {
              inputType: 'multiselect',
              question: {
                'en' => 'What are your favourite pets?',
                'fr-BE' => 'Quels sont vos animaux de compagnie préférés ?',
                'nl-BE' => 'Wat zijn je favoriete huisdieren?'
              },
              totalResponses: 10,
              answers: [
                { answer: { 'en' => 'Cat', 'fr-BE' => 'Chat', 'nl-BE' => 'Kat' }, responses: 4 },
                { answer: { 'en' => 'Dog', 'fr-BE' => 'Chien', 'nl-BE' => 'Hond' }, responses: 3 },
                { answer: { 'en' => 'Cow', 'fr-BE' => 'Vache', 'nl-BE' => 'Koe' }, responses: 2 },
                { answer: { 'en' => 'Pig', 'fr-BE' => 'Porc', 'nl-BE' => 'Varken' }, responses: 1 }
              ]
            }
          ]
        },
        totalSubmissions: 5
      }
    end

    context 'for a project' do
      let(:project) { create(:continuous_native_survey_project) }
      let(:form) { create(:custom_form, participation_context: project) }
      let(:participation_context) { project }
      let(:phases_of_inputs) { [] }

      it 'returns the results' do
        expect(generator.generate).to eq expected_result
      end
    end

    context 'for a phase' do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:active_phase) { project.phases.first }
      let(:form) { create(:custom_form, participation_context: active_phase) }
      let(:participation_context) { active_phase }
      let(:phases_of_inputs) { [active_phase] }

      it 'returns the results' do
        expect(generator.generate).to eq expected_result
      end
    end
  end
end
