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

  let(:project) { create(:project_with_active_native_survey_phase) }
  let(:active_phase) { project.phases.first }
  let(:participation_context) { active_phase }
  let(:phases_of_inputs) { [active_phase] }

  let(:form) { create(:custom_form, participation_context: active_phase) }
  let!(:page_field) { create(:custom_field_page, resource: form) } # Should not appear in results
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
  let!(:no_response_option) do
    create(
      :custom_field_option,
      custom_field: multiselect_field,
      key: 'no_response',
      title_multiloc: { 'en' => 'Nothing', 'fr-FR' => 'Rien', 'nl-NL' => 'Niets' }
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

  let_it_be(:user_custom_field) { create(:custom_field_gender, :with_options) }

  # Create responses
  before do
    create(:idea_status_proposed)
    male_user = create(:user, custom_field_values: { gender: 'male' })
    female_user = create(:user, custom_field_values: { gender: 'female' })
    idea_file = create(:idea_file)
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Red',
        multiselect_field.key => %w[cat dog],
        select_field.key => 'ny',
        file_upload_field.key => { 'id' => idea_file.id, 'name' => idea_file.name }
      },
      idea_files: [idea_file],
      author: female_user
    )
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Blue',
        multiselect_field.key => %w[cow pig cat],
        select_field.key => 'la'
      },
      author: male_user
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
      },
      author: female_user
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
      },
      author: male_user
    )
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        select_field.key => 'la',
        multiselect_image_field.key => ['school']
      },
      author: female_user
    )
    create(
      :idea,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        select_field.key => 'other',
        "#{select_field.key}_other" => 'Seattle'
      },
      author: male_user
    )
    create(:idea, author: female_user, project: project, phases: phases_of_inputs, custom_field_values: {})

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

  describe '#generate_submission_count' do
    it 'returns the count' do
      expect(generator.generate_submission_count).to eq({ totalSubmissions: 22 })
    end
  end

  describe 'generate_results' do
    let(:generated_results) { generator.generate_results }

    it 'returns the correct locales' do
      # These locales are a prerequisite for the test.
      expect(AppConfiguration.instance.settings('core', 'locales')).to eq(%w[en fr-FR nl-NL])
    end

    it 'returns the correct totals' do
      expect(generated_results[:totalSubmissions]).to eq 22
    end

    it 'returns the correct structure' do
      expect(generated_results[:results].count).to eq 8
    end

    describe 'text fields' do
      let(:expected_result_text_field) do
        {
          customFieldId: text_field.id,
          inputType: 'text',
          question: { 'en' => 'What is your favourite colour?' },
          required: false,
          grouped: false,
          totalResponseCount: 22,
          questionResponseCount: 4,
          textResponses: [
            { answer: 'Red' },
            { answer: 'Blue' },
            { answer: 'Green' },
            { answer: 'Pink' }
          ]
        }
      end

      it 'returns the results for a text field' do
        expect(generated_results[:results][0]).to match expected_result_text_field
      end

      it 'returns a single result for a text field' do
        expect(generator.generate_results(field_id: text_field.id)).to match expected_result_text_field
      end

      it 'returns the results for an unanswered field' do
        expect(generated_results[:results][6]).to match(
          {
            customFieldId: unanswered_text_field.id,
            inputType: 'text',
            question: { 'en' => 'Nobody wants to answer me' },
            required: false,
            grouped: false,
            totalResponseCount: 22,
            questionResponseCount: 0,
            textResponses: []
          }
        )
      end
    end

    describe 'multiline text fields' do
      it 'returns the results for a multiline text field' do
        expect(generated_results[:results][1]).to match(
          {
            customFieldId: multiline_text_field.id,
            inputType: 'multiline_text',
            question: { 'en' => 'What is your favourite recipe?' },
            required: false,
            grouped: false,
            totalResponseCount: 22,
            questionResponseCount: 0,
            textResponses: []
          }
        )
      end
    end

    describe 'multi-select field' do
      let(:expected_result_multiselect) do
        {
          customFieldId: multiselect_field.id,
          inputType: 'multiselect',
          question: {
            'en' => 'What are your favourite pets?',
            'fr-FR' => 'Quels sont vos animaux de compagnie préférés ?',
            'nl-NL' => 'Wat zijn je favoriete huisdieren?'
          },
          required: false,
          grouped: false,
          totalResponseCount: 22,
          questionResponseCount: 4,
          totalPicks: 28,
          answers: [
            { answer: nil, count: 18 },
            { answer: 'cat', count: 4 },
            { answer: 'dog', count: 3 },
            { answer: 'cow', count: 2 },
            { answer: 'pig', count: 1 },
            { answer: 'no_response', count: 0 }
          ],
          multilocs: {
            answer: {
              'cat' => { title_multiloc: { 'en' => 'Cat', 'fr-FR' => 'Chat', 'nl-NL' => 'Kat' } },
              'cow' => { title_multiloc: { 'en' => 'Cow', 'fr-FR' => 'Vache', 'nl-NL' => 'Koe' } },
              'dog' => { title_multiloc: { 'en' => 'Dog', 'fr-FR' => 'Chien', 'nl-NL' => 'Hond' } },
              'no_response' => { title_multiloc: { 'en' => 'Nothing', 'fr-FR' => 'Rien', 'nl-NL' => 'Niets' } },
              'pig' => { title_multiloc: { 'en' => 'Pig', 'fr-FR' => 'Porc', 'nl-NL' => 'Varken' } }
            }
          }
        }
      end

      context 'without grouping' do
        it 'returns the results for a multi-select field' do
          expect(generated_results[:results][2]).to match expected_result_multiselect
        end

        it 'returns a single result for multiselect' do
          expect(generator.generate_results(field_id: multiselect_field.id)).to match expected_result_multiselect
        end
      end

      context 'with grouping' do
        let(:expected_result_multiselect_with_user_field_grouping) do
          expected_result_multiselect.tap do |result|
            result[:grouped] = true
            result[:legend] = ['male', 'female', 'unspecified', nil]
            result[:answers] = [
              {
                answer: nil,
                count: 18,
                groups: [
                  { count: 1, group: 'male' },
                  { count: 2, group: 'female' },
                  { count: 0, group: 'unspecified' },
                  { count: 15, group: nil }
                ]
              }, {
                answer: 'cat',
                count: 4,
                groups: [
                  { count: 2, group: 'male' },
                  { count: 2, group: 'female' },
                  { count: 0, group: 'unspecified' },
                  { count: 0, group: nil }
                ]
              }, {
                answer: 'dog',
                count: 3,
                groups: [
                  { count: 1, group: 'male' },
                  { count: 2, group: 'female' },
                  { count: 0, group: 'unspecified' },
                  { count: 0, group: nil }
                ]
              }, {
                answer: 'cow',
                count: 2,
                groups: [
                  { count: 2, group: 'male' },
                  { count: 0, group: 'female' },
                  { count: 0, group: 'unspecified' },
                  { count: 0, group: nil }
                ]
              }, {
                answer: 'pig',
                count: 1,
                groups: [
                  { count: 1, group: 'male' },
                  { count: 0, group: 'female' },
                  { count: 0, group: 'unspecified' },
                  { count: 0, group: nil }
                ]
              }, {
                answer: 'no_response',
                count: 0,
                groups: [
                  { count: 0, group: 'male' },
                  { count: 0, group: 'female' },
                  { count: 0, group: 'unspecified' },
                  { count: 0, group: nil }
                ]
              }
            ]
            result[:multilocs][:group] = {
              'female' => { title_multiloc: { 'en' => 'youth council', 'fr-FR' => 'conseil des jeunes', 'nl-NL' => 'jeugdraad' } },
              'male' => { title_multiloc: { 'en' => 'youth council', 'fr-FR' => 'conseil des jeunes', 'nl-NL' => 'jeugdraad' } },
              'unspecified' => { title_multiloc: { 'en' => 'youth council', 'fr-FR' => 'conseil des jeunes', 'nl-NL' => 'jeugdraad' } }
            }
          end
        end

        let(:expected_result_multiselect_with_select_field_grouping) do
          expected_result_multiselect.tap do |result|
            result[:grouped] = true
            result[:legend] = ['la', 'ny', 'other', nil]
            result[:answers] = [
              {
                answer: nil,
                count: 18,
                groups: [
                  { count: 1, group: 'la' },
                  { count: 0, group: 'ny' },
                  { count: 1, group: 'other' },
                  { count: 16, group: nil }
                ]
              }, {
                answer: 'cat',
                count: 4,
                groups: [
                  { count: 1, group: 'la' },
                  { count: 1, group: 'ny' },
                  { count: 2, group: 'other' },
                  { count: 0, group: nil }
                ]
              }, {
                answer: 'dog',
                count: 3,
                groups: [
                  { count: 0, group: 'la' },
                  { count: 1, group: 'ny' },
                  { count: 2, group: 'other' },
                  { count: 0, group: nil }
                ]
              }, {
                answer: 'cow',
                count: 2,
                groups: [
                  { count: 1, group: 'la' },
                  { count: 0, group: 'ny' },
                  { count: 1, group: 'other' },
                  { count: 0, group: nil }
                ]
              }, {
                answer: 'pig',
                count: 1,
                groups: [
                  { count: 1, group: 'la' },
                  { count: 0, group: 'ny' },
                  { count: 0, group: 'other' },
                  { count: 0, group: nil }
                ]
              }, {
                answer: 'no_response',
                count: 0,
                groups: [
                  { count: 0, group: 'la' },
                  { count: 0, group: 'ny' },
                  { count: 0, group: 'other' },
                  { count: 0, group: nil }
                ]
              }
            ]
            result[:multilocs][:group] = {
              'la' => { title_multiloc: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' } },
              'ny' => { title_multiloc: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' } },
              'other' => { title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' } }
            }
          end
        end

        it 'groups multiselect by user field' do
          expect(generator.generate_results(
            field_id: multiselect_field.id,
            group_mode: 'user_field',
            group_field_id: user_custom_field.id
          )).to match expected_result_multiselect_with_user_field_grouping
        end

        it 'groups multiselect by select field' do
          expect(generator.generate_results(
            field_id: multiselect_field.id,
            group_field_id: select_field.id
          )).to match expected_result_multiselect_with_select_field_grouping
        end
      end
    end

    describe 'linear scale field' do
      let(:expected_result_linear_scale) do
        {
          customFieldId: linear_scale_field.id,
          inputType: 'linear_scale',
          question: {
            'en' => 'Do you agree with the vision?',
            'fr-FR' => "Êtes-vous d'accord avec la vision ?",
            'nl-NL' => 'Ben je het eens met de visie?'
          },
          required: true,
          grouped: false,
          totalResponseCount: 22,
          questionResponseCount: 15,
          totalPicks: 22,
          answers: [
            { answer: 5, count: 1 },
            { answer: 4, count: 0 },
            { answer: 3, count: 7 },
            { answer: 2, count: 5 },
            { answer: 1, count: 2 },
            { answer: nil, count: 7 }
          ],
          multilocs: {
            answers: {
              1 => { title_multiloc: { 'en' => '1 - Strongly disagree', 'fr-FR' => "1 - Pas du tout d'accord", 'nl-NL' => '1 - Helemaal niet mee eens' } },
              2 => { title_multiloc: { 'en' => '2', 'fr-FR' => '2', 'nl-NL' => '2' } },
              3 => { title_multiloc: { 'en' => '3', 'fr-FR' => '3', 'nl-NL' => '3' } },
              4 => { title_multiloc: { 'en' => '4', 'fr-FR' => '4', 'nl-NL' => '4' } },
              5 => { title_multiloc: { 'en' => '5 - Strongly agree', 'fr-FR' => "5 - Tout à fait d'accord", 'nl-NL' => '5 - Strerk mee eens' } }
            }
          }
        }
      end

      it 'returns the results for a linear scale field' do
        expect(generated_results[:results][3]).to match expected_result_linear_scale
      end

      it 'returns a single result for a linear scale field' do
        expect(generator.generate_results(field_id: linear_scale_field.id)).to match expected_result_linear_scale
      end

      context 'when not all minimum and maximum labels are configured for linear scale fields' do
        let(:minimum_label_multiloc) { { 'fr-FR' => "Pas du tout d'accord" } }
        let(:maximum_label_multiloc) { { 'en' => 'Strongly agree' } }

        let(:expected_result_linear_scale_without_min_and_max_labels) do
          expected_result_linear_scale.tap do |result|
            result[:multilocs][:answers][5][:title_multiloc] = {
              'en' => '5 - Strongly agree',
              'fr-FR' => '5',
              'nl-NL' => '5'
            }
            result[:multilocs][:answers][1][:title_multiloc] = {
              'en' => '1',
              'fr-FR' => "1 - Pas du tout d'accord",
              'nl-NL' => '1'
            }
          end
        end

        it 'returns minimum and maximum labels as numbers' do
          expect(generator.generate_results(field_id: linear_scale_field.id)).to match expected_result_linear_scale_without_min_and_max_labels
        end
      end
    end

    describe 'select field' do
      let(:expected_result_select) do
        {
          customFieldId: select_field.id,
          inputType: 'select',
          question: {
            'en' => 'What city do you like best?',
            'fr-FR' => 'Quelle ville préférez-vous ?',
            'nl-NL' => 'Welke stad vind jij het leukst?'
          },
          required: true,
          grouped: false,
          totalResponseCount: 22,
          questionResponseCount: 6,
          totalPicks: 22,
          answers: [
            { answer: nil, count: 16 },
            { answer: 'la', count: 2 },
            { answer: 'ny', count: 1 },
            { answer: 'other', count: 3 }
          ],
          multilocs: {
            answer: {
              'la' => { title_multiloc: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' } },
              'ny' => { title_multiloc: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' } },
              'other' => { title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' } }
            }
          },
          textResponses: [
            { answer: 'Austin' },
            { answer: 'Miami' },
            { answer: 'Seattle' }
          ]
        }
      end

      context 'without grouping' do
        it 'returns the correct results for a select field' do
          expect(generated_results[:results][4]).to match expected_result_select
        end

        it 'returns select answers in order of the number of responses, with other always last' do
          answers = generator.generate_results.dig(:results, 4, :answers)
          expect(answers.pluck(:answer)).to eq [nil, 'la', 'ny', 'other']
          expect(answers.pluck(:count)).to eq [16, 2, 1, 3]
        end

        it 'returns a single result for a select field' do
          expect(generator.generate_results(field_id: select_field.id)).to match expected_result_select
        end
      end

      context 'with grouping' do
        let(:expected_result_select_with_user_field_grouping) do
          expected_result_select.tap do |result|
            result[:grouped] = true
            result[:legend] = ['male', 'female', 'unspecified', nil]
            result[:answers] = [
              {
                answer: nil,
                count: 16,
                groups: [
                  { count: 0, group: 'male' },
                  { count: 1, group: 'female' },
                  { count: 0, group: 'unspecified' },
                  { count: 15, group: nil }
                ]
              }, {
                answer: 'la',
                count: 2,
                groups: [
                  { count: 1, group: 'male' },
                  { count: 1, group: 'female' },
                  { count: 0, group: 'unspecified' },
                  { count: 0, group: nil }
                ]
              }, {
                answer: 'ny',
                count: 1,
                groups: [
                  { count: 0, group: 'male' },
                  { count: 1, group: 'female' },
                  { count: 0, group: 'unspecified' },
                  { count: 0, group: nil }
                ]
              }, {
                answer: 'other',
                count: 3,
                groups: [
                  { count: 2, group: 'male' },
                  { count: 1, group: 'female' },
                  { count: 0, group: 'unspecified' },
                  { count: 0, group: nil }
                ]
              }
            ]
            result[:multilocs][:group] = {
              'female' => { title_multiloc: { 'en' => 'youth council', 'fr-FR' => 'conseil des jeunes', 'nl-NL' => 'jeugdraad' } },
              'male' => { title_multiloc: { 'en' => 'youth council', 'fr-FR' => 'conseil des jeunes', 'nl-NL' => 'jeugdraad' } },
              'unspecified' => { title_multiloc: { 'en' => 'youth council', 'fr-FR' => 'conseil des jeunes', 'nl-NL' => 'jeugdraad' } }
            }
          end
        end

        it 'groups select by user field' do
          expect(generator.generate_results(
            field_id: select_field.id,
            group_mode: 'user_field',
            group_field_id: user_custom_field.id
          )).to match expected_result_select_with_user_field_grouping
        end

        # TODO: JS - No other select fields to group by
        # it 'groups select by other select question' do
        #   expect(generator.generator.generator.generate_results(
        #     field_id: select_field.id,
        #     group_field: food_survey_question.id
        #   )).to match {}
        # end
      end
    end

    describe 'image select fields' do
      let(:expected_result_multiselect_image) do
        {
          customFieldId: multiselect_image_field.id,
          inputType: 'multiselect_image',
          question: {
            'en' => 'Choose an image',
            'fr-FR' => 'Choisissez une image',
            'nl-NL' => 'Kies een afbeelding'
          },
          required: false,
          grouped: false,
          totalResponseCount: 22,
          questionResponseCount: 3,
          totalPicks: 22,
          answers: [
            { answer: nil, count: 19 },
            { answer: 'house', count: 2 },
            { answer: 'school', count: 1 }
          ],
          multilocs: {
            answer: {
              'house' => hash_including(
                title_multiloc: { 'en' => 'House', 'fr-FR' => 'Maison', 'nl-NL' => 'Huis' },
                image: {
                  fb: end_with('.png'),
                  large: end_with('.png'),
                  medium: end_with('.png'),
                  small: end_with('.png')
                }
              ),
              'school' => hash_including(
                title_multiloc: { 'en' => 'School', 'fr-FR' => 'Ecole', 'nl-NL' => 'School' },
                image: {
                  fb: end_with('.png'),
                  large: end_with('.png'),
                  medium: end_with('.png'),
                  small: end_with('.png')
                }
              )
            }
          }
        }
      end

      it 'returns the results for a multi-select image field' do
        expect(generated_results[:results][5]).to match expected_result_multiselect_image
      end
    end

    describe 'file upload fields' do
      let(:expected_result_file_upload) do
        {
          customFieldId: file_upload_field.id,
          inputType: 'file_upload',
          question: { 'en' => 'Upload a file' },
          required: false,
          grouped: false,
          totalResponseCount: 22,
          questionResponseCount: 1,
          files: [
            { name: end_with('.pdf'), url: end_with('.pdf') }
          ]
        }
      end

      it 'returns the results for file upload field' do
        expect(generated_results[:results][7]).to match expected_result_file_upload
      end
    end
  end
end
