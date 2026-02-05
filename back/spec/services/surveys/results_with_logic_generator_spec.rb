# frozen_string_literal: true

require 'rails_helper'
require './spec/services/surveys/shared/survey_setup'

# NOTE: These tests only test the addition of logic to the results from the parent class

RSpec.describe Surveys::ResultsWithLogicGenerator do
  include_context 'survey_setup'

  let(:generator) { described_class.new survey_phase }

  describe 'generate_result_for_field' do
    it 'is not implemented and returns an error' do
      expect { generator.generate_result_for_field('12345') }.to raise_error(NotImplementedError)
    end
  end

  describe '#generate_results' do
    before do
      reset_survey_logic!
    end

    describe 'page fields' do
      it 'returns correct logic values for a page field in full results' do
        page_field.update!(logic: { next_page_id: last_page_field.id })
        page_result = generator.generate_results[:results][result_index(page_field)]
        expect(page_result[:inputType]).to eq 'page'
        expect(page_result[:logic]).to eq({ nextPageNumber: 4, numQuestionsSkipped: 13 })
      end

      it 'uses the logic IDs correctly to flag hidden fields' do
        page_field.update!(logic: { next_page_id: mid_page_field2.id })

        logic_ids = [page_field.id]
        results_with_logic_ids = generator.generate_results(logic_ids: logic_ids)
        results = results_with_logic_ids[:results]

        # Fields that should be hidden when select option 1 is selected
        hidden_field_ids = results.select { |r| r[:hidden] == true }.pluck(:customFieldId)
        expect(hidden_field_ids).to eq(
          [
            mid_page_field1.id,
            select_field.id,
            multiselect_image_field.id,
            unanswered_text_field.id
          ]
        )
      end
    end

    describe 'linear scale fields' do
      it 'returns correct response numbers based on linear scale and page logic - example 1' do
        mid_page_field1.update!(logic: { next_page_id: last_page_field.id })
        linear_scale_field.update!(logic: {
          rules: [
            { if: 2, goto_page_id: mid_page_field2.id },
            { if: 'no_answer', goto_page_id: last_page_field.id }
          ]
        })

        results = generator.generate_results[:results]

        # Page logic
        expect(results[result_index(mid_page_field1)][:logic]).to eq({ nextPageNumber: 4, numQuestionsSkipped: 10 })

        # Linear scale logic
        expect(results[result_index(linear_scale_field)][:logic]).to eq({
          answer: {
            'no_answer' => { id: "#{linear_scale_field.id}_no_answer", nextPageNumber: 4, numQuestionsSkipped: 13 },
            2 => { id: "#{linear_scale_field.id}_2", nextPageNumber: 3, numQuestionsSkipped: 3 }
          }
        })

        # Correct response counts
        expect(results.pluck(:totalResponseCount)).to eq(
          [27, 27, 27, 27, 27, 17, 17, 17, 17, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
        )
      end

      it 'returns correct response numbers based on linear scale logic - example 2' do
        linear_scale_field.update!(logic: {
          rules: [
            { if: 3, goto_page_id: mid_page_field2.id },
            { if: 4, goto_page_id: last_page_field.id }
          ]
        })

        results = generator.generate_results[:results]

        # Linear scale logic
        expect(results[result_index(linear_scale_field)][:logic]).to eq({
          answer: {
            3 => { id: "#{linear_scale_field.id}_3", nextPageNumber: 3, numQuestionsSkipped: 3 },
            4 => { id: "#{linear_scale_field.id}_4", nextPageNumber: 4, numQuestionsSkipped: 13 }
          }
        })

        # Correct response counts
        expect(results.pluck(:totalResponseCount)).to eq(
          [27, 27, 27, 27, 27, 18, 18, 18, 18, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26]
        )
      end

      it 'uses the logic IDs correctly to flag hidden fields' do
        linear_scale_field.update!(logic: {
          rules: [
            { if: 3, goto_page_id: mid_page_field2.id }
          ]
        })

        logic_ids = ["#{linear_scale_field.id}_3"]
        results_with_logic_ids = generator.generate_results(logic_ids: logic_ids)
        results = results_with_logic_ids[:results]

        # Fields that should be hidden when select option 1 is selected
        hidden_field_ids = results.select { |r| r[:hidden] == true }.pluck(:customFieldId)
        expect(hidden_field_ids).to eq(
          [
            mid_page_field1.id,
            select_field.id,
            multiselect_image_field.id,
            unanswered_text_field.id
          ]
        )
      end
    end

    describe 'select fields' do
      it 'returns correct response numbers based on select field logic' do
        select_field.update!(logic: {
          rules: [
            { if: select_field.options.first.id, goto_page_id: last_page_field.id },
            { if: select_field.options.second.id, goto_page_id: mid_page_field1.id }
          ]
        })

        results = generator.generate_results[:results]

        # Select logic
        expect(results[result_index(select_field)][:logic]).to eq({
          answer: {
            'la' => { id: select_field.options[0].id, nextPageNumber: 4, numQuestionsSkipped: 10 },
            'ny' => { id: select_field.options[1].id, nextPageNumber: 2, numQuestionsSkipped: 10 }
          }
        })

        # Correct response counts
        expect(results.pluck(:totalResponseCount)).to eq(
          [27, 27, 27, 27, 27, 27, 27, 27, 27, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24]
        )
      end

      it 'uses the logic IDs correctly to flag hidden fields' do
        select_field.update!(logic: {
          rules: [
            { if: select_field.options.first.id, goto_page_id: last_page_field.id }
          ]
        })

        logic_ids = [select_field.options.first.id]
        results_with_logic_ids = generator.generate_results(logic_ids: logic_ids)
        results = results_with_logic_ids[:results]

        # Fields that should be hidden when select option 1 is selected
        hidden_field_ids = results.select { |r| r[:hidden] == true }.pluck(:customFieldId)
        expect(hidden_field_ids).to eq(
          [
            mid_page_field2.id,
            file_upload_field.id,
            shapefile_upload_field.id,
            point_field.id,
            line_field.id,
            polygon_field.id,
            number_field.id,
            ranking_field.id,
            matrix_linear_scale_field.id,
            rating_field.id,
            sentiment_linear_scale_field.id
          ]
        )
      end
    end
  end

  # Test the private methods that use logic in results
  describe '#next_page_id_from_logic' do
    let(:input) { create(:native_survey_response, project: project, phases: phases_of_inputs) }
    let(:page_ids) { [page_field.id, mid_page_field1.id, mid_page_field2.id, last_page_field.id] }

    before { reset_survey_logic! }

    context 'linear scale and page field logic' do
      before do
        # Update fields from survey_setup shared context with some logic
        linear_scale_field.update!(logic: {
          rules: [
            { if: 2, goto_page_id: mid_page_field2.id },
            { if: 'no_answer', goto_page_id: last_page_field.id }
          ]
        })
        mid_page_field1.update!(logic: {
          next_page_id: last_page_field.id
        })
      end

      it 'returns the correct next_page_id from linear scale logic' do
        input.update!(custom_field_values: { linear_scale_field.key => 2 })
        logic_next_page_id = generator.send(:next_page_id_from_logic, linear_scale_field, input, page_ids)
        expect(logic_next_page_id).to eq mid_page_field2.id
      end

      it 'returns the correct next_page_id from no answer logic' do
        input.update!(custom_field_values: {})
        logic_next_page_id = generator.send(:next_page_id_from_logic, linear_scale_field, input, page_ids)
        expect(logic_next_page_id).to eq last_page_field.id
      end

      it 'returns no next_page_id when no logic present for the answer' do
        input.update!(custom_field_values: { linear_scale_field.key => 3 })
        logic_next_page_id = generator.send(:next_page_id_from_logic, linear_scale_field, input, page_ids)
        expect(logic_next_page_id).to be_nil
      end
    end

    context 'single select logic' do
      before do
        # Update fields from survey_setup shared context with logic
        select_field.update!(logic: {
          rules: [
            { if: select_field.options.first.id, goto_page_id: mid_page_field1.id },
            { if: 'any_other_answer', goto_page_id: mid_page_field2.id },
            { if: 'no_answer', goto_page_id: last_page_field.id }
          ]
        })
      end

      it 'returns the correct next_page_id from a single selection' do
        input.update!(custom_field_values: { select_field.key => 'la' })
        logic_next_page_id = generator.send(:next_page_id_from_logic, select_field, input, page_ids)
        expect(logic_next_page_id).to eq mid_page_field1.id
      end

      it 'returns the correct next_page_id when there is no answer' do
        input.update!(custom_field_values: {})
        logic_next_page_id = generator.send(:next_page_id_from_logic, select_field, input, page_ids)
        expect(logic_next_page_id).to eq last_page_field.id
      end

      it 'returns the correct next_page_id for any other answer' do
        input.update!(custom_field_values: { select_field.key => 'ny' })
        logic_next_page_id = generator.send(:next_page_id_from_logic, select_field, input, page_ids)
        expect(logic_next_page_id).to eq mid_page_field2.id
      end
    end

    context 'multiselect logic' do
      before do
        # Update fields from survey_setup shared context with some logic
        # Uses update column to bypass validations as logic is no longer allowed to be set when saving multiselect fields
        multiselect_field.update_columns(logic: {
          rules: [
            { if: multiselect_field.options.first.id, goto_page_id: mid_page_field1.id },
            { if: multiselect_field.options.second.id, goto_page_id: mid_page_field2.id },
            { if: 'no_answer', goto_page_id: last_page_field.id }
          ]
        })
      end

      it 'returns the correct next_page_id from a single selection' do
        input.update!(custom_field_values: { multiselect_field.key => ['cat'] })
        logic_next_page_id = generator.send(:next_page_id_from_logic, multiselect_field, input, page_ids)
        expect(logic_next_page_id).to eq mid_page_field1.id
      end

      it 'returns the correct next_page_id from a multiple selection' do
        input.update!(custom_field_values: { multiselect_field.key => %w[cat dog] })
        logic_next_page_id = generator.send(:next_page_id_from_logic, multiselect_field, input, page_ids)
        expect(logic_next_page_id).to eq mid_page_field2.id
      end

      it 'returns the correct next_page_id when there is no answer' do
        input.update!(custom_field_values: {})
        logic_next_page_id = generator.send(:next_page_id_from_logic, multiselect_field, input, page_ids)
        expect(logic_next_page_id).to eq last_page_field.id
      end

      it 'returns no next_page_id when no logic present for the answer' do
        input.update!(custom_field_values: { multiselect_field.key => ['cow'] })
        logic_next_page_id = generator.send(:next_page_id_from_logic, multiselect_field, input, page_ids)
        expect(logic_next_page_id).to be_nil
      end
    end
  end

  describe '#seen_field_responses' do
    # NOTE: We define new data here, so we are not always using the same survey structure

    # Set-up custom form
    let_it_be(:new_survey) { create(:native_survey_phase) }
    let_it_be(:new_form) { create(:custom_form, participation_context: new_survey) }
    let_it_be(:page1) { create(:custom_field_page, resource: new_form) }
    let_it_be(:page1_select) do
      create(
        :custom_field_select,
        resource: new_form,
        key: 'page1_select',
        options: [
          create(:custom_field_option, key: 'first'),
          create(:custom_field_option, key: 'second')
        ]
      )
    end
    let_it_be(:page2) { create(:custom_field_page, resource: new_form) }
    let_it_be(:page2_linear_scale) do
      create(
        :custom_field_linear_scale,
        resource: new_form,
        key: 'page2_linear_scale',
        maximum: 5
      )
    end
    let_it_be(:page3) { create(:custom_field_page, resource: new_form) }
    let_it_be(:page3_text) { create(:custom_field, resource: new_form) }
    let_it_be(:page4) { create(:custom_field_page, resource: new_form) }
    let_it_be(:page4_text) { create(:custom_field, resource: new_form) }
    let_it_be(:page5) { create(:custom_field_page, resource: new_form) }

    # Add some responses that will influence logic
    let_it_be(:response1) { create(:native_survey_response, project: new_survey.project, creation_phase: new_survey, custom_field_values: { page1_select: 'first', page2_linear_scale: 1 }) }
    let_it_be(:response2) { create(:native_survey_response, project: new_survey.project, creation_phase: new_survey, custom_field_values: { page1_select: 'second', page2_linear_scale: 1 }) }
    let_it_be(:response3) { create(:native_survey_response, project: new_survey.project, creation_phase: new_survey, custom_field_values: { page1_select: 'first', page2_linear_scale: 2 }) }

    let(:generator) { described_class.new new_survey }

    it 'identifies which fields were seen per response when no logic' do
      responses = generator.send(:seen_field_responses)
      expect(responses.count).to eq 9
      expect(responses).to match({
        page1.id => [response1.id, response2.id, response3.id],
        page1_select.id => [response1.id, response2.id, response3.id],
        page2.id => [response1.id, response2.id, response3.id],
        page2_linear_scale.id => [response1.id, response2.id, response3.id],
        page3.id => [response1.id, response2.id, response3.id],
        page3_text.id => [response1.id, response2.id, response3.id],
        page4.id => [response1.id, response2.id, response3.id],
        page4_text.id => [response1.id, response2.id, response3.id],
        page5.id => [response1.id, response2.id, response3.id]
      })
    end

    it 'identifies which fields were seen per response when there is select logic' do
      page1_select.update!(logic: {
        rules: [
          { if: page1_select.options.first.id, goto_page_id: page5.id }
        ]
      })
      page2_linear_scale.update!(logic: {})

      responses = generator.send(:seen_field_responses)
      expect(responses.count).to eq 9
      expect(responses).to match({
        page1.id => [response1.id, response2.id, response3.id],
        page1_select.id => [response1.id, response2.id, response3.id],
        page2.id => [response2.id],
        page2_linear_scale.id => [response2.id],
        page3.id => [response2.id],
        page3_text.id => [response2.id],
        page4.id => [response2.id],
        page4_text.id => [response2.id],
        page5.id => [response1.id, response2.id, response3.id]
      })
    end

    it 'identifies which fields were seen per response when there is linear scale logic' do
      page1_select.update!(logic: {})
      page2_linear_scale.update!(logic: {
        rules: [
          { if: 1, goto_page_id: page4.id }
        ]
      })

      responses = generator.send(:seen_field_responses)
      expect(responses.count).to eq 9
      expect(responses).to match({
        page1.id => [response1.id, response2.id, response3.id],
        page1_select.id => [response1.id, response2.id, response3.id],
        page2.id => [response1.id, response2.id, response3.id],
        page2_linear_scale.id => [response1.id, response2.id, response3.id],
        page3.id => [response3.id],
        page3_text.id => [response3.id],
        page4.id => [response1.id, response2.id, response3.id],
        page4_text.id => [response1.id, response2.id, response3.id],
        page5.id => [response1.id, response2.id, response3.id]
      })
    end

    it 'identifies which fields were seen per response when there are multiple logic rules' do
      page1_select.update!(logic: {
        rules: [
          { if: page1_select.options.last.id, goto_page_id: page4.id }
        ]
      })
      page2_linear_scale.update!(logic: {
        rules: [
          { if: 'any_other_answer', goto_page_id: page5.id }
        ]
      })

      # NOTE: For this test some fields are not seen at all so the fields do not appear in the object
      responses = generator.send(:seen_field_responses)
      expect(responses.count).to eq 7
      expect(responses).to match({
        page1.id => [response1.id, response2.id, response3.id],
        page1_select.id => [response1.id, response2.id, response3.id],
        page2.id => [response1.id, response3.id],
        page2_linear_scale.id => [response1.id, response3.id],
        page4.id => [response2.id],
        page4_text.id => [response2.id],
        page5.id => [response1.id, response2.id, response3.id]
      })
    end
  end

  describe '#add_logic_to_results' do
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
          totalPickCount: 2,
          answers: [
            { answer: 'option1', count: 1 },
            { answer: 'option3', count: 1 },
            { answer: 'option2', count: 0 },
            { answer: nil, count: 0 }
          ],
          multilocs: {
            answer: {
              option1: { title_multiloc: { en: 'Option 1' } },
              option2: { title_multiloc: { en: 'Option 2' } },
              option3: { title_multiloc: { en: 'Option 3' } }
            }
          },
          logic: {
            answer: {
              option1: { id: 'SELECT_1_OPTION_1', nextPageId: 'PAGE_3' },
              option2: { id: 'SELECT_1_OPTION_2', nextPageId: 'PAGE_2' },
              option3: { id: 'SELECT_1_OPTION_3', nextPageId: 'PAGE_4' }
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
          logic: { nextPageId: 'FORM_END_PAGE' }
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
              '1': { title_multiloc: { en: '1' } },
              '2': { title_multiloc: { en: '2' } },
              '3': { title_multiloc: { en: '3' } },
              '4': { title_multiloc: { en: '4' } },
              '5': { title_multiloc: { en: '5' } }
            }
          },
          logic: {
            answer: {
              '2': { id: 'LINEAR_SCALE_OPTION_2', nextPageId: 'PAGE_3' },
              '3': { id: 'LINEAR_SCALE_OPTION_3', nextPageId: 'PAGE_4' },
              no_answer: { id: 'LINEAR_SCALE_OPTION_no_answer', nextPageId: 'FORM_END_PAGE' }
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
          totalPickCount: 3,
          answers: [
            { answer: 'option1', count: 1 },
            { answer: 'option2', count: 1 },
            { answer: nil, count: 1 },
            { answer: 'option3', count: 0 }
          ],
          multilocs: {
            answer: {
              option1: { title_multiloc: { en: 'Option 1' } },
              option2: { title_multiloc: { en: 'Option 2' } },
              option3: { title_multiloc: { en: 'Option 3' } }
            }
          },
          logic: {
            answer: {
              option3: { id: 'MULTISELECT_1_OPTION_3', nextPageId: 'PAGE_4' },
              no_answer: { id: 'MULTISELECT_1_OPTION_no_answer', nextPageId: 'FORM_END_PAGE' }
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
          totalPickCount: 2,
          answers: [
            { answer: nil, count: 2 },
            { answer: 'option1', count: 0 },
            { answer: 'option2', count: 0 }
          ],
          multilocs: {
            answer: {
              option1: { title_multiloc: { en: 'Option 2' } },
              option2: { title_multiloc: { en: 'Option 2' } }
            }
          },
          logic: {
            answer: {
              option1: { id: 'SELECT_2_OPTION_1', nextPageId: 'FORM_END_PAGE' }
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
        }, {
          inputType: 'page',
          question: { en: 'Ending' },
          description: {},
          customFieldId: 'FORM_END_PAGE',
          required: false,
          grouped: false,
          hidden: false,
          totalResponseCount: 0,
          questionResponseCount: 0,
          pageNumber: 5,
          key: 'form_end',
          questionNumber: nil,
          logic: {}
        }
      ]
    end

    let(:results) { generator.send(:add_logic_to_results, results_without_logic, logic_ids: []) }

    before { generator.send(:add_question_numbers_to_results, results_without_logic) }

    it 'returns logic information for single select options' do
      select_result = results[1]
      expect(select_result[:logic][:answer][:option1]).to match(
        { id: 'SELECT_1_OPTION_1', nextPageNumber: 3, numQuestionsSkipped: 3 }
      )
      expect(select_result[:logic][:answer][:option3]).to match(
        { id: 'SELECT_1_OPTION_3', nextPageNumber: 4, numQuestionsSkipped: 5 }
      )
    end

    it 'returns logic information for a page linking to survey end' do
      page_result = results[2]
      expect(page_result[:logic]).to match(
        { nextPageNumber: 5, numQuestionsSkipped: 3 }
      )
    end

    it 'returns logic information for a linear scale field' do
      linear_scale_result = results[4]
      expect(linear_scale_result[:logic][:answer][:'2']).to match(
        { id: 'LINEAR_SCALE_OPTION_2', nextPageNumber: 3, numQuestionsSkipped: 0 }
      )
      expect(linear_scale_result[:logic][:answer][:'3']).to match(
        { id: 'LINEAR_SCALE_OPTION_3', nextPageNumber: 4, numQuestionsSkipped: 2 }
      )
      expect(linear_scale_result[:logic][:answer][:no_answer]).to match(
        { id: 'LINEAR_SCALE_OPTION_no_answer', nextPageNumber: 5, numQuestionsSkipped: 3 }
      )
    end

    it 'returns logic information for a multiselect field' do
      multiselect_result = results[5]
      expect(multiselect_result[:logic][:answer][:option3]).to match(
        { id: 'MULTISELECT_1_OPTION_3', nextPageNumber: 4, numQuestionsSkipped: 2 }
      )
      expect(multiselect_result[:logic][:answer][:no_answer]).to match(
        { id: 'MULTISELECT_1_OPTION_no_answer', nextPageNumber: 5, numQuestionsSkipped: 3 }
      )
    end

    context 'when filtering by logic_ids' do
      it 'flags no fields as hidden if no logic IDs are provided' do
        results = generator.send(:add_logic_to_results, results_without_logic, [])
        expect(results.pluck(:hidden)).to eq(
          [false, false, false, false, false, false, false, false, false, false, false, false]
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
