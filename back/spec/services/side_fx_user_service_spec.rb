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
      @status_review_pending = create(:initiative_status_review_pending)
      @status_changes_requested = create(:initiative_status_changes_requested)
      @status_proposed = create(:initiative_status_proposed)
      @status_threshold_reached = create(:initiative_status_threshold_reached)
      @status_expired = create(:initiative_status_expired)
    end

    it "destroys the user's reactions to initiatives in a voteable status" do
      user = create(:user)
      initiative1 = create(:initiative, initiative_status: @status_review_pending)
      initiative2 = create(:initiative, initiative_status: @status_changes_requested)
      initiative3 = create(:initiative, initiative_status: @status_proposed)
      initiative4 = create(:initiative, initiative_status: @status_threshold_reached)
      initiative5 = create(:initiative, initiative_status: @status_expired)
      _reaction1 = create(:reaction, user: user, reactable: initiative1)
      _reaction2 = create(:reaction, user: user, reactable: initiative2)
      _reaction3 = create(:reaction, user: user, reactable: initiative3)
      reaction4 = create(:reaction, user: user, reactable: initiative4)
      reaction5 = create(:reaction, user: user, reactable: initiative5)

      service.before_destroy(user, user)

      expect(user.reactions.pluck(:id)).to match_array [reaction4.id, reaction5.id]
    end
  end
end
