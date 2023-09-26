# frozen_string_literal: true

require 'rails_helper'

describe SideFxFollowerService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:follower) { create(:follower) }

  describe 'after_create' do
    it "logs a 'created' action when a follower is created" do
      expect { service.after_create(follower, user) }
        .to enqueue_job(LogActivityJob)
        .with(follower, 'created', user, follower.created_at.to_i)
    end

    it 'updates smart group counts when a follower is created' do
      expect { service.after_create(follower, user) }
        .to enqueue_job(UpdateMemberCountJob)
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when a follower is destroyed" do
      freeze_time do
        frozen_follower = follower.destroy
        expect { service.after_destroy(frozen_follower, user) }
          .to enqueue_job(LogActivityJob)
      end
    end

    it 'updates smart group counts counts when a follower is destroyed' do
      expect { service.after_create(follower, user) }
        .to enqueue_job(UpdateMemberCountJob)
    end
  end
end
