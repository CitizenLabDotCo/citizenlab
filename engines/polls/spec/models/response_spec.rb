require 'rails_helper'

RSpec.describe Polls::Response, type: :model do

  describe "Default factory" do
    it "is valid" do
      expect(build(:poll_response)).to be_valid
    end
  end

  describe "validate_all_questions_one_option" do
    it "adds no error when all questions are answered" do
      pc = create(:continuous_poll_project)
      q1 = create(:poll_question, :with_options, participation_context: pc)
      q2 = create(:poll_question, :with_options, participation_context: pc)
      response = build(
        :poll_response,
        participation_context: pc,
        response_options_attributes: [
          {option_id: q1.options.first.id},
          {option_id: q2.options.first.id},
        ]
      )
      expect(response.valid?(:response_submission)).to be true
      expect(response.errors).to be_empty
    end

    it "adds an error when not all questions are answered" do
      pc = create(:continuous_poll_project)
      q1 = create(:poll_question, :with_options, participation_context: pc)
      q2 = create(:poll_question, :with_options, participation_context: pc)
      response = build(
        :poll_response,
        participation_context: pc,
        response_options_attributes: [
          {option_id: q1.options.first.id},
        ]
      )
      expect(response.valid?(:response_submission)).to be false
      expect(response.errors.details).to include({:base => [{:error=>:not_all_questions_one_option}]})
    end

    it "adds an error when a question is answered with multiple options" do
      pc = create(:continuous_poll_project)
      q1 = create(:poll_question, :with_options, participation_context: pc)
      q2 = create(:poll_question, :with_options, participation_context: pc)
      response = build(
        :poll_response,
        participation_context: pc,
        response_options_attributes: [
          {option_id: q1.options.first.id},
          {option_id: q1.options.last.id},
          {option_id: q2.options.first.id},
        ]
      )
      expect(response.valid?(:response_submission)).to be false
      expect(response.errors.details).to include({:base => [{:error=>:not_all_questions_one_option}]})
    end
  end

end
