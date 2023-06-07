# frozen_string_literal: true

require 'rails_helper'

describe SideFxReactionService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe 'after_create' do
    it "logs a 'liked' action when a like on an idea is created" do
      reaction = create(:reaction, mode: 'up', reactable: create(:idea))
      expect { service.after_create(reaction, user) }
        .to have_enqueued_job(LogActivityJob)
    end

    it "logs a 'liked' action when a like on an initiative is created" do
      reaction = create(:reaction, mode: 'up', reactable: create(:initiative))
      expect { service.after_create(reaction, user) }
        .to have_enqueued_job(LogActivityJob)
    end

    it "logs a 'disliked' action when a dislike is created" do
      reaction = create(:reaction, mode: 'down', reactable: create(:idea))
      expect { service.after_create(reaction, user) }
        .to have_enqueued_job(LogActivityJob)
    end

    # Test for regression of bugfix to prevent case where an exception occurs due to resource being
    # deleted before the job to log an Activity recording its creation is run. See CL-1962.
    it "logs a 'liked' action when a like on an initiative is created and then immediately removed", active_job_inline_adapter: true do
      reaction = create(:reaction, mode: 'up', reactable: create(:initiative))
      reaction.destroy!
      allow(PublishActivityToRabbitJob).to receive(:perform_later)
      service.after_create(reaction, user)
      expect(Activity.where(action: 'initiative_liked').first).to be_present
    end
  end

  describe 'after_destroy' do
    it "logs a 'canceled_like' action job when an like is deleted" do
      reaction = create(:reaction, mode: 'up')
      freeze_time do
        frozen_reaction = reaction.destroy
        expect { service.after_destroy(frozen_reaction, user) }
          .to have_enqueued_job(LogActivityJob)
      end
    end

    it "logs a 'canceled_dislike' action job when a dislike is deleted" do
      reaction = create(:reaction, mode: 'down')
      freeze_time do
        frozen_reaction = reaction.destroy
        expect { service.after_destroy(frozen_reaction, user) }
          .to have_enqueued_job(LogActivityJob)
      end
    end
  end
end
