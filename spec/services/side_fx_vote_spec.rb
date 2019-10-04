require "rails_helper"

describe SideFxVoteService do
  let(:service) { SideFxVoteService.new }
  let(:user) { create(:user) }

  describe "after_create" do
    it "logs a 'upvoted' action when a upvote on an idea is created" do
      vote = create(:vote, mode: 'up', votable: create(:idea))
      expect {service.after_create(vote, user)}.
        to have_enqueued_job(LogActivityJob).with(vote, 'idea_upvoted', user, vote.updated_at.to_i)
    end

    it "logs a 'upvoted' action when a upvote on an initiative is created" do
      vote = create(:vote, mode: 'up', votable: create(:initiative))
      expect {service.after_create(vote, user)}
        .to have_enqueued_job(LogActivityJob).with(vote, 'initiative_upvoted', user, vote.updated_at.to_i)
    end

    it "logs a 'downvoted' action when a downvote is created" do
      vote = create(:vote, mode: 'down', votable: create(:idea))
      expect {service.after_create(vote, user)}.
        to have_enqueued_job(LogActivityJob).with(vote, 'idea_downvoted', user, vote.updated_at.to_i)
    end

  end

  describe "after_destroy" do

    it "logs a 'canceled_upvote' action job when an upvote is deleted" do
      vote = create(:vote, mode: 'up')
      travel_to Time.now do
        frozen_vote = vote.destroy
        expect {service.after_destroy(frozen_vote, user)}.
          to have_enqueued_job(LogActivityJob)
      end
    end

    it "logs a 'canceled_downvote' action job when a downvote is deleted" do
      vote = create(:vote, mode: 'down')
      travel_to Time.now do
        frozen_vote = vote.destroy
        expect {service.after_destroy(frozen_vote, user)}.
          to have_enqueued_job(LogActivityJob)
      end
    end

  end
end
