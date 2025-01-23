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
  let_it_be(:page_field) { create(:custom_field_page, resource: form) }
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
      description_multiloc: {},
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
      description_multiloc: {},
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
        expect(generated_results[:results].count).to eq 14
        expect(generated_results[:results].pluck(:customFieldId)).not_to include disabled_multiselect_field.id
      end
    end

    describe 'page fields' do
      it 'returns correct values for a page field in full results' do
        page_result = generated_results[:results][0]
        expect(page_result[:inputType]).to eq 'page'
        expect(page_result[:totalResponseCount]).to eq(27)
        expect(page_result[:questionResponseCount]).to eq(22)
        expect(page_result[:pageNumber]).to eq(1)
        expect(page_result[:questionNumber]).to be_nil
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
          description: {},
          hidden: false,
          pageNumber: nil,
          questionNumber: 1,
          logic: {},
          textResponses: [
            { answer: 'Blue' },
            { answer: 'Green' },
            { answer: 'Pink' },
            { answer: 'Red' }
          ]
        }
      end

      it 'returns the results for a text field' do
        expect(generated_results[:results][1]).to match expected_result_text_field
      end

      it 'returns a single result for a text field' do
        expected_result_text_field[:questionNumber] = nil # Question number is null when requesting a single result
        expect(generator.generate_results(field_id: text_field.id)).to match expected_result_text_field
      end

      it 'returns the results for an unanswered field' do
        expect(generated_results[:results][7]).to match(
          {
            customFieldId: unanswered_text_field.id,
            inputType: 'text',
            description: {},
            hidden: false,
            pageNumber: nil,
            questionNumber: 7,
            logic: {},
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
        expect(generated_results[:results][2]).to match(
          {
            customFieldId: multiline_text_field.id,
            inputType: 'multiline_text',
            question: { 'en' => 'What is your favourite recipe?' },
            required: false,
            grouped: false,
            description: {},
            hidden: false,
            pageNumber: nil,
            questionNumber: 2,
            logic: {},
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
          description: {},
          hidden: false,
          pageNumber: nil,
          questionNumber: 3,
          logic: {},
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
              'cat' => { title_multiloc: { 'en' => 'Cat', 'fr-FR' => 'Chat', 'nl-NL' => 'Kat' }, id: an_instance_of(String), logic: {} },
              'cow' => { title_multiloc: { 'en' => 'Cow', 'fr-FR' => 'Vache', 'nl-NL' => 'Koe' }, id: an_instance_of(String), logic: {} },
              'dog' => { title_multiloc: { 'en' => 'Dog', 'fr-FR' => 'Chien', 'nl-NL' => 'Hond' }, id: an_instance_of(String), logic: {} },
              'no_response' => { title_multiloc: { 'en' => 'Nothing', 'fr-FR' => 'Rien', 'nl-NL' => 'Niets' }, id: an_instance_of(String), logic: {} },
              'pig' => { title_multiloc: { 'en' => 'Pig', 'fr-FR' => 'Porc', 'nl-NL' => 'Varken' }, id: an_instance_of(String), logic: {} },
              'no_answer' => { title_multiloc: {}, id: an_instance_of(String), logic: {} }
            }
          }
        }
      end

      context 'without grouping' do
        it 'returns the results for a multi-select field' do
          expect(generated_results[:results][3]).to match expected_result_multiselect
        end

        it 'returns a single result for multiselect' do
          expected_result_multiselect[:questionNumber] = nil
          expect(generator.generate_results(field_id: multiselect_field.id)).to match expected_result_multiselect
        end
      end

      context 'with grouping' do
        let(:expected_result_multiselect_with_user_field_grouping) do
          expected_result_multiselect.tap do |result|
            result[:questionNumber] = nil
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
              'unspecified' => { title_multiloc: { 'en' => 'youth council', 'fr-FR' => 'conseil des jeunes', 'nl-NL' => 'jeugdraad' } },
              'no_answer' => { title_multiloc: {} }
            }
          end
        end

        let(:expected_result_multiselect_with_select_field_grouping) do
          expected_result_multiselect.tap do |result|
            result[:questionNumber] = nil
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
              'other' => { title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' } },
              'no_answer' => { title_multiloc: {} }
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
          description: { 'en' => 'Please indicate how strong you agree or disagree.' },
          hidden: false,
          pageNumber: nil,
          questionNumber: nil,
          logic: {},
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
              1 => { title_multiloc: { 'en' => '1 - Strongly disagree', 'fr-FR' => "1 - Pas du tout d'accord", 'nl-NL' => '1 - Helemaal niet mee eens' }, id: "#{linear_scale_field.id}_1", logic: {} },
              2 => { title_multiloc: { 'en' => '2 - Disagree', 'fr-FR' => '2 - Être en désaccord', 'nl-NL' => '2 - Niet mee eens' }, id: "#{linear_scale_field.id}_2", logic: {} },
              3 => { title_multiloc: { 'en' => '3 - Slightly disagree', 'fr-FR' => '3 - Plutôt en désaccord', 'nl-NL' => '3 - Enigszins oneens' }, id: "#{linear_scale_field.id}_3", logic: {} },
              4 => { title_multiloc: { 'en' => '4 - Neutral', 'fr-FR' => '4 - Neutre', 'nl-NL' => '4 - Neutraal' }, id: "#{linear_scale_field.id}_4", logic: {} },
              5 => { title_multiloc: { 'en' => '5 - Slightly agree', 'fr-FR' => "5 - Plutôt d'accord", 'nl-NL' => '5 - Enigszins eens' }, id: "#{linear_scale_field.id}_5", logic: {} },
              6 => { title_multiloc: { 'en' => '6 - Agree', 'fr-FR' => "6 - D'accord", 'nl-NL' => '6 - Mee eens' }, id: "#{linear_scale_field.id}_6", logic: {} },
              7 => { title_multiloc: { 'en' => '7 - Strongly agree', 'fr-FR' => "7 - Tout à fait d'accord", 'nl-NL' => '7 - Strerk mee eens' }, id: "#{linear_scale_field.id}_7", logic: {} },
              'no_answer' => { title_multiloc: {}, id: "#{linear_scale_field.id}_no_answer", logic: {} }
            }
          }
        }
      end

      it 'returns the results for a linear scale field' do
        expected_result_linear_scale[:questionNumber] = 4
        expect(generated_results[:results][4]).to match expected_result_linear_scale
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
            description: { 'en' => 'Please indicate how strong you agree or disagree.' },
            hidden: false,
            pageNumber: nil,
            questionNumber: nil,
            logic: {},
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
                1 => hash_including(title_multiloc: { 'en' => '1 - Strongly disagree', 'fr-FR' => "1 - Pas du tout d'accord", 'nl-NL' => '1 - Helemaal niet mee eens' }),
                2 => hash_including(title_multiloc: { 'en' => '2 - Disagree', 'fr-FR' => '2 - Être en désaccord', 'nl-NL' => '2 - Niet mee eens' }),
                3 => hash_including(title_multiloc: { 'en' => '3 - Slightly disagree', 'fr-FR' => '3 - Plutôt en désaccord', 'nl-NL' => '3 - Enigszins oneens' }),
                4 => hash_including(title_multiloc: { 'en' => '4 - Neutral', 'fr-FR' => '4 - Neutre', 'nl-NL' => '4 - Neutraal' }),
                5 => hash_including(title_multiloc: { 'en' => '5 - Slightly agree', 'fr-FR' => "5 - Plutôt d'accord", 'nl-NL' => '5 - Enigszins eens' }),
                6 => hash_including(title_multiloc: { 'en' => '6 - Agree', 'fr-FR' => "6 - D'accord", 'nl-NL' => '6 - Mee eens' }),
                7 => hash_including(title_multiloc: { 'en' => '7 - Strongly agree', 'fr-FR' => "7 - Tout à fait d'accord", 'nl-NL' => '7 - Strerk mee eens' }),
                'no_answer' => hash_including(title_multiloc: {})
              },
              group: {
                'la' => { title_multiloc: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' } },
                'ny' => { title_multiloc: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' } },
                'other' => { title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' } },
                'no_answer' => { title_multiloc: {} }
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
          description: {},
          hidden: false,
          pageNumber: nil,
          questionNumber: nil,
          logic: {},
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
              'la' => hash_including(title_multiloc: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' }),
              'ny' => hash_including(title_multiloc: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' }),
              'other' => hash_including(title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' }),
              'no_answer' => hash_including(title_multiloc: {})
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
          expected_result_select[:questionNumber] = 5
          expect(generated_results[:results][5]).to match expected_result_select
        end

        it 'returns select answers in order of the number of responses, with other always last' do
          answers = generated_results[:results][5][:answers]
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
              'unspecified' => { title_multiloc: { 'en' => 'youth council', 'fr-FR' => 'conseil des jeunes', 'nl-NL' => 'jeugdraad' } },
              'no_answer' => { title_multiloc: {} }
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
              somewhere_else_key => { title_multiloc: domicile_user_custom_field.options.last.title_multiloc },
              'no_answer' => { title_multiloc: {} }
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
            description: {},
            hidden: false,
            pageNumber: nil,
            questionNumber: nil,
            logic: {},
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
                'la' => hash_including(title_multiloc: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' }),
                'ny' => hash_including(title_multiloc: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' }),
                'other' => hash_including(title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' }),
                'no_answer' => hash_including(title_multiloc: {})
              },
              group: {
                1 => { title_multiloc: { 'en' => '1 - Strongly disagree', 'fr-FR' => "1 - Pas du tout d'accord", 'nl-NL' => '1 - Helemaal niet mee eens' } },
                2 => { title_multiloc: { 'en' => '2 - Disagree', 'fr-FR' => '2 - Être en désaccord', 'nl-NL' => '2 - Niet mee eens' } },
                3 => { title_multiloc: { 'en' => '3 - Slightly disagree', 'fr-FR' => '3 - Plutôt en désaccord', 'nl-NL' => '3 - Enigszins oneens' } },
                4 => { title_multiloc: { 'en' => '4 - Neutral', 'fr-FR' => '4 - Neutre', 'nl-NL' => '4 - Neutraal' } },
                5 => { title_multiloc: { 'en' => '5 - Slightly agree', 'fr-FR' => "5 - Plutôt d'accord", 'nl-NL' => '5 - Enigszins eens' } },
                6 => { title_multiloc: { 'en' => '6 - Agree', 'fr-FR' => "6 - D'accord", 'nl-NL' => '6 - Mee eens' } },
                7 => { title_multiloc: { 'en' => '7 - Strongly agree', 'fr-FR' => "7 - Tout à fait d'accord", 'nl-NL' => '7 - Strerk mee eens' } },
                'no_answer' => { title_multiloc: {} }
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
          description: {},
          hidden: false,
          pageNumber: nil,
          questionNumber: 6,
          logic: {},
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
              ),
              'no_answer' => hash_including(title_multiloc: {})
            }
          }
        }
      end

      it 'returns the results for a multi-select image field' do
        expect(generated_results[:results][6]).to match expected_result_multiselect_image
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
          description: {},
          hidden: false,
          pageNumber: nil,
          questionNumber: 8,
          logic: {},
          totalResponseCount: 27,
          questionResponseCount: 1,
          files: [
            { name: end_with('.pdf'), url: end_with('.pdf') }
          ]
        }
      end

      it 'returns the results for file upload field' do
        expect(generated_results[:results][8]).to match expected_result_file_upload
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
          description: {},
          hidden: false,
          pageNumber: nil,
          questionNumber: 9,
          logic: {},
          totalResponseCount: 27,
          questionResponseCount: 1,
          files: [
            { name: end_with('.pdf'), url: end_with('.pdf') }
          ]
        }
      end

      it 'returns the results for file upload field' do
        expect(generated_results[:results][9]).to match expected_result_shapefile_upload
      end
    end

    describe 'point fields' do
      let(:expected_result_point) do
        {
          inputType: 'point',
          question: { 'en' => 'Where should the new nursery be located?' },
          required: false,
          grouped: false,
          description: {},
          hidden: false,
          pageNumber: nil,
          questionNumber: 10,
          logic: {},
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
        expect(generated_results[:results][10]).to match expected_result_point
      end
    end

    describe 'line fields' do
      let(:expected_result_line) do
        {
          inputType: 'line',
          question: { 'en' => 'Where should we build the new bicycle path?' },
          required: false,
          grouped: false,
          description: {},
          hidden: false,
          pageNumber: nil,
          questionNumber: 11,
          logic: {},
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
        expect(generated_results[:results][11]).to match expected_result_line
      end
    end

    describe 'polygon fields' do
      let(:expected_result_polygon) do
        {
          inputType: 'polygon',
          question: { 'en' => 'Where should we build the new housing?' },
          required: false,
          grouped: false,
          description: {},
          hidden: false,
          pageNumber: nil,
          questionNumber: 12,
          logic: {},
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
        expect(generated_results[:results][12]).to match expected_result_polygon
      end
    end

    describe 'number fields' do
      let(:expected_result_number) do
        {
          inputType: 'number',
          question: { 'en' => 'How many cats would you like?' },
          required: false,
          grouped: false,
          description: {},
          hidden: false,
          pageNumber: nil,
          questionNumber: 13,
          logic: {},
          questionResponseCount: 1,
          totalResponseCount: 27,
          customFieldId: number_field.id,
          numberResponses: a_collection_containing_exactly(
            { answer: 42 }
          )
        }
      end

      it 'returns the results for a number field' do
        expect(generated_results[:results][13]).to match expected_result_number
      end
    end
  end

  describe 'add_logic_to_results' do
    # NOTE: Most of the object below is not needed for the tests, but it's included for completeness
    # Field IDs & Page IDs that would be uuids normally are replaced here for readability
    let_it_be(:results_without_logic) do
      [
        {
          inputType: 'page',
          question: {},
          description: {},
          customFieldId: 'PAGE_1',
          required: false,
          grouped: false,
          hidden: false,
          totalResponseCount: 2,
          questionResponseCount: 2,
          pageNumber: 1,
          questionNumber: nil,
          logic: {}
        },
        {
          inputType: 'select',
          question: { en: 'Select question 1' },
          description: {},
          customFieldId: 'SELECT_1',
          required: false,
          grouped: false,
          hidden: false,
          totalResponseCount: 2,
          questionResponseCount: 2,
          pageNumber: nil,
          questionNumber: 1,
          logic: {},
          totalPickCount: 2,
          answers: [
            { answer: 'option_1', count: 1 },
            { answer: 'option_3', count: 1 },
            { answer: 'option_2', count: 0 },
            { answer: nil, count: 0 }
          ],
          multilocs: {
            answer: {
              option_1: {
                title_multiloc: { en: 'Option 1' },
                id: 'SELECT_1_OPTION_1',
                logic: { nextPageId: 'PAGE_3' }
              },
              option_2: {
                title_multiloc: { en: 'Option 2' },
                id: 'SELECT_1_OPTION_2',
                logic: { nextPageId: 'PAGE_2' }
              },
              option_3: {
                title_multiloc: { en: 'Option 3' },
                id: 'SELECT_1_OPTION_3',
                logic: { nextPageId: 'PAGE_4' }
              },
              no_answer: {
                title_multiloc: {},
                id: 'SELECT_OPTION_no_answer',
                logic: {}
              }
            }
          }
        },
        {
          inputType: 'page',
          question: { en: 'Page 2' },
          description: {},
          customFieldId: 'PAGE_2',
          required: false,
          grouped: false,
          hidden: false,
          totalResponseCount: 2,
          questionResponseCount: 1,
          pageNumber: 2,
          questionNumber: nil,
          logic: { nextPageId: 'survey_end' }
        },
        {
          inputType: 'text',
          question: { en: 'Text field 1' },
          description: {},
          customFieldId: 'TEXT_FIELD_1',
          required: false,
          grouped: false,
          hidden: false,
          totalResponseCount: 2,
          questionResponseCount: 0,
          pageNumber: nil,
          questionNumber: 2,
          logic: {},
          textResponses: []
        },
        {
          inputType: 'linear_scale',
          question: { en: 'Linear scale question 1' },
          description: {},
          customFieldId: 'LINEAR_SCALE_1',
          required: false,
          grouped: false,
          hidden: false,
          totalResponseCount: 2,
          questionResponseCount: 1,
          pageNumber: nil,
          questionNumber: 3,
          logic: {},
          totalPickCount: 2,
          answers: [
            { answer: 5, count: 0 },
            { answer: 4, count: 0 },
            { answer: 3, count: 1 },
            { answer: 2, count: 0 },
            { answer: 1, count: 0 },
            { answer: nil, count: 1 }
          ],
          multilocs: {
            answer: {
              '1': {
                title_multiloc: { en: '1' },
                id: 'LINEAR_SCALE_OPTION_1',
                logic: { nextPageId: nil }
              },
              '2': {
                title_multiloc: { en: '2' },
                id: 'LINEAR_SCALE_OPTION_2',
                logic: { nextPageId: 'PAGE_3' }
              },
              '3': {
                title_multiloc: { en: '3' },
                id: 'LINEAR_SCALE_OPTION_3',
                logic: { nextPageId: 'PAGE_4' }
              },
              '4': {
                title_multiloc: { en: '4' },
                id: 'LINEAR_SCALE_OPTION_4',
                logic: { nextPageId: nil }
              },
              '5': {
                title_multiloc: { en: '5' },
                id: 'LINEAR_SCALE_OPTION_5',
                logic: { nextPageId: nil }
              },
              no_answer: {
                title_multiloc: {},
                id: 'LINEAR_SCALE_OPTION_no_answer',
                logic: { nextPageId: 'survey_end' }
              }
            }
          }
        },
        {
          inputType: 'multiselect',
          question: { en: 'Multiselect question 1' },
          description: {},
          customFieldId: 'MULTISELECT_1',
          required: false,
          grouped: false,
          hidden: false,
          totalResponseCount: 2,
          questionResponseCount: 1,
          pageNumber: nil,
          questionNumber: 4,
          logic: {},
          totalPickCount: 3,
          answers: [
            { answer: 'option_1', count: 1 },
            { answer: 'option_2', count: 1 },
            { answer: nil, count: 1 },
            { answer: 'option_3', count: 0 }
          ],
          multilocs: {
            answer: {
              option_1: {
                title_multiloc: { en: 'Option 1' },
                id: 'MULTISELECT_1_OPTION_1',
                logic: { nextPageId: nil }
              },
              option_2: {
                title_multiloc: { en: 'Option 2' },
                id: 'MULTISELECT_1_OPTION_2',
                logic: { nextPageId: nil }
              },
              option_3: {
                title_multiloc: { en: 'Option 3' },
                id: 'MULTISELECT_1_OPTION_3',
                logic: { nextPageId: 'PAGE_4' }
              },
              no_answer: {
                title_multiloc: {},
                id: 'MULTISELECT_1_OPTION_no_answer',
                logic: { nextPageId: 'survey_end' }
              }
            }
          }
        },
        {
          inputType: 'page',
          question: { en: 'Page 3' },
          description: {},
          customFieldId: 'PAGE_3',
          required: false,
          grouped: false,
          hidden: false,
          totalResponseCount: 2,
          questionResponseCount: 0,
          pageNumber: 3,
          questionNumber: nil,
          logic: {}
        },
        {
          inputType: 'select',
          question: { en: 'Select field 2' },
          description: {},
          customFieldId: 'SELECT_2',
          required: false,
          grouped: false,
          hidden: false,
          totalResponseCount: 2,
          questionResponseCount: 0,
          pageNumber: nil,
          questionNumber: 5,
          logic: {},
          totalPickCount: 2,
          answers: [
            { answer: nil, count: 2 },
            { answer: 'option_1', count: 0 },
            { answer: 'option_2', count: 0 }
          ],
          multilocs: {
            answer: {
              option_1: {
                title_multiloc: { en: 'Option 2' },
                id: 'SELECT_2_OPTION_1',
                logic: { nextPageId: 'survey_end' }
              },
              option_2: {
                title_multiloc: { en: 'Option 2' },
                id: 'SELECT_2_OPTION_2',
                logic: { nextPageId: nil }
              },
              no_answer: {
                title_multiloc: {},
                id: 'SELECT_2_no_answer',
                logic: {}
              }
            }
          }
        },
        {
          inputType: 'text',
          question: { en: 'Text field 3' },
          description: {},
          customFieldId: 'TEXT_3',
          required: false,
          grouped: false,
          hidden: false,
          totalResponseCount: 2,
          questionResponseCount: 0,
          pageNumber: nil,
          questionNumber: 6,
          logic: {},
          textResponses: []
        },
        {
          inputType: 'page',
          question: { en: 'Page 4' },
          description: {},
          customFieldId: 'PAGE_4',
          required: false,
          grouped: false,
          hidden: false,
          totalResponseCount: 2,
          questionResponseCount: 0,
          pageNumber: 4,
          questionNumber: nil,
          logic: {}
        },
        {
          inputType: 'text',
          question: { en: 'Text field 4' },
          description: {},
          customFieldId: 'TEXT_4',
          required: false,
          grouped: false,
          hidden: false,
          totalResponseCount: 2,
          questionResponseCount: 0,
          pageNumber: nil,
          questionNumber: 7,
          logic: {},
          textResponses: []
        }
      ]
    end

    let(:results) { generator.send(:add_logic_to_results, results_without_logic, logic_ids: []) }

    # TODO: JS - we need some tests to make sure that the logic IDs are correctly added in the first place

    it 'returns logic information for single select options' do
      select_result = results[1]
      expect(select_result[:multilocs][:answer][:option_1][:logic]).to match(
        { nextPageNumber: 3, numQuestionsSkipped: 3 }
      )
      expect(select_result[:multilocs][:answer][:option_3][:logic]).to match(
        { nextPageNumber: 4, numQuestionsSkipped: 5 }
      )
    end

    it 'returns logic information for a page linking to survey end' do
      page_result = results[2]
      expect(page_result[:logic]).to match(
        { nextPageNumber: 999, numQuestionsSkipped: 5 }
      )
    end

    it 'returns logic information for a linear scale field' do
      linear_scale_result = results[4]
      expect(linear_scale_result[:multilocs][:answer][:'2'][:logic]).to match(
        { nextPageNumber: 3, numQuestionsSkipped: 0 }
      )
      expect(linear_scale_result[:multilocs][:answer][:'3'][:logic]).to match(
        { nextPageNumber: 4, numQuestionsSkipped: 2 }
      )
      expect(linear_scale_result[:multilocs][:answer][:no_answer][:logic]).to match(
        { nextPageNumber: 999, numQuestionsSkipped: 3 }
      )
    end

    it 'returns logic information for a multiselect field' do
      multiselect_result = results[5]
      expect(multiselect_result[:multilocs][:answer][:option_3][:logic]).to match(
        { nextPageNumber: 4, numQuestionsSkipped: 2 }
      )
      expect(multiselect_result[:multilocs][:answer][:no_answer][:logic]).to match(
        { nextPageNumber: 999, numQuestionsSkipped: 3 }
      )
    end

    context 'when filtering by logic_ids' do
      it 'flags no fields as hidden if no logic IDs are provided' do
        results = generator.send(:add_logic_to_results, results_without_logic, [])
        expect(results.pluck(:hidden)).to eq(
          [false, false, false, false, false, false, false, false, false, false, false]
        )
      end

      it 'flags fields as hidden when a page ID is provided' do
        logic_ids = ['PAGE_2']
        results = generator.send(:add_logic_to_results, results_without_logic, logic_ids)
        hidden_field_ids = results.select { |r| r[:hidden] == true }.pluck(:customFieldId)
        expect(hidden_field_ids).to eq(
          %w[PAGE_3 SELECT_2 TEXT_3 PAGE_4 TEXT_4]
        )
      end

      it 'flags fields as hidden when select option IDs are passed in' do
        logic_ids = %w[SELECT_1_OPTION_1 SELECT_1_OPTION_3]
        results = generator.send(:add_logic_to_results, results_without_logic, logic_ids)
        hidden_field_ids = results.select { |r| r[:hidden] == true }.pluck(:customFieldId)
        expect(hidden_field_ids).to eq(
          %w[PAGE_2 TEXT_FIELD_1 LINEAR_SCALE_1 MULTISELECT_1 PAGE_3 SELECT_2 TEXT_3]
        )
      end

      it 'flags fields as hidden when linear scale IDs are passed in' do
        logic_ids = %w[LINEAR_SCALE_OPTION_2]
        results = generator.send(:add_logic_to_results, results_without_logic, logic_ids)
        hidden_field_ids = results.select { |r| r[:hidden] == true }.pluck(:customFieldId)
        expect(hidden_field_ids).to eq([])

        logic_ids = %w[LINEAR_SCALE_OPTION_2 LINEAR_SCALE_OPTION_3]
        results = generator.send(:add_logic_to_results, results_without_logic, logic_ids)
        hidden_field_ids = results.select { |r| r[:hidden] == true }.pluck(:customFieldId)
        expect(hidden_field_ids).to eq(
          %w[PAGE_3 SELECT_2 TEXT_3]
        )

        logic_ids = %w[LINEAR_SCALE_OPTION_2 LINEAR_SCALE_OPTION_no_answer]
        results = generator.send(:add_logic_to_results, results_without_logic, logic_ids)
        hidden_field_ids = results.select { |r| r[:hidden] == true }.pluck(:customFieldId)
        expect(hidden_field_ids).to eq(
          %w[PAGE_3 SELECT_2 TEXT_3 PAGE_4 TEXT_4]
        )
      end

      it 'flags fields as hidden when multiselect IDs are passed in' do
        logic_ids = %w[MULTISELECT_1_OPTION_3]
        results = generator.send(:add_logic_to_results, results_without_logic, logic_ids)
        hidden_field_ids = results.select { |r| r[:hidden] == true }.pluck(:customFieldId)
        expect(hidden_field_ids).to eq(
          %w[PAGE_3 SELECT_2 TEXT_3]
        )

        logic_ids = %w[MULTISELECT_1_OPTION_no_answer]
        results = generator.send(:add_logic_to_results, results_without_logic, logic_ids)
        hidden_field_ids = results.select { |r| r[:hidden] == true }.pluck(:customFieldId)
        expect(hidden_field_ids).to eq(
          %w[PAGE_3 SELECT_2 TEXT_3 PAGE_4 TEXT_4]
        )
      end

      it 'flags fields as hidden when a mix of option IDs and page IDs are passed in' do
        logic_ids = %w[SELECT_1_OPTION_1 SELECT_1_OPTION_3 PAGE_2 LINEAR_SCALE_OPTION_3 MULTISELECT_1_OPTION_3]
        results = generator.send(:add_logic_to_results, results_without_logic, logic_ids)
        hidden_field_ids = results.select { |r| r[:hidden] == true }.pluck(:customFieldId)
        expect(hidden_field_ids).to eq(
          %w[PAGE_2 TEXT_FIELD_1 LINEAR_SCALE_1 MULTISELECT_1 PAGE_3 SELECT_2 TEXT_3 PAGE_4 TEXT_4]
        )
      end
    end
  end
end
