# frozen_string_literal: true

require 'rails_helper'

# NOTE: These tests are basic and will be updated when additional features specific to community monitor are added
RSpec.describe SurveyResultsGeneratorService do
  subject(:generator) { described_class.new survey_phase }

  let_it_be(:project) { create(:community_monitor_project) }
  let_it_be(:survey_phase) { create(:community_monitor_survey_phase, project: project) }
  let_it_be(:phases_of_inputs) { [survey_phase] }

  # Set-up custom form
  let_it_be(:form) { create(:custom_form, participation_context: survey_phase) }
  let_it_be(:page_field) { create(:custom_field_page, resource: form) }
  let_it_be(:rating_field) do
    create(
      :custom_field_rating,
      resource: form,
      title_multiloc: {
        'en' => 'How satisfied are you with our service?',
        'fr-FR' => 'À quel point êtes-vous satisfait de notre service ?',
        'nl-NL' => 'Hoe tevreden ben je met onze service?'
      },
      maximum: 7,
      required: true
    )
  end

  let_it_be(:text_field) do
    create(
      :custom_field,
      resource: form,
      title_multiloc: { 'en' => 'What is your favourite colour?' },
      description_multiloc: {}
    )
  end

  # The following page for form submission should not be returned in the results
  let_it_be(:last_page_field) do
    create(:custom_field_page, resource: form, key: 'survey_end')
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
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        rating_field.key => 3,
        text_field.key => 'Red'
      },
      author: female_user
    )
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        rating_field.key => 4,
        text_field.key => 'Blue'
      },
      author: male_user
    )
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        rating_field.key => 5,
        text_field.key => 'Green'
      },
      author: female_user
    )
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        rating_field.key => 5,
        text_field.key => 'Pink'
      },
      author: no_gender_user
    )
  end

  describe 'generate_results for community monitor surveys' do
    let(:generated_results) { generator.generate_results }

    describe 'structure' do
      it 'returns the correct totals' do
        expect(generated_results[:totalSubmissions]).to eq 4
      end

      it 'returns the correct fields and structure' do
        expect(generated_results[:results].count).to eq 3
        expect(generated_results[:results].pluck(:inputType)).to eq %w[page rating text]
      end
    end

    describe 'page fields' do
      it 'returns correct values for a page field in full results' do
        page_result = generated_results[:results][0]
        expect(page_result[:inputType]).to eq 'page'
        expect(page_result[:totalResponseCount]).to eq(4)
        expect(page_result[:questionResponseCount]).to eq(4)
        expect(page_result[:pageNumber]).to eq(1)
        expect(page_result[:questionNumber]).to be_nil
      end
    end

    describe 'rating field' do
      let(:expected_result_rating) do
        {
          customFieldId: rating_field.id,
          inputType: 'rating',
          question: {
            'en' => 'How satisfied are you with our service?',
            'fr-FR' => 'À quel point êtes-vous satisfait de notre service ?',
            'nl-NL' => 'Hoe tevreden ben je met onze service?'
          },
          required: true,
          grouped: false,
          description: { 'en' => 'Please rate your experience from 1 (poor) to 5 (excellent).' },
          hidden: false,
          logic: {},
          pageNumber: nil,
          questionNumber: nil,
          totalResponseCount: 4,
          questionResponseCount: 4,
          totalPickCount: 4,
          answers: [
            { answer: 1, count: 0 },
            { answer: 2, count: 0 },
            { answer: 3, count: 1 },
            { answer: 4, count: 1 },
            { answer: 5, count: 2 },
            { answer: 6, count: 0 },
            { answer: 7, count: 0 },
            { answer: nil, count: 0 }
          ],
          multilocs: {
            answer: {
              1 => { title_multiloc: { 'en' => '1', 'fr-FR' => '1', 'nl-NL' => '1' } },
              2 => { title_multiloc: { 'en' => '2', 'fr-FR' => '2', 'nl-NL' => '2' } },
              3 => { title_multiloc: { 'en' => '3', 'fr-FR' => '3', 'nl-NL' => '3' } },
              4 => { title_multiloc: { 'en' => '4', 'fr-FR' => '4', 'nl-NL' => '4' } },
              5 => { title_multiloc: { 'en' => '5', 'fr-FR' => '5', 'nl-NL' => '5' } },
              6 => { title_multiloc: { 'en' => '6', 'fr-FR' => '6', 'nl-NL' => '6' } },
              7 => { title_multiloc: { 'en' => '7', 'fr-FR' => '7', 'nl-NL' => '7' } }
            }
          }
        }
      end

      it 'returns the results for a rating field' do
        expected_result_rating[:questionNumber] = 1
        expect(generated_results[:results][1]).to match expected_result_rating
      end

      it 'returns a single result for a rating field' do
        expect(generator.generate_results(field_id: rating_field.id)).to match expected_result_rating
      end

      context 'with grouping' do
        let(:grouped_rating_results) do
          {
            customFieldId: rating_field.id,
            inputType: 'rating',
            question: {
              'en' => 'How satisfied are you with our service?',
              'fr-FR' => 'À quel point êtes-vous satisfait de notre service ?',
              'nl-NL' => 'Hoe tevreden ben je met onze service?'
            },
            required: true,
            grouped: true,
            description: { 'en' => 'Please rate your experience from 1 (poor) to 5 (excellent).' },
            hidden: false,
            logic: {},
            pageNumber: nil,
            questionNumber: nil,
            totalResponseCount: 4,
            questionResponseCount: 4,
            totalPickCount: 4,
            answers: [
              {
                answer: 1,
                count: 0,
                groups: []
              },
              {
                answer: 2,
                count: 0,
                groups: []
              },
              {
                answer: 3,
                count: 1,
                groups: [
                  { count: 1, group: 'female' }
                ]
              },
              {
                answer: 4,
                count: 1,
                groups: [
                  { count: 1, group: 'male' }
                ]
              },
              {
                answer: 5,
                count: 2,
                groups: [
                  { count: 1, group: 'female' },
                  { count: 1, group: nil }
                ]
              },
              {
                answer: 6,
                count: 0,
                groups: []
              },
              {
                answer: 7,
                count: 0,
                groups: []
              },
              {
                answer: nil,
                count: 0,
                groups: []
              }
            ],
            multilocs: {
              answer: {
                1 => { title_multiloc: { 'en' => '1', 'fr-FR' => '1', 'nl-NL' => '1' } },
                2 => { title_multiloc: { 'en' => '2', 'fr-FR' => '2', 'nl-NL' => '2' } },
                3 => { title_multiloc: { 'en' => '3', 'fr-FR' => '3', 'nl-NL' => '3' } },
                4 => { title_multiloc: { 'en' => '4', 'fr-FR' => '4', 'nl-NL' => '4' } },
                5 => { title_multiloc: { 'en' => '5', 'fr-FR' => '5', 'nl-NL' => '5' } },
                6 => { title_multiloc: { 'en' => '6', 'fr-FR' => '6', 'nl-NL' => '6' } },
                7 => { title_multiloc: { 'en' => '7', 'fr-FR' => '7', 'nl-NL' => '7' } }
              },
              group: {
                'female' => { title_multiloc: { 'en' => 'youth council', 'fr-FR' => 'conseil des jeunes', 'nl-NL' => 'jeugdraad' } },
                'male' => { title_multiloc: { 'en' => 'youth council', 'fr-FR' => 'conseil des jeunes', 'nl-NL' => 'jeugdraad' } },
                'unspecified' => { title_multiloc: { 'en' => 'youth council', 'fr-FR' => 'conseil des jeunes', 'nl-NL' => 'jeugdraad' } }
              }
            },
            legend: ['male', 'female', 'unspecified', nil]
          }
        end

        it 'returns a grouped result for a rating field' do
          generator = described_class.new(
            survey_phase,
            group_mode: 'user_field',
            group_field_id: gender_user_custom_field.id
          )
          result = generator.generate_results(
            field_id: rating_field.id
          )
          expect(result).to match grouped_rating_results
        end
      end
    end
  end
end
