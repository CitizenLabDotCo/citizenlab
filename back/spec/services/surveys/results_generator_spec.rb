# frozen_string_literal: true

require 'rails_helper'
require './spec/services/surveys/shared/survey_setup'

# This spec describes:
#   * Unsupported fields are not considered. Unsupported means that we do
#     not have a visit_xxx method on the described class.
#   * Results are generated only for reportable fields (i.e. enabled).
#   * The order of the results is the same as the field order in the form.
#   * Results for one field are ordered in descending order.
#   * Result generation is supported for phases only.

RSpec.describe Surveys::ResultsGenerator do
  subject(:generator) { described_class.new survey_phase }

  include_context 'survey_setup'

  # NOTE: generate_result_for_field is mainly tested in the context of generate_results
  describe 'generate_result_for_field' do
    it 'raises an error if the specified field is not found' do
      generator = described_class.new(survey_phase)
      expect { generator.generate_result_for_field('missing_field') }.to raise_error('Question not found')
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
        expect(generated_results[:results].count).to eq 18
        expect(generated_results[:results].pluck(:customFieldId)).not_to include disabled_multiselect_field.id
      end
    end

    describe 'page fields' do
      it 'returns correct values for a page field in full results' do
        page_result = generated_results[:results][0]
        expect(page_result[:inputType]).to eq 'page'
        expect(page_result[:totalResponseCount]).to eq(27)
        expect(page_result[:questionResponseCount]).to eq(25)
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
          questionCategory: nil,
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
        expect(generator.generate_result_for_field(text_field.id)).to match expected_result_text_field
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
            questionCategory: nil,
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
            questionCategory: nil,
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

      it 'returns the results for a multi-select field' do
        expect(generated_results[:results][3]).to match expected_result_multiselect
      end

      it 'returns a single result for multiselect' do
        expected_result_multiselect[:questionNumber] = nil
        expect(generator.generate_result_for_field(multiselect_field.id)).to match expected_result_multiselect
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
          questionCategory: nil,
          totalResponseCount: 27,
          questionResponseCount: 22,
          totalPickCount: 27,
          averages: { this_period: 3.5 },
          answers: [
            { answer: 1, count: 2 },
            { answer: 2, count: 5 },
            { answer: 3, count: 8 },
            { answer: 4, count: 1 },
            { answer: 5, count: 1 },
            { answer: 6, count: 2 },
            { answer: 7, count: 3 },
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
        expected_result_linear_scale[:questionNumber] = 4
        expect(generated_results[:results][4]).to match expected_result_linear_scale
      end

      it 'returns a single result for a linear scale field' do
        expect(generator.generate_result_for_field(linear_scale_field.id)).to match expected_result_linear_scale
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
          expect(generator.generate_result_for_field(linear_scale_field.id)).to match expected_result_linear_scale_without_min_and_max_labels
        end
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
          description: { 'en' => 'Please rate your experience from 1 (poor) to 7 (excellent).' },
          hidden: false,
          pageNumber: nil,
          questionNumber: 16,
          questionCategory: nil,
          totalResponseCount: 27,
          questionResponseCount: 22,
          totalPickCount: 27,
          averages: { this_period: 3.5 },
          answers: [
            { answer: 1, count: 2 },
            { answer: 2, count: 5 },
            { answer: 3, count: 8 },
            { answer: 4, count: 1 },
            { answer: 5, count: 1 },
            { answer: 6, count: 2 },
            { answer: 7, count: 3 },
            { answer: nil, count: 5 }
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
        expect(generated_results[:results][16]).to match expected_result_rating
      end

      it 'returns a single result for a rating field' do
        expected_result_rating[:questionNumber] = nil # Question number is null when requesting a single result
        expect(generator.generate_result_for_field(rating_field.id)).to match expected_result_rating
      end
    end

    describe 'sentiment linear scale field' do
      let(:expected_result_sentiment_linear_scale) do
        {
          customFieldId: sentiment_linear_scale_field.id,
          inputType: 'sentiment_linear_scale',
          question: {
            'en' => 'How are you feeling?',
            'fr-FR' => 'Comment te sens-tu?',
            'nl-NL' => 'Hoe gaat het met je?'
          },
          required: false,
          grouped: false,
          description: { 'en' => 'Please indicate how strong you agree or disagree.' },
          hidden: false,
          pageNumber: nil,
          questionNumber: 17,
          questionCategory: nil,
          totalResponseCount: 27,
          questionResponseCount: 25,
          totalPickCount: 27,
          averages: { this_period: 2.2 },
          answers: [
            { answer: 1, count: 8 },
            { answer: 2, count: 7 },
            { answer: 3, count: 8 },
            { answer: 4, count: 0 },
            { answer: 5, count: 2 },
            { answer: nil, count: 2 }
          ],
          multilocs: {
            answer: {
              1 => { title_multiloc: { 'en' => '1 - Strongly disagree', 'fr-FR' => '1', 'nl-NL' => '1' } },
              2 => { title_multiloc: { 'en' => '2 - Disagree', 'fr-FR' => '2', 'nl-NL' => '2' } },
              3 => { title_multiloc: { 'en' => '3 - Neutral', 'fr-FR' => '3', 'nl-NL' => '3' } },
              4 => { title_multiloc: { 'en' => '4 - Agree', 'fr-FR' => '4', 'nl-NL' => '4' } },
              5 => { title_multiloc: { 'en' => '5 - Strongly agree', 'fr-FR' => '5', 'nl-NL' => '5' } }
            }
          },
          textResponses: [
            { answer: 'Great thanks very much' },
            { answer: 'Just not good' }
          ]
        }
      end

      it 'returns the results for a sentiment linear scale field' do
        expect(generated_results[:results][17]).to match expected_result_sentiment_linear_scale
      end

      it 'returns a single result for a sentiment linear scale field' do
        expected_result_sentiment_linear_scale[:questionNumber] = nil # Question number is null when requesting a single result
        expect(generator.generate_result_for_field(sentiment_linear_scale_field.id)).to match expected_result_sentiment_linear_scale
      end
    end

    describe 'matrix_linear_scale field' do
      let(:expected_result_matrix_linear_scale) do
        {
          customFieldId: matrix_linear_scale_field.id,
          inputType: 'matrix_linear_scale',
          question: {
            'en' => 'Please indicate how strong you agree or disagree with the following statements.'
          },
          description: {},
          required: false,
          grouped: false,
          hidden: false,
          totalResponseCount: 27,
          questionResponseCount: 5,
          pageNumber: nil,
          questionNumber: 15,
          questionCategory: nil,
          multilocs: {
            answer: {
              1 => { title_multiloc: { 'en' => '1 - Strongly disagree', 'fr-FR' => '1', 'nl-NL' => '1' } },
              2 => { title_multiloc: { 'en' => '2', 'fr-FR' => '2', 'nl-NL' => '2' } },
              3 => { title_multiloc: { 'en' => '3', 'fr-FR' => '3', 'nl-NL' => '3' } },
              4 => { title_multiloc: { 'en' => '4', 'fr-FR' => '4', 'nl-NL' => '4' } },
              5 => { title_multiloc: { 'en' => '5 - Strongly agree', 'fr-FR' => '5', 'nl-NL' => '5' } }
            }
          },
          linear_scales: {
            'send_more_animals_to_space' => {
              question: {
                'en' => 'We should send more animals into space'
              },
              questionResponseCount: 4,
              answers: [
                { answer: 5, count: 0, percentage: 0.0 },
                { answer: 4, count: 1, percentage: 0.25 },
                { answer: 3, count: 1, percentage: 0.25 },
                { answer: 2, count: 0, percentage: 0.0 },
                { answer: 1, count: 2, percentage: 0.5 },
                { answer: nil, count: 23 }
              ]
            },
            'ride_bicycles_more_often' => {
              question: {
                'en' => 'We should ride our bicycles more often'
              },
              questionResponseCount: 4,
              answers: [
                { answer: 5, count: 0, percentage: 0.0 },
                { answer: 4, count: 2, percentage: 0.5 },
                { answer: 3, count: 2, percentage: 0.5 },
                { answer: 2, count: 0, percentage: 0.0 },
                { answer: 1, count: 0, percentage: 0.0 },
                { answer: nil, count: 23 }
              ]
            }
          }
        }
      end

      it 'returns the results for a matrix linear scale field' do
        expect(generated_results[:results][15]).to match expected_result_matrix_linear_scale
      end

      it 'returns a single result for a linear scale field' do
        expected_result_matrix_linear_scale[:questionNumber] = nil # Question number is null when requesting a single result
        expect(generator.generate_result_for_field(matrix_linear_scale_field.id)).to match expected_result_matrix_linear_scale
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
        expect(generator.generate_result_for_field(select_field.id)).to match expected_result_select
      end
    end

    describe 'ranking field' do
      let(:expected_result_ranking) do
        {
          customFieldId: ranking_field.id,
          inputType: 'ranking',
          question: {
            'en' => 'Rank your favourite means of public transport'
          },
          description: { 'en' => 'Favourite to least favourite' },
          required: false,
          grouped: false,
          hidden: false,
          pageNumber: nil,
          questionNumber: 14,
          questionCategory: nil,
          totalResponseCount: 27,
          questionResponseCount: 4,
          average_rankings: {
            'by_bike' => 1.25,
            'by_foot' => 2.75,
            'by_train' => 2
          },
          rankings_counts: {
            'by_bike' => {
              1 => 3,
              2 => 1,
              3 => 0
            },
            'by_foot' => {
              1 => 0,
              2 => 1,
              3 => 3
            },
            'by_train' => {
              1 => 1,
              2 => 2,
              3 => 1
            }
          },
          multilocs: {
            answer: {
              'by_foot' => { title_multiloc: { 'en' => 'By foot', 'fr-FR' => 'À pied', 'nl-NL' => 'Te voet' } },
              'by_bike' => { title_multiloc: { 'en' => 'By bike', 'fr-FR' => 'À vélo', 'nl-NL' => 'Met de fiets' } },
              'by_train' => { title_multiloc: { 'en' => 'By train', 'fr-FR' => 'En train', 'nl-NL' => 'Met de trein' } }
            }
          }
        }
      end

      it 'returns the correct results for a ranking field' do
        expect(generated_results[:results][14]).to match expected_result_ranking
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
          questionCategory: nil,
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
        expect(generated_results[:results][6]).to match expected_result_multiselect_image
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
          questionCategory: nil,
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
          questionCategory: nil,
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
          questionCategory: nil,
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
          questionCategory: nil,
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
          questionCategory: nil,
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
          questionCategory: nil,
          questionResponseCount: 1,
          totalResponseCount: 27,
          customFieldId: number_field.id,
          averages: { this_period: 42.0 },
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
end
