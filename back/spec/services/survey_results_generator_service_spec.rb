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

RSpec.describe SurveyResultsGeneratorService do
  subject(:generator) { described_class.new participation_context }

  # Create a page to describe that it is not included in the survey results.
  let!(:page_field) { create(:custom_field_page, resource: form) }
  let!(:text_field) do
    create(
      :custom_field,
      resource: form,
      title_multiloc: {
        'en' => 'What is your favourite colour?'
      },
      description_multiloc: {}
    )
  end
  let!(:multiline_text_field) do
    create(
      :custom_field_multiline_text,
      resource: form,
      title_multiloc: {
        'en' => 'What is your favourite recipe?'
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
      description_multiloc: {},
      required: false
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
  let(:minimum_label_multiloc) do
    {
      'en' => 'Strongly disagree',
      'fr-FR' => "Pas du tout d'accord",
      'nl-NL' => 'Helemaal niet mee eens'
    }
  end
  let(:maximum_label_multiloc) do
    {
      'en' => 'Strongly agree',
      'fr-FR' => "Tout à fait d'accord",
      'nl-NL' => 'Strerk mee eens'
    }
  end
  let!(:linear_scale_field) do
    create(
      :custom_field_linear_scale,
      resource: form,
      title_multiloc: {
        'en' => 'Do you agree with the vision?',
        'fr-FR' => "Êtes-vous d'accord avec la vision ?",
        'nl-NL' => 'Ben je het eens met de visie?'
      },
      maximum: 5,
      minimum_label_multiloc: minimum_label_multiloc,
      maximum_label_multiloc: maximum_label_multiloc,
      required: true
    )
  end
  let(:select_field) do
    create(
      :custom_field_select,
      resource: form,
      title_multiloc: {
        'en' => 'What city do you like best?',
        'fr-FR' => 'Quelle ville préférez-vous ?',
        'nl-NL' => 'Welke stad vind jij het leukst?'
      },
      description_multiloc: {},
      required: true
    )
  end
  let!(:la_option) do
    create(
      :custom_field_option,
      custom_field: select_field,
      key: 'la',
      title_multiloc: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' }
    )
  end
  let!(:ny_option) do
    create(
      :custom_field_option,
      custom_field: select_field,
      key: 'ny',
      title_multiloc: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' }
    )
  end

  let(:expected_result) do
    {
      results: [
        {
          inputType: 'text',
          question: { 'en' => 'What is your favourite colour?' },
          required: false,
          totalResponses: 4,
          customFieldId: text_field.id
        },
        {
          inputType: 'multiline_text',
          question: { 'en' => 'What is your favourite recipe?' },
          required: false,
          totalResponses: 0,
          customFieldId: multiline_text_field.id
        },
        {
          inputType: 'multiselect',
          question: {
            'en' => 'What are your favourite pets?',
            'fr-FR' => 'Quels sont vos animaux de compagnie préférés ?',
            'nl-NL' => 'Wat zijn je favoriete huisdieren?'
          },
          required: false,
          totalResponses: 10,
          answers: [
            { answer: { 'en' => 'Cat', 'fr-FR' => 'Chat', 'nl-NL' => 'Kat' }, responses: 4 },
            { answer: { 'en' => 'Dog', 'fr-FR' => 'Chien', 'nl-NL' => 'Hond' }, responses: 3 },
            { answer: { 'en' => 'Cow', 'fr-FR' => 'Vache', 'nl-NL' => 'Koe' }, responses: 2 },
            { answer: { 'en' => 'Pig', 'fr-FR' => 'Porc', 'nl-NL' => 'Varken' }, responses: 1 }
          ],
          customFieldId: multiselect_field.id
        },
        {
          inputType: 'linear_scale',
          question: {
            'en' => 'Do you agree with the vision?',
            'fr-FR' => "Êtes-vous d'accord avec la vision ?",
            'nl-NL' => 'Ben je het eens met de visie?'
          },
          required: true,
          totalResponses: 15,
          answers: [
            {
               answer: {
                'en' => '5 - Strongly agree',
                'fr-FR' => "5 - Tout à fait d'accord",
                'nl-NL' => '5 - Strerk mee eens'
              },
               responses: 1
             },
            { answer: { 'en' => '4', 'fr-FR' => '4', 'nl-NL' => '4' }, responses: 0 },
              { answer: { 'en' => '3', 'fr-FR' => '3', 'nl-NL' => '3' }, responses: 7 },
              { answer: { 'en' => '2', 'fr-FR' => '2', 'nl-NL' => '2' }, responses: 5 },
              {
                answer: {
                  'en' => '1 - Strongly disagree',
                  'fr-FR' => "1 - Pas du tout d'accord",
                  'nl-NL' => '1 - Helemaal niet mee eens'
                },
                responses: 2
              }
            ],
            customFieldId: linear_scale_field.id
          },
          {
            inputType: 'select',
            question: {
              'en' => 'What city do you like best?',
              'fr-FR' => 'Quelle ville préférez-vous ?',
              'nl-NL' => 'Welke stad vind jij het leukst?'
            },
            required: true,
            totalResponses: 4,
            answers: [
              { answer: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' }, responses: 3 },
              { answer: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' }, responses: 1 }
            ],
            customFieldId: select_field.id
          }
        ],
        totalSubmissions: 20
      }
  end

  let(:expected_result_without_minimum_and_maximum_labels) do
    expected_result.tap do |result|
      result[:results][3][:answers][0][:answer] = {
        'en' => '5 - Strongly agree',
        'fr-FR' => '5',
        'nl-NL' => '5'
      }
      result[:results][3][:answers][4][:answer] = {
        'en' => '1',
        'fr-FR' => "1 - Pas du tout d'accord",
        'nl-NL' => '1'
      }
    end
  end

  before do
    create(:idea_status_proposed)
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Red',
        multiselect_field.key => %w[cat dog],
        select_field.key => 'ny'
      }
    )
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Blue',
        multiselect_field.key => %w[cow pig cat],
        select_field.key => 'la'
      }
    )
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Green',
        multiselect_field.key => %w[cat dog],
        select_field.key => 'la'
      }
    )
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Pink',
        multiselect_field.key => %w[dog cat cow],
        select_field.key => 'la'
      }
    )
    create(:idea, project: project, phases: phases_of_inputs, custom_field_values: {})

    { 1 => 2, 2 => 5, 3 => 7, 4 => 0, 5 => 1 }.each do |value, count|
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

  context 'for a project' do
    let(:project) { create(:continuous_native_survey_project) }
    let(:form) { create(:custom_form, participation_context: project) }
    let(:participation_context) { project }
    let(:phases_of_inputs) { [] }

    describe '#generate_submission_count' do
      it 'returns the count' do
        expect(generator.generate_submission_count).to eq({ totalSubmissions: 20 })
      end
    end

    describe '#generate_results' do
      it 'returns the results' do
        # These locales are a prerequisite for the test.
        expect(AppConfiguration.instance.settings('core', 'locales')).to eq(%w[en fr-FR nl-NL])

        expect(generator.generate_results).to eq expected_result
      end

      context 'when not all minimum and maximum labels are configured' do
        let(:minimum_label_multiloc) { { 'fr-FR' => "Pas du tout d'accord" } }
        let(:maximum_label_multiloc) { { 'en' => 'Strongly agree' } }

        it 'returns minimum and maximum labels as numbers' do
          # These locales are a prerequisite for the test.
          expect(AppConfiguration.instance.settings('core', 'locales')).to eq(%w[en fr-FR nl-NL])

          expect(generator.generate_results).to eq expected_result_without_minimum_and_maximum_labels
        end
      end
    end
  end

  context 'for a phase' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:active_phase) { project.phases.first }
    let(:form) { create(:custom_form, participation_context: active_phase) }
    let(:participation_context) { active_phase }
    let(:phases_of_inputs) { [active_phase] }

    describe '#generate_submission_count' do
      it 'returns the count' do
        expect(generator.generate_submission_count).to eq({ totalSubmissions: 20 })
      end
    end

    describe '#generate_results' do
      it 'returns the results' do
        # These locales are a prerequisite for the test.
        expect(AppConfiguration.instance.settings('core', 'locales')).to eq(%w[en fr-FR nl-NL])

        expect(generator.generate_results).to eq expected_result
      end

      context 'when not all minimum and maximum labels are configured' do
        let(:minimum_label_multiloc) { { 'fr-FR' => "Pas du tout d'accord" } }
        let(:maximum_label_multiloc) { { 'en' => 'Strongly agree' } }

        it 'returns minimum and maximum labels as numbers' do
          # These locales are a prerequisite for the test.
          expect(AppConfiguration.instance.settings('core', 'locales')).to eq(%w[en fr-FR nl-NL])

          expect(generator.generate_results).to eq expected_result_without_minimum_and_maximum_labels
        end
      end
    end
  end
end
