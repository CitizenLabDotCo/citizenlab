# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Polls::ResponseOption do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:poll_response_option)).to be_valid
    end
  end

  describe 'validate_same_phase' do
    it 'passes when the question and response use the same participation context' do
      phase = create(:single_phase_poll_project).phases.first
      question = create(:poll_question, :with_options, phase: phase)
      response = create(:poll_response, phase: phase)
      response_option = build(:poll_response_option, response: response, option: question.options.first)
      expect(response_option).to be_valid
    end

    it 'fails when the question and response use a different participation context' do
      phase1 = create(:single_phase_poll_project).phases.first
      phase2 = create(:single_phase_poll_project).phases.first
      question = create(:poll_question, :with_options, phase: phase1)
      response = create(:poll_response, phase: phase2)
      response_option = build(:poll_response_option, response: response, option: question.options.first)
      expect(response_option).to be_invalid
      expect(response_option.errors.details).to eq({ option_id: [{ error: :option_and_response_not_in_same_poll }] })
    end
  end
end
