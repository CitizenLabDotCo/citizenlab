require "rails_helper"

describe Polls::PollParticipationContext do

  describe "poll_questions_allowed_in_participation_method" do
    it "invalidates the participation context when there are poll questions associated to a non-poll participation_method" do
      question = create(:poll_question)
      pc = question.participation_context
      pc.participation_method = "information"
      expect(pc).to be_invalid
      expect(pc.errors.details).to eq({:base => [{:error=>:cannot_contain_poll_questions, :questions_count=>1}]})
    end
  end

  describe "anonymous_immutable_after_responses" do

    it "allows editing poll_anonymous before the first response comes in" do
      pc = create(:continuous_poll_project, poll_anonymous: true)
      question = create(:poll_question, participation_context: pc)
      pc.poll_anonymous = false
      expect(pc).to be_valid
    end

    it "doesn't allow editing poll_anonymous after the first response came in" do
      pc = create(:continuous_poll_project, poll_anonymous: true)
      question = create(:poll_question, participation_context: pc)
      create(:poll_response, participation_context: pc)
      pc.poll_anonymous = false
      expect(pc).to be_invalid
      expect(pc.errors.details).to eq({:poll_anonymous => [{:error=>:cant_change_after_first_response}]})
    end
  end
end