# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SurveyResultsGeneratorService do
  subject(:generator) { described_class.new survey_phase }

  let_it_be(:project) { create(:single_phase_native_survey_project) }
  let_it_be(:survey_phase) { project.phases.first }

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
end

describe 'change_counts_for_logic: question logic taking prescedence over page logic' do
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
      },
    ]
  end

  let_it_be(:survey_custom_field_responses) do
    [
      { 'question_one' => 'option_1', 'question_two' => 'Bla' },
      { 'question_one' => 'option_1', 'question_two' => 'Bla' },
      { 'question_one' => 'option_1', 'question_two' => 'Bla' },
      { 'question_one' => 'option_1'},
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
end