# frozen_string_literal: true

require 'rails_helper'

describe SideFxVoteService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe 'after_create' do
    it "logs a 'upvoted' action when a upvote on an idea is created" do
      vote = create(:vote, mode: 'up', votable: create(:idea))
      expect { service.after_create(vote, user) }
        .to have_enqueued_job(LogActivityJob)
    end

    it "logs a 'upvoted' action when a upvote on an initiative is created" do
      vote = create(:vote, mode: 'up', votable: create(:initiative))
      expect { service.after_create(vote, user) }
        .to have_enqueued_job(LogActivityJob)
    end

    it "logs a 'downvoted' action when a downvote is created" do
      vote = create(:vote, mode: 'down', votable: create(:idea))
      expect { service.after_create(vote, user) }
        .to have_enqueued_job(LogActivityJob)
    end

    # Test for regression of bugfix to prevent case where an exception occurs due to resource being
    # deleted before the job to log an Activity recording its creation is run. See CL-1962.
    it "logs a 'upvoted' action when a upvote on an initiative is created and then immediately removed", active_job_inline_adapter: true do
      vote = create(:vote, mode: 'up', votable: create(:initiative))
      vote.destroy!
      allow(PublishActivityToRabbitJob).to receive(:perform_later)
      service.after_create(vote, user)
      expect(Activity.where(action: 'initiative_upvoted').first).to be_present
    end
  end

  describe 'after_destroy' do
    it "logs a 'canceled_upvote' action job when an upvote is deleted" do
      vote = create(:vote, mode: 'up')
      freeze_time do
        frozen_vote = vote.destroy
        expect { service.after_destroy(frozen_vote, user) }
          .to have_enqueued_job(LogActivityJob)
      end
    end

    it "logs a 'canceled_downvote' action job when a downvote is deleted" do
      vote = create(:vote, mode: 'down')
      freeze_time do
        frozen_vote = vote.destroy
        expect { service.after_destroy(frozen_vote, user) }
          .to have_enqueued_job(LogActivityJob)
      end
    end
  end
end
