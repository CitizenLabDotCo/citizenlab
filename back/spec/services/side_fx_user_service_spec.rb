# frozen_string_literal: true

require 'rails_helper'

describe SideFxUserService do
  let(:service) { described_class.new }

  describe 'after_create' do
    it "logs a 'created' action job when a user is created" do
      user = create(:user)

      expect { service.after_create(user, user) }
        .to enqueue_job(LogActivityJob)
        .with(user, 'created', user, user.created_at.to_i)
        .exactly(1).times
    end

    it 'creates a follower for the domicile' do
      area = create(:area)
      user = create(:user, domicile: area.id)

      expect do
        service.after_create user, user
      end.to change(Follower, :count).from(0).to(1)

      expect(user.follows.pluck(:followable_id)).to contain_exactly area.id
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when a user is resubmitted" do
      user = create(:user)

      expect { service.after_update(user, user) }
        .to enqueue_job(LogActivityJob)
        .with(user, 'changed', user, user.updated_at.to_i)
        .exactly(1).times
    end

    it 'creates a follower for the domicile' do
      area = create(:area)
      user = create(:user, domicile: area.id)

      expect do
        service.after_update user, user
      end.to change(Follower, :count).from(0).to(1)

      expect(user.follows.pluck(:followable_id)).to contain_exactly area.id
    end
  end

  describe 'before_destroy' do
    before do
      @proposed_status = create(:initiative_status_proposed)
      @threshold_reached_status = create(:initiative_status_threshold_reached)
      @expired_status = create(:initiative_status_expired)
    end

    it "destroys the user's reactions to initiatives in proposed status" do
      user = create(:user)
      initiative1 = create(:initiative, initiative_status: @proposed_status)
      initiative2 = create(:initiative, initiative_status: @threshold_reached_status)
      initiative3 = create(:initiative, initiative_status: @expired_status)
      _reaction1 = create(:reaction, user: user, reactable: initiative1)
      reaction2 = create(:reaction, user: user, reactable: initiative2)
      reaction3 = create(:reaction, user: user, reactable: initiative3)

      service.before_destroy(user, user)

      expect(user.reactions.pluck(:id)).to match_array [reaction2.id, reaction3.id]
    end
  end
end
