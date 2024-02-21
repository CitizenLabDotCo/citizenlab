# frozen_string_literal: true

require 'rails_helper'

# This spec describes:
#   * Unsupported fields are not considered. Unsupported means that we do
#     not have a visit_xxx method on the described class.
#   * Results are generated only for reportable fields (i.e. enabled).
#   * Missing values for fields are not counted.
#   * The order of the results is the same as the field order in the form.
#   * Results for one field are ordered in descending order.
#   * Result generation is supported for phases only.

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
  let!(:multiselect_field) do
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
  let!(:select_field) do
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
  let!(:other_option) do
    create(
      :custom_field_option,
      custom_field: select_field,
      other: true,
      key: 'other',
      title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' }
    )
  end
  let!(:multiselect_image_field) do
    create(
      :custom_field_multiselect_image,
      resource: form,
      title_multiloc: {
        'en' => 'Choose an image',
        'fr-FR' => 'Choisissez une image',
        'nl-NL' => 'Kies een afbeelding'
      },
      description_multiloc: {},
      required: false
    )
  end
  let!(:house_option) do
    create(
      :custom_field_option,
      custom_field: multiselect_image_field,
      key: 'house',
      title_multiloc: { 'en' => 'House', 'fr-FR' => 'Maison', 'nl-NL' => 'Huis' },
      image: create(:custom_field_option_image)
    )
  end
  let!(:school_option) do
    create(
      :custom_field_option,
      custom_field: multiselect_image_field,
      key: 'school',
      title_multiloc: { 'en' => 'School', 'fr-FR' => 'Ecole', 'nl-NL' => 'School' },
      image: create(:custom_field_option_image)
    )
  end
  let!(:unanswered_text_field) do
    create(
      :custom_field,
      resource: form,
      title_multiloc: {
        'en' => 'Nobody wants to answer me'
      },
      description_multiloc: {}
    )
  end
  let!(:file_upload_field) do
    create(
      :custom_field,
      input_type: 'file_upload',
      resource: form,
      title_multiloc: {
        'en' => 'Upload a file'
      },
      required: false
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
          customFieldId: text_field.id,
          textResponses: a_collection_containing_exactly(
            { answer: 'Red' },
            { answer: 'Blue' },
            { answer: 'Green' },
            { answer: 'Pink' }
          )
        },
        {
          inputType: 'multiline_text',
          question: { 'en' => 'What is your favourite recipe?' },
          required: false,
          totalResponses: 0,
          customFieldId: multiline_text_field.id,
          textResponses: []
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
          totalResponses: 6,
          answers: a_collection_containing_exactly(
            { answer: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' }, responses: 2 },
            { answer: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' }, responses: 1 },
            { answer: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' }, responses: 3 }
          ),
          textResponses: a_collection_containing_exactly(
            { answer: 'Austin' },
            { answer: 'Miami' },
            { answer: 'Seattle' }
          ),
          customFieldId: select_field.id
        },
        {
          inputType: 'multiselect_image',
          question: {
            'en' => 'Choose an image',
            'fr-FR' => 'Choisissez une image',
            'nl-NL' => 'Kies een afbeelding'
          },
          required: false,
          totalResponses: 3,
          answers: [
            { answer: { 'en' => 'House', 'fr-FR' => 'Maison', 'nl-NL' => 'Huis' }, responses: 2, image: hash_including(
              fb: end_with('.png'),
              small: end_with('.png'),
              medium: end_with('.png'),
              large: end_with('.png')
            ) },
            { answer: { 'en' => 'School', 'fr-FR' => 'Ecole', 'nl-NL' => 'School' }, responses: 1, image: hash_including(
              fb: end_with('.png'),
              small: end_with('.png'),
              medium: end_with('.png'),
              large: end_with('.png')
            ) }
          ],
          customFieldId: multiselect_image_field.id
        },
        {
          inputType: 'text',
          question: { 'en' => 'Nobody wants to answer me' },
          required: false,
          totalResponses: 0,
          customFieldId: unanswered_text_field.id,
          textResponses: []
        },
        {
          inputType: 'file_upload',
          question: { 'en' => 'Upload a file' },
          required: false,
          totalResponses: 1,
          customFieldId: file_upload_field.id,
          files: [
            { name: end_with('.pdf'), url: end_with('.pdf') }
          ]
        }
      ],
      totalSubmissions: 22
    }
  end

  let(:expected_result_text) { expected_result[:results][0] }
  let(:expected_result_multiline_text) { expected_result[:results][1] }
  let(:expected_result_multiselect) { expected_result[:results][2] }
  let(:expected_result_linear_scale) { expected_result[:results][3] }
  let(:expected_result_select) { expected_result[:results][4] }
  let(:expected_result_multiselect_image) { expected_result[:results][5] }
  let(:expected_result_unanswered_field) { expected_result[:results][6] }
  let(:expected_result_file_upload) { expected_result[:results][7] }

  let(:expected_result_linear_scale_without_min_and_max_labels) do
    expected_result_linear_scale.tap do |result|
      result[:answers][0][:answer] = {
        'en' => '5 - Strongly agree',
        'fr-FR' => '5',
        'nl-NL' => '5'
      }
      result[:answers][4][:answer] = {
        'en' => '1',
        'fr-FR' => "1 - Pas du tout d'accord",
        'nl-NL' => '1'
      }
    end
  end

  before do
    create(:idea_status_proposed)
    idea_file = create(:idea_file)
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Red',
        multiselect_field.key => %w[cat dog],
        select_field.key => 'ny',
        file_upload_field.key => idea_file.id
      },
      idea_files: [idea_file]
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
        select_field.key => 'other',
        "#{select_field.key}_other" => 'Austin',
        multiselect_image_field.key => ['house']
      }
    )
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Pink',
        multiselect_field.key => %w[dog cat cow],
        select_field.key => 'other',
        "#{select_field.key}_other" => 'Miami',
        multiselect_image_field.key => ['house']
      }
    )
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        select_field.key => 'la',
        multiselect_image_field.key => ['school']
      }
    )
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        select_field.key => 'other',
        "#{select_field.key}_other" => 'Seattle'
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

  context 'for a phase' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:active_phase) { project.phases.first }
    let(:participation_context) { active_phase }
    let(:form) { create(:custom_form, participation_context: active_phase) }
    let(:phases_of_inputs) { [active_phase] }

    describe '#generate_submission_count' do
      it 'returns the count' do
        expect(generator.generate_submission_count).to eq({ totalSubmissions: 22 })
      end
    end

    describe '#generate_results' do
      let!(:generated_results) { generator.generate_results }

      it 'returns the correct locales' do
        # These locales are a prerequisite for the test.
        expect(AppConfiguration.instance.settings('core', 'locales')).to eq(%w[en fr-FR nl-NL])
      end

      it 'returns the correct totals' do
        expect(generated_results[:totalSubmissions]).to eq 22
      end

      it 'returns the results for a text field' do
        expect(generated_results[:results][0]).to match expected_result_text
      end

      it 'returns the results for a multiline text field' do
        expect(generated_results[:results][1]).to match expected_result_multiline_text
      end

      it 'returns the results for a multi-select field' do
        expect(generated_results[:results][2]).to match expected_result_multiselect
      end

      it 'returns the results for a linear scale field' do
        expect(generated_results[:results][3]).to match expected_result_linear_scale
      end

      context 'when not all minimum and maximum labels are configured for linear scale fields' do
        let(:minimum_label_multiloc) { { 'fr-FR' => "Pas du tout d'accord" } }
        let(:maximum_label_multiloc) { { 'en' => 'Strongly agree' } }

        it 'returns minimum and maximum labels as numbers' do
          expect(generator.generate_results[:results][3]).to match expected_result_linear_scale_without_min_and_max_labels
        end
      end

      it 'returns the results for a select field' do
        expect(generated_results[:results][4]).to match expected_result_select
      end

      it 'returns select answers in order of the number of responses, with other always last' do
        answers = generator.generate_results.dig(:results, 4, :answers)
        expect(answers.map { |a| a[:answer]['en'] }).to eq ['Los Angeles', 'New York', 'Other']
        expect(answers.pluck(:responses)).to eq [2, 1, 3]
      end

      it 'returns the results for a multi-select image field' do
        expect(generated_results[:results][5]).to match expected_result_multiselect_image
      end

      it 'returns the results for an unanswered field' do
        expect(generated_results[:results][6]).to match expected_result_unanswered_field
      end

      it 'returns the results for file upload field' do
        expect(generated_results[:results][7]).to match expected_result_file_upload
      end
    end
  end
end
