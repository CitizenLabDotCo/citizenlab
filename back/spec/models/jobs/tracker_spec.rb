# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jobs::Tracker do
  let(:tracker) { create(:jobs_tracker) }

  describe '#increment_progress' do
    it 'atomically increments the progress' do
      same_tracker = described_class.find(tracker.id)
      expect(tracker.progress).to eq(0)
      expect(same_tracker.progress).to eq(0)

      tracker.increment_progress(10, 20)
      same_tracker.increment_progress(1, 2)

      tracker.reload
      same_tracker.reload

      expect(tracker.progress).to eq(11)
      expect(same_tracker.progress).to eq(11)
      expect(tracker.error_count).to eq(22)
      expect(same_tracker.error_count).to eq(22)
    end

    it 'atomically adjusts the total if necessary' do
      described_class.find(tracker.id).update!(progress: 1, error_count: 2, total: 5)
      # `tracker` is stale now.

      tracker.increment_progress(4, 6)

      expect(tracker.total).to eq(13)
    end
  end

  describe '#complete!' do
    it 'atomically sets the completed_at field' do
      same_tracker = described_class.find(tracker.id)
      expect(tracker.completed_at).to be_nil
      expect(same_tracker.completed_at).to be_nil

      completed_at = 3.minutes.ago
      travel_to(completed_at) { same_tracker.complete! }
      expect(same_tracker.completed_at).to be_within(1.second).of(completed_at)

      # `tracker` is stale now.
      expect { tracker.complete! }.not_to change { same_tracker.reload.completed_at }
    end
  end
end
