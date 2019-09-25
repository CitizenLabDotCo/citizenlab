require "rails_helper"

describe Polls::PollParticipationContext do

  describe "poll_questions_allowed_in_participation_method" do
    it "invalidates the participation context when there are poll questions associated to a non-poll participation_method" do
      question = create(:poll_question)
      pc = question.participation_context
      pc.participation_method = "information"
      expect(pc).to be_invalid
      expect(pc.errors.details).to include({:base => [{:error=>:cannot_contain_poll_questions, :questions_count=>1}]})
    end
  end
end