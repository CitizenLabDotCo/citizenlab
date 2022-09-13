# frozen_string_literal: true

require 'rails_helper'

# This spec describes:
#   * Unsupported fields are not considered. Unsupported means that we do
#     not have a visit_xxx method on the described class.
#   * Results are generated only for reportable fields (i.e. enabled).
#   * Missing values for fields are not counted.
#   * The order of the results is the same as the field order in the form.
#   * Results for one field are ordered in descending order.
#   * Result generation is supported for projects and phases.

RSpec.describe SurveyResultsGeneratorService, skip: !CitizenLab.ee? do
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
        'fr-FR' => 'Quels sont vos animaux de compagnie préférés ?',
        'nl-NL' => 'Wat zijn je favoriete huisdieren?'
      },
      description_multiloc: {}
    )
  end
  let!(:cat_option) do
    create(
      :custom_field_option,
      custom_field: multiselect_field,
      key: 'cat',
      title_multiloc: { 'en' => 'Cat', 'fr-FR' => 'Chat', 'nl-NL' => 'Kat' }
    )
  end
  let!(:dog_option) do
    create(
      :custom_field_option,
      custom_field: multiselect_field,
      key: 'dog',
      title_multiloc: { 'en' => 'Dog', 'fr-FR' => 'Chien', 'nl-NL' => 'Hond' }
    )
  end
  let!(:cow_option) do
    create(
      :custom_field_option,
      custom_field: multiselect_field,
      key: 'cow',
      title_multiloc: { 'en' => 'Cow', 'fr-FR' => 'Vache', 'nl-NL' => 'Koe' }
    )
  end
  let!(:pig_option) do
    create(
      :custom_field_option,
      custom_field: multiselect_field,
      key: 'pig',
      title_multiloc: { 'en' => 'Pig', 'fr-FR' => 'Porc', 'nl-NL' => 'Varken' }
    )
  end
  let!(:linear_scale_field) do
    create(
      :custom_field_linear_scale,
      resource: form,
      title_multiloc: {
        'en' => 'Do you agree with the vision?',
        'fr-FR' => "Êtes-vous d'accord avec la vision? ?",
        'nl-NL' => 'Ben je het eens met de visie?'
      },
      maximum: 5,
      minimum_label_multiloc: {
        'en' => 'Strongly disagree',
        'fr-FR' => "Pas du tout d'accord",
        'nl-NL' => 'Helemaal niet mee eens'
      },
      maximum_label_multiloc: {
        'en' => 'Strongly agree',
        'fr-FR' => "Tout à fait d'accord",
        'nl-NL' => 'Strerk mee eens'
      }
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

    { 1 => 2, 2 => 5, 3 => 7, 4 => 3, 5 => 1 }.each do |value, count|
      count.times do
        create(
          :idea,
          project: project,
          phases: phases_of_inputs,
          custom_field_values: { linear_scale_field.key => value }
        )
      end
    end
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
                'fr-FR' => 'Quels sont vos animaux de compagnie préférés ?',
                'nl-NL' => 'Wat zijn je favoriete huisdieren?'
              },
              totalResponses: 10,
              answers: [
                { answer: { 'en' => 'Cat', 'fr-FR' => 'Chat', 'nl-NL' => 'Kat' }, responses: 4 },
                { answer: { 'en' => 'Dog', 'fr-FR' => 'Chien', 'nl-NL' => 'Hond' }, responses: 3 },
                { answer: { 'en' => 'Cow', 'fr-FR' => 'Vache', 'nl-NL' => 'Koe' }, responses: 2 },
                { answer: { 'en' => 'Pig', 'fr-FR' => 'Porc', 'nl-NL' => 'Varken' }, responses: 1 }
              ]
            },
            {
              inputType: 'linear_scale',
              question: {
                'en' => 'Do you agree with the vision?',
                'fr-FR' => "Êtes-vous d'accord avec la vision? ?",
                'nl-NL' => 'Ben je het eens met de visie?'
              },
              totalResponses: 18,
              answers: [
                { answer: { 'en' => '3', 'fr-FR' => '3', 'nl-NL' => '3' }, responses: 7 },
                { answer: { 'en' => '2', 'fr-FR' => '2', 'nl-NL' => '2' }, responses: 5 },
                { answer: { 'en' => '4', 'fr-FR' => '4', 'nl-NL' => '4' }, responses: 3 },
                {
                  answer: {
                    'en' => 'Strongly disagree',
                    'fr-FR' => "Pas du tout d'accord",
                    'nl-NL' => 'Helemaal niet mee eens'
                  },
                  responses: 2
                },
                {
                  answer: {
                    'en' => 'Strongly agree',
                    'fr-FR' => "Tout à fait d'accord",
                    'nl-NL' => 'Strerk mee eens'
                  },
                  responses: 1
                }
              ]
            }
          ]
        },
        totalSubmissions: 23
      }
    end

    context 'for a project' do
      let(:project) { create(:continuous_native_survey_project) }
      let(:form) { create(:custom_form, participation_context: project) }
      let(:participation_context) { project }
      let(:phases_of_inputs) { [] }

      it 'returns the results' do
        # These locales are a prerequisite for the test.
        expect(AppConfiguration.instance.settings('core', 'locales')).to eq(%w[en fr-FR nl-NL])

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
        # These locales are a prerequisite for the test.
        expect(AppConfiguration.instance.settings('core', 'locales')).to eq(%w[en fr-FR nl-NL])

        expect(generator.generate).to eq expected_result
      end
    end
  end
end
