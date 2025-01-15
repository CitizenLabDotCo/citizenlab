# frozen_string_literal: true

require 'rails_helper'

# This spec describes:
#   * Unsupported fields are not considered. Unsupported means that we do
#     not have a visit_xxx method on the described class.
#   * Results are generated only for reportable fields (i.e. enabled).
#   * The order of the results is the same as the field order in the form.
#   * Results for one field are ordered in descending order.
#   * Result generation is supported for phases only.

RSpec.describe SurveyResultsGeneratorService do
  subject(:generator) { described_class.new survey_phase }

  let_it_be(:project) { create(:single_phase_native_survey_project) }
  let_it_be(:survey_phase) { project.phases.first }
  let_it_be(:phases_of_inputs) { [survey_phase] }

  # Set-up custom form
  let_it_be(:form) { create(:custom_form, participation_context: survey_phase) }
  let_it_be(:page_field) { create(:custom_field_page, resource: form) } # Should not appear in results
  let_it_be(:text_field) do
    create(
      :custom_field,
      resource: form,
      title_multiloc: { 'en' => 'What is your favourite colour?' },
      description_multiloc: {}
    )
  end
  let_it_be(:multiline_text_field) do
    create(
      :custom_field_multiline_text,
      resource: form,
      title_multiloc: { 'en' => 'What is your favourite recipe?' },
      description_multiloc: {}
    )
  end
  let_it_be(:disabled_multiselect_field) do # Should not appear in results
    create(
      :custom_field_multiselect,
      resource: form,
      title_multiloc: { 'en' => 'What are your favourite colours?' },
      description_multiloc: {},
      enabled: false
    )
  end
  let_it_be(:multiselect_field) do
    create(
      :custom_field_multiselect,
      resource: form,
      title_multiloc: {
        'en' => 'What are your favourite pets?',
        'fr-FR' => 'Quels sont vos animaux de compagnie préférés ?',
        'nl-NL' => 'Wat zijn je favoriete huisdieren?'
      },
      description_multiloc: {},
      required: false,
      options: [
        create(:custom_field_option, key: 'cat', title_multiloc: { 'en' => 'Cat', 'fr-FR' => 'Chat', 'nl-NL' => 'Kat' }),
        create(:custom_field_option, key: 'dog', title_multiloc: { 'en' => 'Dog', 'fr-FR' => 'Chien', 'nl-NL' => 'Hond' }),
        create(:custom_field_option, key: 'cow', title_multiloc: { 'en' => 'Cow', 'fr-FR' => 'Vache', 'nl-NL' => 'Koe' }),
        create(:custom_field_option, key: 'pig', title_multiloc: { 'en' => 'Pig', 'fr-FR' => 'Porc', 'nl-NL' => 'Varken' }),
        create(:custom_field_option, key: 'no_response', title_multiloc: { 'en' => 'Nothing', 'fr-FR' => 'Rien', 'nl-NL' => 'Niets' })
      ]
    )
  end
  let_it_be(:linear_scale_field) do
    create(
      :custom_field_linear_scale,
      resource: form,
      title_multiloc: {
        'en' => 'Do you agree with the vision?',
        'fr-FR' => "Êtes-vous d'accord avec la vision ?",
        'nl-NL' => 'Ben je het eens met de visie?'
      },
      maximum: 7,
      linear_scale_label_1_multiloc: {
        'en' => 'Strongly disagree',
        'fr-FR' => "Pas du tout d'accord",
        'nl-NL' => 'Helemaal niet mee eens'
      },
      linear_scale_label_2_multiloc: {
        'en' => 'Disagree',
        'fr-FR' => 'Être en désaccord',
        'nl-NL' => 'Niet mee eens'
      },
      linear_scale_label_3_multiloc: {
        'en' => 'Slightly disagree',
        'fr-FR' => 'Plutôt en désaccord',
        'nl-NL' => 'Enigszins oneens'
      },
      linear_scale_label_4_multiloc: {
        'en' => 'Neutral',
        'fr-FR' => 'Neutre',
        'nl-NL' => 'Neutraal'
      },
      linear_scale_label_5_multiloc: {
        'en' => 'Slightly agree',
        'fr-FR' => "Plutôt d'accord",
        'nl-NL' => 'Enigszins eens'
      },
      linear_scale_label_6_multiloc: {
        'en' => 'Agree',
        'fr-FR' => "D'accord",
        'nl-NL' => 'Mee eens'
      },
      linear_scale_label_7_multiloc: {
        'en' => 'Strongly agree',
        'fr-FR' => "Tout à fait d'accord",
        'nl-NL' => 'Strerk mee eens'
      },
      required: true
    )
  end
  let_it_be(:select_field) do
    create(
      :custom_field_select,
      resource: form,
      title_multiloc: {
        'en' => 'What city do you like best?',
        'fr-FR' => 'Quelle ville préférez-vous ?',
        'nl-NL' => 'Welke stad vind jij het leukst?'
      },
      description_multiloc: {},
      required: true,
      options: [
        create(:custom_field_option, key: 'la', title_multiloc: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' }),
        create(:custom_field_option, key: 'ny', title_multiloc: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' }),
        create(:custom_field_option, other: true, key: 'other', title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' })
      ]
    )
  end
  let_it_be(:multiselect_image_field) do
    create(
      :custom_field_multiselect_image,
      resource: form,
      title_multiloc: {
        'en' => 'Choose an image', 'fr-FR' => 'Choisissez une image', 'nl-NL' => 'Kies een afbeelding'
      },
      description_multiloc: {},
      required: false,
      options: [
        create(
          :custom_field_option,
          key: 'house',
          title_multiloc: { 'en' => 'House', 'fr-FR' => 'Maison', 'nl-NL' => 'Huis' },
          image: create(:custom_field_option_image)
        ),
        create(
          :custom_field_option,
          key: 'school',
          title_multiloc: { 'en' => 'School', 'fr-FR' => 'Ecole', 'nl-NL' => 'School' },
          image: create(:custom_field_option_image)
        )
      ]
    )
  end
  let_it_be(:unanswered_text_field) do
    create(
      :custom_field,
      resource: form,
      title_multiloc: {
        'en' => 'Nobody wants to answer me'
      },
      description_multiloc: {}
    )
  end
  let_it_be(:file_upload_field) do
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
  let_it_be(:shapefile_upload_field) do
    create(
      :custom_field,
      input_type: 'shapefile_upload',
      resource: form,
      title_multiloc: {
        'en' => 'Upload a file'
      },
      required: false
    )
  end

  let_it_be(:point_field) do
    create(
      :custom_field_point,
      resource: form,
      title_multiloc: {
        'en' => 'Where should the new nursery be located?'
      },
      description_multiloc: {}
    )
  end

  let_it_be(:map_config_for_point) { create(:map_config, mappable: point_field) }

  let_it_be(:line_field) do
    create(
      :custom_field_line,
      resource: form,
      title_multiloc: {
        'en' => 'Where should we build the new bicycle path?'
      },
      description_multiloc: {}
    )
  end

  let_it_be(:map_config_for_line) { create(:map_config, mappable: line_field) }

  let_it_be(:polygon_field) do
    create(
      :custom_field_polygon,
      resource: form,
      title_multiloc: {
        'en' => 'Where should we build the new housing?'
      },
      description_multiloc: {}
    )
  end

  let_it_be(:map_config_for_polygon) { create(:map_config, mappable: polygon_field) }

  let_it_be(:number_field) do
    create(
      :custom_field_number,
      resource: form,
      title_multiloc: {
        'en' => 'How many cats would you like?'
      },
      description_multiloc: {}
    )
  end

  let_it_be(:gender_user_custom_field) do
    create(:custom_field_gender, :with_options)
  end

  let_it_be(:domicile_user_custom_field) do
    field = create(:custom_field_domicile)
    create(:area, title_multiloc: { 'en' => 'Area 1' })
    create(:area, title_multiloc: { 'en' => 'Area 2' })
    field
  end

  # Create responses
  let_it_be(:responses) do
    create(:idea_status_proposed)
    male_user = create(:user, custom_field_values: { gender: 'male', domicile: domicile_user_custom_field.options[0].area.id })
    female_user = create(:user, custom_field_values: { gender: 'female', domicile: domicile_user_custom_field.options[1].area.id })
    no_gender_user = create(:user, custom_field_values: {})
    idea_file1 = create(:idea_file)
    idea_file2 = create(:idea_file)
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Red',
        multiselect_field.key => %w[cat dog],
        select_field.key => 'ny',
        file_upload_field.key => { 'id' => idea_file1.id, 'name' => idea_file1.name },
        shapefile_upload_field.key => { 'id' => idea_file2.id, 'name' => idea_file2.name },
        point_field.key => { type: 'Point', coordinates: [42.42, 24.24] },
        line_field.key => { type: 'LineString', coordinates: [[1.1, 2.2], [3.3, 4.4]] },
        polygon_field.key => { type: 'Polygon', coordinates: [[[1.1, 2.2], [3.3, 4.4], [5.5, 6.6], [1.1, 2.2]]] },
        linear_scale_field.key => 3,
        number_field.key => 42
      },
      idea_files: [idea_file1, idea_file2],
      author: female_user
    )
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Blue',
        multiselect_field.key => %w[cow pig cat],
        select_field.key => 'la',
        point_field.key => { type: 'Point', coordinates: [11.22, 33.44] },
        line_field.key => { type: 'LineString', coordinates: [[1.2, 2.3], [3.4, 4.5]] },
        polygon_field.key => { type: 'Polygon', coordinates: [[[1.2, 2.3], [3.4, 4.5], [5.6, 6.7], [1.2, 2.3]]] },
        linear_scale_field.key => 4
      },
      author: male_user
    )
    create(
      :native_survey_response,
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
      :native_survey_response,
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
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        select_field.key => 'la',
        multiselect_image_field.key => ['school']
      },
      author: female_user
    )
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        select_field.key => 'other',
        "#{select_field.key}_other" => 'Seattle'
      },
      author: male_user
    )
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {},
      author: female_user
    )
    { 1 => 2, 2 => 5, 3 => 7, 4 => 0, 5 => 1, 6 => 2, 7 => 3 }.each do |value, count|
      count.times do
        create(
          :native_survey_response,
          project: project,
          phases: phases_of_inputs,
          custom_field_values: { linear_scale_field.key => value },
          author: no_gender_user
        )
      end
    end
  end

  describe 'generate_results' do
    let(:generated_results) { generator.generate_results }

    describe 'structure' do
      it 'returns the correct locales' do
        # These locales are a prerequisite for the test.
        expect(AppConfiguration.instance.settings('core', 'locales')).to eq(%w[en fr-FR nl-NL])
      end

      it 'returns the correct totals' do
        expect(generated_results[:totalSubmissions]).to eq 27
      end

      it 'returns the correct fields and structure' do
        expect(generated_results[:results].count).to eq 13
        expect(generated_results[:results].pluck(:customFieldId)).not_to include page_field.id
        expect(generated_results[:results].pluck(:customFieldId)).not_to include disabled_multiselect_field.id
      end
    end

    describe 'text fields' do
      let(:expected_result_text_field) do
        {
          customFieldId: text_field.id,
          inputType: 'text',
          question: { 'en' => 'What is your favourite colour?' },
          required: false,
          grouped: false,
          totalResponseCount: 27,
          questionResponseCount: 4,
          maybeSkippedByLogic: false,
          textResponses: [
            { answer: 'Blue' },
            { answer: 'Green' },
            { answer: 'Pink' },
            { answer: 'Red' }
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
            maybeSkippedByLogic: false,
            question: { 'en' => 'Nobody wants to answer me' },
            required: false,
            grouped: false,
            totalResponseCount: 27,
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
            maybeSkippedByLogic: false,
            totalResponseCount: 27,
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
          maybeSkippedByLogic: false,
          totalResponseCount: 27,
          questionResponseCount: 4,
          totalPickCount: 33,
          answers: [
            { answer: nil, count: 23 },
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
                count: 23,
                groups: [
                  { count: 1, group: 'male' },
                  { count: 2, group: 'female' },
                  { count: 20, group: nil }
                ]
              }, {
                answer: 'cat',
                count: 4,
                groups: [
                  { count: 2, group: 'male' },
                  { count: 2, group: 'female' }
                ]
              }, {
                answer: 'dog',
                count: 3,
                groups: [
                  { count: 1, group: 'male' },
                  { count: 2, group: 'female' }
                ]
              }, {
                answer: 'cow',
                count: 2,
                groups: [
                  { count: 2, group: 'male' }
                ]
              }, {
                answer: 'pig',
                count: 1,
                groups: [
                  { count: 1, group: 'male' }
                ]
              }, {
                answer: 'no_response',
                count: 0,
                groups: []
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
                count: 23,
                groups: [
                  { count: 1, group: 'la' },
                  { count: 1, group: 'other' },
                  { count: 21, group: nil }
                ]
              }, {
                answer: 'cat',
                count: 4,
                groups: [
                  { count: 1, group: 'la' },
                  { count: 1, group: 'ny' },
                  { count: 2, group: 'other' }
                ]
              }, {
                answer: 'dog',
                count: 3,
                groups: [
                  { count: 1, group: 'ny' },
                  { count: 2, group: 'other' }
                ]
              }, {
                answer: 'cow',
                count: 2,
                groups: [
                  { count: 1, group: 'la' },
                  { count: 1, group: 'other' }
                ]
              }, {
                answer: 'pig',
                count: 1,
                groups: [
                  { count: 1, group: 'la' }
                ]
              }, {
                answer: 'no_response',
                count: 0,
                groups: []
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
          generator = described_class.new(survey_phase,
            group_mode: 'user_field',
            group_field_id: gender_user_custom_field.id)
          expect(generator.generate_results(
            field_id: multiselect_field.id
          )).to match expected_result_multiselect_with_user_field_grouping
        end

        it 'groups multiselect by select field' do
          generator = described_class.new(survey_phase,
            group_field_id: select_field.id)
          expect(generator.generate_results(
            field_id: multiselect_field.id
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
          maybeSkippedByLogic: false,
          totalResponseCount: 27,
          questionResponseCount: 22,
          totalPickCount: 27,
          answers: [
            { answer: 7, count: 3 },
            { answer: 6, count: 2 },
            { answer: 5, count: 1 },
            { answer: 4, count: 1 },
            { answer: 3, count: 8 },
            { answer: 2, count: 5 },
            { answer: 1, count: 2 },
            { answer: nil, count: 5 }
          ],
          multilocs: {
            answer: {
              1 => { title_multiloc: { 'en' => '1 - Strongly disagree', 'fr-FR' => "1 - Pas du tout d'accord", 'nl-NL' => '1 - Helemaal niet mee eens' } },
              2 => { title_multiloc: { 'en' => '2 - Disagree', 'fr-FR' => '2 - Être en désaccord', 'nl-NL' => '2 - Niet mee eens' } },
              3 => { title_multiloc: { 'en' => '3 - Slightly disagree', 'fr-FR' => '3 - Plutôt en désaccord', 'nl-NL' => '3 - Enigszins oneens' } },
              4 => { title_multiloc: { 'en' => '4 - Neutral', 'fr-FR' => '4 - Neutre', 'nl-NL' => '4 - Neutraal' } },
              5 => { title_multiloc: { 'en' => '5 - Slightly agree', 'fr-FR' => "5 - Plutôt d'accord", 'nl-NL' => '5 - Enigszins eens' } },
              6 => { title_multiloc: { 'en' => '6 - Agree', 'fr-FR' => "6 - D'accord", 'nl-NL' => '6 - Mee eens' } },
              7 => { title_multiloc: { 'en' => '7 - Strongly agree', 'fr-FR' => "7 - Tout à fait d'accord", 'nl-NL' => '7 - Strerk mee eens' } }
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
        let(:expected_result_linear_scale_without_min_and_max_labels) do
          expected_result_linear_scale.tap do |result|
            result[:multilocs][:answer][1][:title_multiloc] = {
              'en' => '1',
              'fr-FR' => "1 - Pas du tout d'accord",
              'nl-NL' => '1'
            }
            result[:multilocs][:answer][5][:title_multiloc] = {
              'en' => '5 - Slightly agree',
              'fr-FR' => '5',
              'nl-NL' => '5'
            }
          end
        end

        before do
          linear_scale_field.update!(
            linear_scale_label_1_multiloc: { 'fr-FR' => "Pas du tout d'accord" },
            linear_scale_label_5_multiloc: { 'en' => 'Slightly agree' }
          )
        end

        it 'returns minimum and maximum labels as numbers' do
          expect(generator.generate_results(field_id: linear_scale_field.id)).to match expected_result_linear_scale_without_min_and_max_labels
        end
      end

      context 'with grouping' do
        let(:grouped_linear_scale_results) do
          {
            customFieldId: linear_scale_field.id,
            inputType: 'linear_scale',
            question: {
              'en' => 'Do you agree with the vision?',
              'fr-FR' => "Êtes-vous d'accord avec la vision ?",
              'nl-NL' => 'Ben je het eens met de visie?'
            },
            required: true,
            grouped: true,
            maybeSkippedByLogic: false,
            totalResponseCount: 27,
            questionResponseCount: 22,
            totalPickCount: 27,
            answers: [
              { answer: 7, count: 3, groups: [
                { count: 3, group: nil }
              ] },
              { answer: 6, count: 2, groups: [
                { count: 2, group: nil }
              ] },
              { answer: 5, count: 1, groups: [
                { count: 1, group: nil }
              ] },
              { answer: 4, count: 1, groups: [
                { count: 1, group: 'la' }
              ] },
              { answer: 3, count: 8, groups: [
                { count: 1, group: 'ny' },
                { count: 7, group: nil }
              ] },
              { answer: 2, count: 5, groups: [
                { count: 5, group: nil }
              ] },
              { answer: 1, count: 2, groups: [
                { count: 2, group: nil }
              ] },
              { answer: nil, count: 5, groups: [
                { count: 1, group: 'la' },
                { count: 3, group: 'other' },
                { count: 1, group: nil }
              ] }
            ],
            multilocs: {
              answer: {
                1 => { title_multiloc: { 'en' => '1 - Strongly disagree', 'fr-FR' => "1 - Pas du tout d'accord", 'nl-NL' => '1 - Helemaal niet mee eens' } },
                2 => { title_multiloc: { 'en' => '2 - Disagree', 'fr-FR' => '2 - Être en désaccord', 'nl-NL' => '2 - Niet mee eens' } },
                3 => { title_multiloc: { 'en' => '3 - Slightly disagree', 'fr-FR' => '3 - Plutôt en désaccord', 'nl-NL' => '3 - Enigszins oneens' } },
                4 => { title_multiloc: { 'en' => '4 - Neutral', 'fr-FR' => '4 - Neutre', 'nl-NL' => '4 - Neutraal' } },
                5 => { title_multiloc: { 'en' => '5 - Slightly agree', 'fr-FR' => "5 - Plutôt d'accord", 'nl-NL' => '5 - Enigszins eens' } },
                6 => { title_multiloc: { 'en' => '6 - Agree', 'fr-FR' => "6 - D'accord", 'nl-NL' => '6 - Mee eens' } },
                7 => { title_multiloc: { 'en' => '7 - Strongly agree', 'fr-FR' => "7 - Tout à fait d'accord", 'nl-NL' => '7 - Strerk mee eens' } }
              },
              group: {
                'la' => { title_multiloc: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' } },
                'ny' => { title_multiloc: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' } },
                'other' => { title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' } }
              }
            },
            legend: ['la', 'ny', 'other', nil]
          }
        end

        it 'returns a grouped result for a linear scale field' do
          generator = described_class.new(survey_phase,
            group_mode: 'survey_question',
            group_field_id: select_field.id)
          result = generator.generate_results(
            field_id: linear_scale_field.id
          )
          expect(result).to match grouped_linear_scale_results
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
          maybeSkippedByLogic: false,
          totalResponseCount: 27,
          questionResponseCount: 6,
          totalPickCount: 27,
          answers: [
            { answer: nil, count: 21 },
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
          expect(answers.pluck(:count)).to eq [21, 2, 1, 3]
        end

        it 'returns a single result for a select field' do
          expect(generator.generate_results(field_id: select_field.id)).to match expected_result_select
        end
      end

      context 'with grouping' do
        let(:expected_result_select_with_gender_user_field_grouping) do
          expected_result_select.tap do |result|
            result[:grouped] = true
            result[:legend] = ['male', 'female', 'unspecified', nil]
            result[:answers] = [
              {
                answer: nil,
                count: 21,
                groups: [
                  { count: 1, group: 'female' },
                  { count: 20, group: nil }
                ]
              }, {
                answer: 'la',
                count: 2,
                groups: [
                  { count: 1, group: 'male' },
                  { count: 1, group: 'female' }
                ]
              }, {
                answer: 'ny',
                count: 1,
                groups: [
                  { count: 1, group: 'female' }
                ]
              }, {
                answer: 'other',
                count: 3,
                groups: [
                  { count: 2, group: 'male' },
                  { count: 1, group: 'female' }
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

        let(:expected_result_select_with_domicile_user_field_grouping) do
          area_1_key = domicile_user_custom_field.options[0].key
          area_2_key = domicile_user_custom_field.options[1].key
          somewhere_else_key = domicile_user_custom_field.options.last.key
          expected_result_select.tap do |result|
            result[:grouped] = true
            result[:legend] = [area_1_key, area_2_key, somewhere_else_key, nil]
            result[:answers] = [
              {
                answer: nil,
                count: 21,
                groups: [
                  { count: 1, group: area_2_key },
                  { count: 20, group: nil }
                ]
              }, {
                answer: 'la',
                count: 2,
                groups: [
                  { count: 1, group: area_1_key },
                  { count: 1, group: area_2_key }
                ]
              }, {
                answer: 'ny',
                count: 1,
                groups: [
                  { count: 1, group: area_2_key }
                ]
              }, {
                answer: 'other',
                count: 3,
                groups: [
                  { count: 2, group: area_1_key },
                  { count: 1, group: area_2_key }
                ]
              }
            ]
            result[:multilocs][:group] = {
              area_1_key => { title_multiloc: domicile_user_custom_field.options[0].title_multiloc },
              area_2_key => { title_multiloc: domicile_user_custom_field.options[1].title_multiloc },
              somewhere_else_key => { title_multiloc: domicile_user_custom_field.options.last.title_multiloc }
            }
          end
        end

        let(:expected_result_select_sliced_by_linear_scale) do
          {
            customFieldId: select_field.id,
            inputType: 'select',
            question: {
              'en' => 'What city do you like best?',
              'fr-FR' => 'Quelle ville préférez-vous ?',
              'nl-NL' => 'Welke stad vind jij het leukst?'
            },
            required: true,
            grouped: true,
            maybeSkippedByLogic: false,
            totalResponseCount: 27,
            questionResponseCount: 6,
            totalPickCount: 27,
            answers: [
              {
                answer: nil,
                count: 21,
                groups: [
                  { count: 3, group: 7 },
                  { count: 2, group: 6 },
                  { count: 1, group: 5 },
                  { count: 7, group: 3 },
                  { count: 5, group: 2 },
                  { count: 2, group: 1 },
                  { count: 1, group: nil }
                ]
              },
              {
                answer: 'la',
                count: 2,
                groups: [
                  { count: 1, group: 4 },
                  { count: 1, group: nil }
                ]
              },
              {
                answer: 'ny',
                count: 1,
                groups: [
                  { count: 1, group: 3 }
                ]
              },
              {
                answer: 'other',
                count: 3,
                groups: [
                  { count: 3, group: nil }
                ]
              }
            ],
            multilocs: {
              answer: {
                'la' => { title_multiloc: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' } },
                'ny' => { title_multiloc: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' } },
                'other' => { title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' } }
              },
              group: {
                1 => { title_multiloc: { 'en' => '1 - Strongly disagree', 'fr-FR' => "1 - Pas du tout d'accord", 'nl-NL' => '1 - Helemaal niet mee eens' } },
                2 => { title_multiloc: { 'en' => '2 - Disagree', 'fr-FR' => '2 - Être en désaccord', 'nl-NL' => '2 - Niet mee eens' } },
                3 => { title_multiloc: { 'en' => '3 - Slightly disagree', 'fr-FR' => '3 - Plutôt en désaccord', 'nl-NL' => '3 - Enigszins oneens' } },
                4 => { title_multiloc: { 'en' => '4 - Neutral', 'fr-FR' => '4 - Neutre', 'nl-NL' => '4 - Neutraal' } },
                5 => { title_multiloc: { 'en' => '5 - Slightly agree', 'fr-FR' => "5 - Plutôt d'accord", 'nl-NL' => '5 - Enigszins eens' } },
                6 => { title_multiloc: { 'en' => '6 - Agree', 'fr-FR' => "6 - D'accord", 'nl-NL' => '6 - Mee eens' } },
                7 => { title_multiloc: { 'en' => '7 - Strongly agree', 'fr-FR' => "7 - Tout à fait d'accord", 'nl-NL' => '7 - Strerk mee eens' } }
              }
            },
            legend: [7, 6, 5, 4, 3, 2, 1, nil],
            textResponses: [
              { answer: 'Austin' },
              { answer: 'Miami' },
              { answer: 'Seattle' }
            ]
          }
        end

        it 'groups select by gender user field' do
          generator = described_class.new(survey_phase,
            group_mode: 'user_field',
            group_field_id: gender_user_custom_field.id)
          expect(generator.generate_results(
            field_id: select_field.id
          )).to match expected_result_select_with_gender_user_field_grouping
        end

        it 'groups select by domicile user field' do
          generator = described_class.new(survey_phase,
            group_mode: 'user_field',
            group_field_id: domicile_user_custom_field.id)
          result = generator.generate_results(field_id: select_field.id)
          expect(result).to match expected_result_select_with_domicile_user_field_grouping

          # Additional check to ensure we're only making one query to fetch the areas
          expect { generator.generate_results(field_id: select_field.id) }.not_to exceed_query_limit(1).with(/SELECT.*areas/)
        end

        it 'groups by linear scale' do
          generator = described_class.new(survey_phase,
            group_mode: 'survey_question',
            group_field_id: linear_scale_field.id)
          result = generator.generate_results(
            field_id: select_field.id
          )

          expect(result).to match expected_result_select_sliced_by_linear_scale
        end
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
          maybeSkippedByLogic: false,
          totalResponseCount: 27,
          questionResponseCount: 3,
          totalPickCount: 27,
          answers: [
            { answer: nil, count: 24 },
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

      context 'with grouping' do
        it 'groups multiselect image by survey question' do
          generator = described_class.new(survey_phase,
            group_mode: 'survey_question',
            group_field_id: select_field.id)
          result = generator.generate_results(
            field_id: multiselect_image_field.id
          )

          expect(result[:answers]).to match [
            {
              answer: nil,
              count: 24,
              groups: [
                { count: 1, group: 'la' },
                { count: 1, group: 'ny' },
                { count: 1, group: 'other' },
                { count: 21, group: nil }
              ]
            },
            {
              answer: 'house',
              count: 2,
              groups: [
                { count: 2, group: 'other' }
              ]
            },
            {
              answer: 'school',
              count: 1,
              groups: [
                { count: 1, group: 'la' }
              ]
            }
          ]
        end
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
          maybeSkippedByLogic: false,
          totalResponseCount: 27,
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

    describe 'shapefile upload fields' do
      let(:expected_result_shapefile_upload) do
        {
          customFieldId: shapefile_upload_field.id,
          inputType: 'shapefile_upload',
          question: { 'en' => 'Upload a file' },
          required: false,
          grouped: false,
          maybeSkippedByLogic: false,
          totalResponseCount: 27,
          questionResponseCount: 1,
          files: [
            { name: end_with('.pdf'), url: end_with('.pdf') }
          ]
        }
      end

      it 'returns the results for file upload field' do
        expect(generated_results[:results][8]).to match expected_result_shapefile_upload
      end
    end

    describe 'point fields' do
      let(:expected_result_point) do
        {
          inputType: 'point',
          question: { 'en' => 'Where should the new nursery be located?' },
          required: false,
          grouped: false,
          maybeSkippedByLogic: false,
          questionResponseCount: 2,
          totalResponseCount: 27,
          customFieldId: point_field.id,
          mapConfigId: map_config_for_point.id,
          pointResponses: a_collection_containing_exactly(
            { answer: { 'coordinates' => [42.42, 24.24], 'type' => 'Point' } },
            { answer: { 'coordinates' => [11.22, 33.44], 'type' => 'Point' } }
          )
        }
      end

      it 'returns the results for a point field' do
        expect(generated_results[:results][9]).to match expected_result_point
      end
    end

    describe 'line fields' do
      let(:expected_result_line) do
        {
          inputType: 'line',
          question: { 'en' => 'Where should we build the new bicycle path?' },
          required: false,
          grouped: false,
          maybeSkippedByLogic: false,
          questionResponseCount: 2,
          totalResponseCount: 27,
          customFieldId: line_field.id,
          mapConfigId: map_config_for_line.id,
          lineResponses: a_collection_containing_exactly(
            { answer: { 'coordinates' => [[1.1, 2.2], [3.3, 4.4]], 'type' => 'LineString' } },
            { answer: { 'coordinates' => [[1.2, 2.3], [3.4, 4.5]], 'type' => 'LineString' } }
          )
        }
      end

      it 'returns the results for a line field' do
        expect(generated_results[:results][10]).to match expected_result_line
      end
    end

    describe 'polygon fields' do
      let(:expected_result_polygon) do
        {
          inputType: 'polygon',
          question: { 'en' => 'Where should we build the new housing?' },
          required: false,
          grouped: false,
          maybeSkippedByLogic: false,
          questionResponseCount: 2,
          totalResponseCount: 27,
          customFieldId: polygon_field.id,
          mapConfigId: map_config_for_polygon.id,
          polygonResponses: a_collection_containing_exactly(
            { answer: { 'coordinates' => [[[1.1, 2.2], [3.3, 4.4], [5.5, 6.6], [1.1, 2.2]]], 'type' => 'Polygon' } },
            { answer: { 'coordinates' => [[[1.2, 2.3], [3.4, 4.5], [5.6, 6.7], [1.2, 2.3]]], 'type' => 'Polygon' } }
          )
        }
      end

      it 'returns the results for a polygon field' do
        expect(generated_results[:results][11]).to match expected_result_polygon
      end
    end

    describe 'number fields' do
      let(:expected_result_number) do
        {
          inputType: 'number',
          question: { 'en' => 'How many cats would you like?' },
          required: false,
          grouped: false,
          maybeSkippedByLogic: false,
          questionResponseCount: 1,
          totalResponseCount: 27,
          customFieldId: number_field.id,
          numberResponses: a_collection_containing_exactly(
            { answer: 42 }
          )
        }
      end

      it 'returns the results for a number field' do
        expect(generated_results[:results][12]).to match expected_result_number
      end
    end
  end

  describe 'maybe_skipped_fields' do
    # TODO: JS - Add some more tests here
    it 'returns the IDs of fields that may have been skipped by logic' do
      mock_fields = [
        { id: '1', input_type: 'page', logic: {} },
        { id: '2', input_type: 'select', logic: { 'rules' => [{ 'if' => 'a', 'goto_page_id' => '6' }] } },
        { id: '3', input_type: 'page', logic: {} },
        { id: '4', input_type: 'text', logic: {} }, # May be skipped
        { id: '5', input_type: 'text', logic: {} }, # May be skipped
        { id: '6', input_type: 'page', logic: {} }
      ]
      expect(generator.send(:maybe_skipped_fields, mock_fields)).to eq %w[4 5]
    end

    it 'returns nothing if no logic' do
      mock_fields = [
        { id: 1234, input_type: 'page', logic: {} },
        { id: 5678, input_type: 'text', logic: {} }
      ]
      expect(generator.send(:maybe_skipped_fields, mock_fields)).to eq []
    end
  end
end
