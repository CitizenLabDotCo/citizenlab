# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SurveyResultsGeneratorService do
  subject(:generator) { described_class.new survey_phase }

  let_it_be(:project) { create(:single_phase_native_survey_project) }
  let_it_be(:survey_phase) { project.phases.first }

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
              no_answer: { id: 'LINEAR_SCALE_OPTION_no_answer', nextPageId: 'survey_end' }
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
              no_answer: { id: 'MULTISELECT_1_OPTION_no_answer', nextPageId: 'survey_end' }
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
              option1: { id: 'SELECT_2_OPTION_1', nextPageId: 'survey_end' }
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
        { nextPageNumber: 999, numQuestionsSkipped: 3 }
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
        { id: 'LINEAR_SCALE_OPTION_no_answer', nextPageNumber: 999, numQuestionsSkipped: 3 }
      )
    end

    it 'returns logic information for a multiselect field' do
      multiselect_result = results[5]
      expect(multiselect_result[:logic][:answer][:option3]).to match(
        { id: 'MULTISELECT_1_OPTION_3', nextPageNumber: 4, numQuestionsSkipped: 2 }
      )
      expect(multiselect_result[:logic][:answer][:no_answer]).to match(
        { id: 'MULTISELECT_1_OPTION_no_answer', nextPageNumber: 999, numQuestionsSkipped: 3 }
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

  describe 'change_counts_for_logic' do
    # NOTE: Truncated results input object without unnecessary attributes for this method
    let_it_be(:results_without_num_answered) do
      [
        {
          inputType: 'page',
          totalResponseCount: 5,
          questionResponseCount: 4,
          pageNumber: 1,
          logic: {},
          questionViewedCount: 0,
          key: 'page1'
        },
        {
          inputType: 'select',
          totalResponseCount: 5,
          questionResponseCount: 4,
          logic: {
            answer: {
              'option_1' => { id: 'ba98ad2c-668d-4e3f-8760-215c49f34dc1', nextPageNumber: 3, numQuestionsSkipped: 2 }
            }
          },
          questionViewedCount: 0,
          key: 'question_one',
          totalPickCount: 4,
          answers: [
            { answer: 'option_2', count: 3 },
            { answer: 'option_1', count: 1 },
            { answer: nil, count: 1 }
          ]
        },
        {
          inputType: 'page',
          totalResponseCount: 5,
          questionResponseCount: 2,
          pageNumber: 2,
          questionNumber: nil,
          logic: {},
          questionViewedCount: 0,
          key: nil
        },
        {
          inputType: 'linear_scale',
          totalResponseCount: 5,
          questionResponseCount: 2,
          pageNumber: nil,
          logic: {
            answer: {
              1 => { id: '715c0cda-e64b-40dd-b21e-45a93ee239fb_1', nextPageNumber: 4, numQuestionsSkipped: 1 },
              2 => { id: '715c0cda-e64b-40dd-b21e-45a93ee239fb_2', nextPageNumber: 5, numQuestionsSkipped: 2 }
            }
          },
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
        },
        {
          inputType: 'select',
          totalResponseCount: 5,
          questionResponseCount: 2,
          logic: {
            answer: {
              'option_1' => { id: 'ff98ad2c-668d-4e3f-8760-215c49f34dc1', nextPageNumber: 4, numQuestionsSkipped: 2 },
              'option_2' => { id: 'cc98ad2c-668d-4e3f-8760-215c49f34dc1', nextPageNumber: 999, numQuestionsSkipped: 2 }
            }
          },
          questionViewedCount: 0,
          key: 'question_three',
          totalPickCount: 2,
          answers: [
            { answer: 'option_2', count: 1 },
            { answer: 'option_1', count: 1 },
            { answer: nil, count: 3 }
          ]
        },
        {
          inputType: 'page',
          totalResponseCount: 5,
          questionResponseCount: 0,
          pageNumber: 3,
          logic: { nextPageNumber: 999, numQuestionsSkipped: 2 },
          questionViewedCount: 0,
          key: nil
        },
        {
          inputType: 'text',
          totalResponseCount: 5,
          questionResponseCount: 0,
          pageNumber: nil,
          logic: {},
          questionViewedCount: 0,
          key: 'question_three'
        },
        {
          inputType: 'page',
          totalResponseCount: 5,
          questionResponseCount: 0,
          pageNumber: 4,
          logic: {},
          questionViewedCount: 0,
          key: nil
        },
        {
          inputType: 'text',
          totalResponseCount: 5,
          questionResponseCount: 0,
          pageNumber: nil,
          logic: {},
          questionViewedCount: 0,
          key: 'question_four'
        },
        {
          inputType: 'page',
          totalResponseCount: 5,
          questionResponseCount: 0,
          pageNumber: 5,
          logic: {},
          questionViewedCount: 0,
          key: nil
        },
        {
          inputType: 'text',
          totalResponseCount: 5,
          questionResponseCount: 0,
          pageNumber: nil,
          logic: {},
          questionViewedCount: 0,
          key: 'question_five'
        }
      ]
    end

    let_it_be(:survey_custom_field_responses) do
      [
        { 'question_one' => 'option_2', 'question_two' => 1 },
        { 'question_one' => 'option_2' },
        { 'question_one' => 'option_1' },
        { 'question_one' => 'option_2', 'question_two' => 2 },
        { 'question_three' => %w[option_1 option_2] }
      ]
    end

    let(:results) { generator.send(:change_counts_for_logic, results_without_num_answered, survey_custom_field_responses) }

    it 'changes the totalResponsesCount when fields are not shown through logic' do
      expect(results_without_num_answered.pluck(:totalResponseCount)).to eq(
        [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] # Before
      )
      expect(results.pluck(:totalResponseCount)).to eq(
        [5, 5, 4, 4, 4, 2, 2, 1, 1, 2, 2] # After
      )
    end

    it 'reduces the count of not_answered responses when fields are not shown through logic' do
      # Linear scale (question 2)
      expect(results_without_num_answered[3][:answers].find { |a| a[:answer].nil? }).to eq({
        answer: nil, count: 3 # Before
      })
      expect(results[3][:answers].find { |a| a[:answer].nil? }).to eq({
        answer: nil, count: 2 # After
      })

      # Select (question 3)
      expect(results_without_num_answered[4][:answers].find { |a| a[:answer].nil? }).to eq({
        answer: nil, count: 3 # Before
      })
      expect(results[4][:answers].find { |a| a[:answer].nil? }).to eq({
        answer: nil, count: 2 # After
      })
    end

    it 'removes the temporary attributes used for calculating logic' do
      expect(results[0].keys).not_to include(:key, :questionViewedCount)
    end

    context 'question logic taking precedence over page logic' do
      # NOTE: Truncated results input object without unnecessary attributes for this method
      let_it_be(:results_without_num_answered) do
        [
          {
            inputType: 'page',
            totalResponseCount: 5,
            questionResponseCount: 4,
            pageNumber: 1,
            logic: { nextPageNumber: 3, numQuestionsSkipped: 1 },
            questionViewedCount: 0,
            key: 'page1'
          },
          {
            inputType: 'select',
            totalResponseCount: 5,
            questionResponseCount: 4,
            logic: {
              answer: {
                'option_1' => { id: 'ba98ad2c-668d-4e3f-8760-215c49f34dc1', nextPageNumber: 2, numQuestionsSkipped: 0 }
              }
            },
            questionViewedCount: 0,
            key: 'question_one',
            totalPickCount: 4,
            answers: [
              { answer: 'option_2', count: 0 },
              { answer: 'option_1', count: 4 },
              { answer: nil, count: 1 }
            ]
          },
          {
            inputType: 'page',
            totalResponseCount: 5,
            questionResponseCount: 3,
            pageNumber: 2,
            logic: { nextPageNumber: 999, numQuestionsSkipped: 1 },
            questionViewedCount: 0,
            key: 'page2'
          },
          {
            inputType: 'text',
            totalResponseCount: 5,
            questionResponseCount: 3,
            pageNumber: nil,
            logic: {},
            questionViewedCount: 0,
            key: 'question_two'
          },
          {
            inputType: 'page',
            totalResponseCount: 5,
            questionResponseCount: 1,
            pageNumber: 3,
            logic: {},
            questionViewedCount: 0,
            key: 'page3'
          },
          {
            inputType: 'text',
            totalResponseCount: 5,
            questionResponseCount: 1,
            pageNumber: nil,
            logic: {},
            questionViewedCount: 0,
            key: 'question_three'
          }
        ]
      end

      let_it_be(:survey_custom_field_responses) do
        [
          { 'question_one' => 'option_1', 'question_two' => 'Bla' },
          { 'question_one' => 'option_1', 'question_two' => 'Bla' },
          { 'question_one' => 'option_1', 'question_two' => 'Bla' },
          { 'question_one' => 'option_1' },
          { 'question_three' => 'Bla' }
        ]
      end

      let(:results) { generator.send(:change_counts_for_logic, results_without_num_answered, survey_custom_field_responses) }

      it 'changes the totalResponsesCount when fields are not shown through logic' do
        expect(results_without_num_answered.pluck(:totalResponseCount)).to eq(
          [5, 5, 5, 5, 5, 5] # Before
        )
        expect(results.pluck(:totalResponseCount)).to eq(
          [5, 5, 4, 4, 1, 1] # After
        )
      end

      it 'has the correct questionResponseCount' do
        expect(results.pluck(:questionResponseCount)).to eq(
          [4, 4, 3, 3, 1, 1] # After
        )
      end
    end
    # TODO: Check that a large dataset performs adequately
  end
end
