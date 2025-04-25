# frozen_string_literal: true

require 'rails_helper'
require './spec/services/surveys/shared/survey_setup'

# NOTE: These tests only test the addition of logic to the results from the parent class

RSpec.describe Surveys::ResultsWithLogicGenerator do
  subject(:generator) { described_class.new survey_phase }

  include_context 'survey_setup'

  describe 'generate_result_for_field' do
    it 'it is not implemented and returns an error' do
      generator = described_class.new(survey_phase)
      expect { generator.generate_result_for_field('12345') }.to raise_error(NotImplementedError)
    end
  end

  describe 'generate_results' do
    let(:generated_results) { generator.generate_results }

    before_all do
      # Update fields from survey_setup shared context with some (meaningless but valid) end_page logic
      linear_scale_field.update!(logic: { rules: [{ if: 2, goto_page_id: last_page_field.id }, { if: 'no_answer', goto_page_id: last_page_field.id }] })
      page_field.update!(logic: { next_page_id: last_page_field.id })
    end

    describe 'page fields' do
      it 'returns correct logic values for a page field in full results' do
        page_result = generated_results[:results][0]
        expect(page_result[:inputType]).to eq 'page'
        expect(page_result[:logic]).to eq({ nextPageNumber: 2, numQuestionsSkipped: 0 })
      end
    end

    describe 'linear scale fields' do
      it 'returns the correct logic values in results for a linear scale field' do
        result = generated_results[:results][4]
        expect(result[:inputType]).to eq 'linear_scale'
        expect(result[:logic]).to match({
          answer: {
            2 => {
              id: "#{linear_scale_field.id}_2",
              nextPageNumber: 2,
              numQuestionsSkipped: 0
            },
            'no_answer' => {
              id: "#{linear_scale_field.id}_no_answer",
              nextPageNumber: 2,
              numQuestionsSkipped: 0
            }
          }
        })
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

  describe 'change_counts_for_logic' do
    # NOTE: Truncated results input object without unnecessary attributes for this method
    let(:page1) do
      {
        inputType: 'page',
        totalResponseCount: 5,
        questionResponseCount: 4,
        pageNumber: 1,
        logic: {},
        questionViewedCount: 0,
        key: 'page1'
      }
    end

    let(:select_question) do
      {
        inputType: 'select',
        totalResponseCount: 5,
        questionResponseCount: 4,
        logic: {},
        questionViewedCount: 0,
        key: 'question_one',
        totalPickCount: 4,
        answers: [
          { answer: 'option_2', count: 3 },
          { answer: 'option_1', count: 1 },
          { answer: nil, count: 1 }
        ]
      }
    end

    let(:page2) do
      {
        inputType: 'page',
        totalResponseCount: 5,
        questionResponseCount: 2,
        pageNumber: 2,
        logic: {},
        questionViewedCount: 0,
        key: nil
      }
    end

    let(:linear_scale_question) do
      {
        inputType: 'linear_scale',
        totalResponseCount: 5,
        questionResponseCount: 2,
        pageNumber: nil,
        logic: {},
        questionViewedCount: 0,
        key: 'question_two',
        totalPickCount: 2,
        answers: [
          { answer: 5, count: 0 },
          { answer: 4, count: 0 },
          { answer: 3, count: 0 },
          { answer: 2, count: 1 },
          { answer: 1, count: 1 },
          { answer: nil, count: 3 }
        ]
      }
    end

    let(:multiselect_question) do
      {
        inputType: 'multiselect',
        totalResponseCount: 5,
        questionResponseCount: 2,
        logic: {},
        questionViewedCount: 0,
        key: 'question_three',
        totalPickCount: 2,
        answers: [
          { answer: 'option_2', count: 1 },
          { answer: 'option_1', count: 1 },
          { answer: nil, count: 3 }
        ]
      }
    end

    let(:page3) do
      {
        inputType: 'page',
        totalResponseCount: 5,
        questionResponseCount: 0,
        questionViewedCount: 0,
        pageNumber: 3,
        logic: {},
        key: nil
      }
    end

    let(:text_question1) do
      {
        inputType: 'text',
        totalResponseCount: 5,
        questionResponseCount: 0,
        pageNumber: nil,
        logic: {},
        questionViewedCount: 0,
        key: 'question_three'
      }
    end

    let(:page4) do
      {
        inputType: 'page',
        totalResponseCount: 5,
        questionResponseCount: 0,
        pageNumber: 4,
        logic: {},
        questionViewedCount: 0,
        key: nil
      }
    end

    let(:text_question2) do
      {
        inputType: 'text',
        totalResponseCount: 5,
        questionResponseCount: 0,
        pageNumber: nil,
        logic: {},
        questionViewedCount: 0,
        key: 'question_four'
      }
    end

    let(:page5) do
      {
        inputType: 'page',
        totalResponseCount: 5,
        questionResponseCount: 0,
        pageNumber: 5,
        logic: {},
        questionViewedCount: 0,
        key: nil
      }
    end

    let(:text_question3) do
      {
        inputType: 'text',
        totalResponseCount: 5,
        questionResponseCount: 0,
        questionViewedCount: 0,
        pageNumber: nil,
        logic: {},
        key: 'question_five'
      }
    end

    let(:form_end_page) do
      {
        inputType: 'page',
        totalResponseCount: 5,
        questionResponseCount: 0,
        questionViewedCount: 0,
        pageNumber: 6,
        logic: {},
        key: 'form_end'
      }
    end

    let(:results_without_num_answered) do
      [
        page1,
        select_question,
        page2,
        linear_scale_question,
        multiselect_question,
        page3,
        text_question1,
        page4,
        text_question2,
        page5,
        text_question3,
        form_end_page
      ]
    end

    let(:results) { generator.send(:change_counts_for_logic, results_without_num_answered, survey_custom_field_responses) }
    let(:linear_scale_result) { results[3] }
    let(:multiselect_result) { results[4] }

    context 'When there is no logic on questions or pages' do
      let(:survey_custom_field_responses) do
        [
          { 'question_one' => 'option_2' },
          { 'question_one' => 'option_1' },
          { 'question_one' => 'option_2', 'question_two' => 2 },
          { 'question_three' => %w[option_1 option_2] }
        ]
      end

      it 'does not change the totalResponsesCount' do
        expect(results_without_num_answered.pluck(:totalResponseCount)).to eq(
          [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
        )
      end

      it 'does not reduce the count of not_answered responses' do
        expect(linear_scale_result[:answers].find { |a| a[:answer].nil? }).to eq({
          answer: nil, count: 3
        })
        expect(multiselect_result[:answers].find { |a| a[:answer].nil? }).to eq({
          answer: nil, count: 3
        })
      end
    end

    context 'Mixed example' do
      let(:survey_custom_field_responses) do
        [
          { 'question_one' => 'option_2', 'question_two' => 1 },
          { 'question_one' => 'option_2' },
          { 'question_one' => 'option_1' },
          { 'question_one' => 'option_2', 'question_two' => 2 },
          { 'question_three' => %w[option_1 option_2] }
        ]
      end

      before do
        select_question[:logic] = {
          answer: {
            'option_1' => { nextPageNumber: 3, numQuestionsSkipped: 2 }
          }
        }
        linear_scale_question[:logic] = {
          answer: {
            1 => { nextPageNumber: 4, numQuestionsSkipped: 1 },
            2 => { nextPageNumber: 5, numQuestionsSkipped: 2 }
          }
        }
        multiselect_question[:logic] = {
          answer: {
            'option_1' => { nextPageNumber: 4, numQuestionsSkipped: 2 },
            'option_2' => { nextPageNumber: 6, numQuestionsSkipped: 2 }
          }
        }
        page3[:logic] = { nextPageNumber: 6, numQuestionsSkipped: 1 }
      end

      it 'changes the totalResponsesCount when fields are not shown through logic' do
        expect(results.pluck(:totalResponseCount)).to eq(
          [5, 5, 4, 4, 4, 2, 2, 1, 1, 2, 2, 5]
        )
      end

      it 'changes the totalResponsesCount when the questionResponseCount is lower than questionViewedCount' do
        text_question1[:questionResponseCount] = 1
        expect(results[6][:totalResponseCount]).to eq 2
      end

      it 'does not change the totalResponsesCount when the questionResponseCount is higher than questionViewedCount' do
        text_question1[:questionResponseCount] = 6
        expect(results[6][:totalResponseCount]).to eq 5 # does not change if the question response count is higher
      end

      it 'reduces the count of not_answered responses when fields are not shown through logic' do
        expect(linear_scale_result[:answers].find { |a| a[:answer].nil? }).to eq({
          answer: nil, count: 2
        })
        expect(multiselect_result[:answers].find { |a| a[:answer].nil? }).to eq({
          answer: nil, count: 2
        })
      end
    end

    context 'Question logic taking precedence over page logic' do
      let(:survey_custom_field_responses) do
        [
          { 'question_one' => 'option_1', 'question_two' => 1 },
          { 'question_one' => 'option_2' },
          { 'question_one' => 'option_2' },
          { 'question_one' => 'option_1', 'question_two' => 2 },
          { 'question_one' => 'option_1', 'question_three' => %w[option_1 option_2] }
        ]
      end

      before do
        # Add different logic
        page1[:logic] = { nextPageNumber: 4, numQuestionsSkipped: 3 }
        select_question[:logic] = {
          answer: {
            'option_1' => { nextPageNumber: 2, numQuestionsSkipped: 0 }
          }
        }

        # Update expect numbers of responses (before logic applied) to reflect the new survey responses
        linear_scale_question[:answers] = [
          { answer: 5, count: 0 },
          { answer: 4, count: 0 },
          { answer: 3, count: 0 },
          { answer: 2, count: 1 },
          { answer: 1, count: 1 },
          { answer: nil, count: 3 }
        ]
        multiselect_question[:answers] = [
          { answer: 'option_2', count: 1 },
          { answer: 'option_1', count: 1 },
          { answer: nil, count: 4 }
        ]
      end

      it 'changes the totalResponsesCount when fields are not shown through logic' do
        expect(results.pluck(:totalResponseCount)).to eq(
          [5, 5, 3, 3, 3, 3, 3, 5, 5, 5, 5, 5]
        )
      end

      it 'reduces the count of not_answered responses when fields are not shown through logic' do
        expect(linear_scale_result[:answers].find { |a| a[:answer].nil? }).to eq({
          answer: nil, count: 1
        })
        expect(multiselect_result[:answers].find { |a| a[:answer].nil? }).to eq({
          answer: nil, count: 2
        })
      end
    end

    context 'Mixed example 2' do
      let(:survey_custom_field_responses) do
        [
          { 'question_one' => 'option_1', 'question_two' => 1 },
          { 'question_one' => 'option_1', 'question_two' => 2 },
          { 'question_one' => 'option_2' },
          { 'question_one' => 'option_1', 'question_two' => 5, 'question_three' => %w[option_1] },
          { 'question_one' => 'option_1', 'question_three' => %w[option_1 option_2] }
        ]
      end

      before do
        # Add different logic
        select_question[:logic] = {
          answer: {
            'option_2' => { nextPageNumber: 4, numQuestionsSkipped: 3 }
          }
        }
        page2[:logic] = { nextPageNumber: 5, numQuestionsSkipped: 3 }
        linear_scale_question[:logic] = {
          answer: {
            1 => { nextPageNumber: 3, numQuestionsSkipped: 0 },
            2 => { nextPageNumber: 5, numQuestionsSkipped: 2 }
          }
        }
        multiselect_question[:logic] = {
          answer: {
            'option_1' => { nextPageNumber: 4, numQuestionsSkipped: 1 },
            'option_2' => { nextPageNumber: 6, numQuestionsSkipped: 2 }
          }
        }
        page3[:logic] = { nextPageNumber: 5, numQuestionsSkipped: 1 }

        # Update expected numbers of responses (before logic applied) to reflect the new survey responses
        linear_scale_question[:answers] = [
          { answer: 5, count: 1 },
          { answer: 4, count: 0 },
          { answer: 3, count: 0 },
          { answer: 2, count: 1 },
          { answer: 1, count: 1 },
          { answer: nil, count: 2 }
        ]
        multiselect_question[:answers] = [
          { answer: 'option_1', count: 2 },
          { answer: 'option_2', count: 1 },
          { answer: nil, count: 3 }
        ]
      end

      it 'changes the totalResponsesCount when fields are not shown through logic' do
        expect(results.pluck(:totalResponseCount)).to eq(
          [5, 5, 4, 4, 4, 1, 1, 2, 2, 4, 4, 5]
        )
      end

      it 'reduces the count of not_answered responses when fields are not shown through logic' do
        expect(linear_scale_result[:answers].find { |a| a[:answer].nil? }).to eq({
          answer: nil, count: 1
        })
        expect(multiselect_result[:answers].find { |a| a[:answer].nil? }).to eq({
          answer: nil, count: 2
        })
      end
    end

    context 'Logic on no answer' do
      let(:survey_custom_field_responses) do
        [
          { 'question_one' => 'option_1', 'question_two' => 1 },
          { 'question_one' => 'option_1', 'question_two' => 2 },
          { 'text_question3' => 'text' },
          { 'question_one' => 'option_1', 'question_two' => 5, 'question_three' => %w[option_1] },
          { 'question_one' => 'option_1', 'question_three' => %w[option_1 option_2] }
        ]
      end

      before do
        # Add different logic
        select_question[:logic] = {
          answer: {
            'no_answer' => { nextPageNumber: 5, numQuestionsSkipped: 4 }
          }
        }

        # Update expected numbers of responses (before logic applied) to reflect the new survey responses
        linear_scale_question[:answers] = [
          { answer: 5, count: 1 },
          { answer: 4, count: 0 },
          { answer: 3, count: 0 },
          { answer: 2, count: 1 },
          { answer: 1, count: 1 },
          { answer: nil, count: 2 }
        ]
        multiselect_question[:answers] = [
          { answer: 'option_1', count: 2 },
          { answer: 'option_2', count: 1 },
          { answer: nil, count: 3 }
        ]
      end

      it 'changes the totalResponsesCount when fields are not shown through logic' do
        expect(results.pluck(:totalResponseCount)).to eq(
          [5, 5, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5]
        )
      end

      it 'reduces the count of not_answered responses when fields are not shown through logic' do
        expect(linear_scale_result[:answers].find { |a| a[:answer].nil? }).to eq({
          answer: nil, count: 1
        })
        expect(multiselect_result[:answers].find { |a| a[:answer].nil? }).to eq({
          answer: nil, count: 2
        })
      end
    end
  end

  describe 'cleanup_results' do
    let(:dirty_results) do
      [
        {
          inputType: 'page',
          totalResponseCount: 5,
          questionResponseCount: 4,
          pageNumber: 1,
          logic: {},
          questionViewedCount: 0,
          key: 'page1'
        }, {
          inputType: 'select',
          totalResponseCount: 5,
          questionResponseCount: 4,
          logic: {},
          questionViewedCount: 0,
          key: 'question_one',
          totalPickCount: 4,
          answers: [
            { answer: 'option_2', count: 3 },
            { answer: 'option_1', count: 1 },
            { answer: nil, count: 1 }
          ]
        }, {
          inputType: 'page',
          totalResponseCount: 5,
          questionResponseCount: 0,
          pageNumber: 2,
          logic: {},
          questionViewedCount: 0,
          key: 'form_end'
        }
      ]
    end

    let(:results) { generator.send(:cleanup_results, dirty_results) }

    it 'removes the temporary attributes used for calculating logic' do
      expect(results[0].keys).not_to include(:key, :questionViewedCount)
    end

    it 'removes the end page from the results' do
      expect(results.size).to eq(2)
      expect(results.pluck(:inputType)).to eq(%w[page select])
    end
  end
end
