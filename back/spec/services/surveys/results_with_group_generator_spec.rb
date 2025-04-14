# frozen_string_literal: true

require 'rails_helper'
require './spec/services/surveys/shared/survey_setup'

# NOTE: This spec tests only the grouping functionality that is overridden from the parent class.

RSpec.describe Surveys::ResultsWithGroupGenerator do
  subject(:generator) { described_class.new survey_phase }

  include_context 'survey_setup'

  describe 'generate_results' do
    it 'it is not implemented and returns an error' do
      generator = described_class.new(survey_phase)
      expect { generator.generate_results }.to raise_error(NotImplementedError)
    end
  end

  describe 'generate_result_for_field' do
    describe 'errors' do
      it 'raises an error if the group field is not found' do
        generator = described_class.new(survey_phase, group_field_id: '12345')
        expect { generator.generate_result_for_field('missing_field') }.to raise_error('Question not found')
      end

      it 'raises an error if the user group field is not found' do
        generator = described_class.new(survey_phase, group_mode: 'user_field', group_field_id: '12345')
        expect { generator.generate_result_for_field('missing_field') }.to raise_error(ActiveRecord::RecordNotFound)
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
          questionCategory: nil,
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
            'female' => { title_multiloc: { 'en' => 'Female' } },
            'male' => { title_multiloc: { 'en' => 'Male' } },
            'unspecified' => { title_multiloc: { 'en' => 'Unspecified' } }
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
            'other' => { title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' } }
          }
        end
      end

      it 'groups multiselect by user field' do
        generator = described_class.new(
          survey_phase,
          group_mode: 'user_field',
          group_field_id: gender_user_custom_field.id
        )
        expect(generator.generate_result_for_field(multiselect_field.id)).to match(
          expected_result_multiselect_with_user_field_grouping
        )
      end

      it 'groups multiselect by select field' do
        generator = described_class.new(
          survey_phase,
          group_field_id: select_field.id
        )
        expect(generator.generate_result_for_field(multiselect_field.id)).to match(
          expected_result_multiselect_with_select_field_grouping
        )
      end
    end

    describe 'linear scale field' do
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
          questionCategory: nil,
          totalResponseCount: 27,
          questionResponseCount: 22,
          totalPickCount: 27,
          averages: { this_period: 3.5 },
          answers: [
            { answer: 1, count: 2, groups: [
              { count: 2, group: nil }
            ] },
            { answer: 2, count: 5, groups: [
              { count: 5, group: nil }
            ] },
            { answer: 3, count: 8, groups: [
              { count: 1, group: 'ny' },
              { count: 7, group: nil }
            ] },
            { answer: 4, count: 1, groups: [
              { count: 1, group: 'la' }
            ] },
            { answer: 5, count: 1, groups: [
              { count: 1, group: nil }
            ] },
            { answer: 6, count: 2, groups: [
              { count: 2, group: nil }
            ] },
            { answer: 7, count: 3, groups: [
              { count: 3, group: nil }
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
              7 => hash_including(title_multiloc: { 'en' => '7 - Strongly agree', 'fr-FR' => "7 - Tout à fait d'accord", 'nl-NL' => '7 - Strerk mee eens' })
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
        result = generator.generate_result_for_field(linear_scale_field.id)
        expect(result).to match grouped_linear_scale_results
      end

      it 'returns a grouped result filtered by quarter for a linear scale field' do
        generator = described_class.new(
          survey_phase,
          group_mode: 'survey_question',
          group_field_id: select_field.id,
          year: 2025,
          quarter: 1
        )
        result = generator.generate_result_for_field(linear_scale_field.id)
        expect(result[:totalResponseCount]).to eq 23
        expect(result[:answers]).to match(
          [
            { answer: 1, count: 2, groups: [{ count: 2, group: nil }] },
            { answer: 2, count: 5, groups: [{ count: 5, group: nil }] },
            { answer: 3, count: 7, groups: [{ count: 7, group: nil }] },
            { answer: 4, count: 0, groups: [] },
            { answer: 5, count: 1, groups: [{ count: 1, group: nil }] },
            { answer: 6, count: 2, groups: [{ count: 2, group: nil }] },
            { answer: 7, count: 3, groups: [{ count: 3, group: nil }] },
            { answer: nil, count: 3, groups: [{ count: 1, group: 'la' }, { count: 1, group: 'other' }, { count: 1, group: nil }] }
          ]
        )
        expect(result[:averages]).to match({ this_period: 3.6, last_period: nil })
      end
    end

    describe 'rating field' do
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
          description: { 'en' => 'Please rate your experience from 1 (poor) to 7 (excellent).' },
          hidden: false,
          pageNumber: nil,
          questionNumber: nil,
          questionCategory: nil,
          totalResponseCount: 27,
          questionResponseCount: 22,
          totalPickCount: 27,
          averages: { this_period: 3.5 },
          answers: [
            { answer: 1, count: 2, groups: [
              { count: 2, group: nil }
            ] },
            { answer: 2, count: 5, groups: [
              { count: 5, group: nil }
            ] },
            { answer: 3, count: 8, groups: [
              { count: 1, group: 'ny' },
              { count: 7, group: nil }
            ] },
            { answer: 4, count: 1, groups: [
              { count: 1, group: 'la' }
            ] },
            { answer: 5, count: 1, groups: [
              { count: 1, group: nil }
            ] },
            { answer: 6, count: 2, groups: [
              { count: 2, group: nil }
            ] },
            { answer: 7, count: 3, groups: [
              { count: 3, group: nil }
            ] },
            { answer: nil, count: 5, groups: [
              { count: 1, group: 'la' },
              { count: 3, group: 'other' },
              { count: 1, group: nil }
            ] }
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
              'la' => { title_multiloc: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' } },
              'ny' => { title_multiloc: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' } },
              'other' => { title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' } }
            }
          },
          legend: ['la', 'ny', 'other', nil]
        }
      end

      it 'returns a grouped result for a rating field' do
        generator = described_class.new(survey_phase,
          group_mode: 'survey_question',
          group_field_id: select_field.id)
        result = generator.generate_result_for_field(rating_field.id)
        expect(result).to match grouped_rating_results
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
          questionCategory: nil,
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
              'other' => hash_including(title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' })
            }
          },
          textResponses: [
            { answer: 'Austin' },
            { answer: 'Miami' },
            { answer: 'Seattle' }
          ]
        }
      end

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
            'female' => { title_multiloc: { 'en' => 'Female' } },
            'male' => { title_multiloc: { 'en' => 'Male' } },
            'unspecified' => { title_multiloc: { 'en' => 'Unspecified' } }
          }
        end
      end

      let(:expected_result_select_with_domicile_user_field_grouping) do
        area_1_key = domicile_user_custom_field.ordered_transformed_options[0].key
        area_2_key = domicile_user_custom_field.ordered_transformed_options[1].key
        somewhere_else_key = domicile_user_custom_field.ordered_transformed_options.last.key
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
            area_1_key => { title_multiloc: domicile_user_custom_field.ordered_transformed_options[0].title_multiloc },
            area_2_key => { title_multiloc: domicile_user_custom_field.ordered_transformed_options[1].title_multiloc },
            somewhere_else_key => { title_multiloc: domicile_user_custom_field.ordered_transformed_options.last.title_multiloc }
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
          questionCategory: nil,
          totalResponseCount: 27,
          questionResponseCount: 6,
          totalPickCount: 27,
          answers: [
            {
              answer: nil,
              count: 21,
              groups: [
                { count: 2, group: 1 },
                { count: 5, group: 2 },
                { count: 7, group: 3 },
                { count: 1, group: 5 },
                { count: 2, group: 6 },
                { count: 3, group: 7 },
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
              'other' => hash_including(title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' })
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
          legend: [1, 2, 3, 4, 5, 6, 7, nil],
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
        expect(generator.generate_result_for_field(select_field.id)).to match expected_result_select_with_gender_user_field_grouping
      end

      it 'groups select by domicile user field' do
        generator = described_class.new(survey_phase,
          group_mode: 'user_field',
          group_field_id: domicile_user_custom_field.id)
        result = generator.generate_result_for_field(select_field.id)
        expect(result).to match expected_result_select_with_domicile_user_field_grouping

        # Additional check to ensure we're only making one query to fetch the areas
        expect { generator.generate_result_for_field(select_field.id) }.not_to exceed_query_limit(1).with(/SELECT.*areas/)
      end

      it 'groups by linear scale' do
        generator = described_class.new(survey_phase,
          group_mode: 'survey_question',
          group_field_id: linear_scale_field.id)
        result = generator.generate_result_for_field(select_field.id)

        expect(result).to match expected_result_select_sliced_by_linear_scale
      end
    end

    describe 'image select fields' do
      it 'groups multiselect image by survey question' do
        generator = described_class.new(survey_phase,
          group_mode: 'survey_question',
          group_field_id: select_field.id)
        result = generator.generate_result_for_field(multiselect_image_field.id)

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
end
