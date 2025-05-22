# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jobs::Tracker do
  let(:tracker) { create(:jobs_tracker) }

  describe '#increment_progress' do
    it 'atomically increments the progress' do
      same_tracker = described_class.find(tracker.id)
      expect(tracker.progress).to eq(0)
      expect(same_tracker.progress).to eq(0)

      tracker.increment_progress
      same_tracker.increment_progress(10)

      expect(tracker.reload.progress).to eq(11)
      expect(same_tracker.reload.progress).to eq(11)
    end
  end

  describe '#complete' do
    it 'sets progress to total' do
      tracker.update!(total: 200)
      tracker.complete

      expect(tracker.reload.progress).to eq(200)
    end
  end

  describe '#percentage' do
    it 'returns the percentage of progress' do
      tracker.update!(total: 150, progress: 75)

      expect(tracker.percentage).to eq(50)
    end

    it 'returns 100 when progress is greater than or equal to total' do
      tracker.update!(progress: 150)

      expect(tracker.total).to eq(100)
      expect(tracker.percentage).to eq(100)
    end
  end
end
