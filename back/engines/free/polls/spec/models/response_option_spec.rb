# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Polls::ResponseOption do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:poll_response_option)).to be_valid
    end
  end

  describe 'validate_same_participation_context' do
    it 'passes when the question and response use the same participation context' do
      pc = create(:continuous_poll_project)
      question = create(:poll_question, :with_options, participation_context: pc)
      response = create(:poll_response, participation_context: pc)
      response_option = build(:poll_response_option, response: response, option: question.options.first)
      expect(response_option).to be_valid
    end

    it 'fails when the question and response use a different participation context' do
      pc1 = create(:continuous_poll_project)
      pc2 = create(:continuous_poll_project)
      question = create(:poll_question, :with_options, participation_context: pc1)
      response = create(:poll_response, participation_context: pc2)
      response_option = build(:poll_response_option, response: response, option: question.options.first)
      expect(response_option).to be_invalid
      expect(response_option.errors.details).to eq({ option_id: [{ error: :option_and_response_not_in_same_poll }] })
    end
  end
end
