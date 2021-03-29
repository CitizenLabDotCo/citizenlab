require "rails_helper"

describe Volunteering::VolunteeringParticipationContext do

  describe "causes_allowed_in_participation_method" do
    it "invalidates the participation context when there are causes associated to a non-volunteering participation_method" do
      cause = create(:cause)
      pc = cause.participation_context
      pc.participation_method = "information"
      expect(pc).to be_invalid
      expect(pc.errors.details).to include({:base => [{:error=>:cannot_contain_causes, :causes_count=>1}]})
    end
  end
end
