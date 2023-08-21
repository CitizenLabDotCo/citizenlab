# frozen_string_literal: true

require 'rails_helper'

describe SideFxBasketService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe 'after_create' do
    it "logs a 'created' action job when a basket is created" do
      basket = create(:basket, user: user)

      expect { service.after_create(basket, user) }
        .to enqueue_job(LogActivityJob)
        .with(basket, 'created', user, basket.created_at.to_i, anything)
        .exactly(1).times
    end

    it 'creates a follower' do
      basket = create(:basket)
      folder = create(:project_folder, projects: [basket.participation_context.project])

      expect do
        service.after_create basket.reload, user
      end.to change(Follower, :count).from(0).to(2)

      expect(user.follows.pluck(:followable_id)).to contain_exactly basket.participation_context.project.id, folder.id
    end
  end

  describe 'after_update' do
    it "logs a 'submitted' action job when a basket is resubmitted" do
      basket = create(:basket)

      expect { service.after_update(basket, user) }
        .to enqueue_job(LogActivityJob)
        .with(basket, 'submitted', user, basket.updated_at.to_i, anything)
        .exactly(1).times
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the basket is destroyed" do
      basket = create(:basket)
      freeze_time do
        frozen_basket = basket.destroy
        expect { service.after_destroy(frozen_basket, user) }
          .to enqueue_job(LogActivityJob).exactly(1).times
      end
    end
  end
end
