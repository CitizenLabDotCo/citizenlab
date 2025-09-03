# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jobs::Tracker do
  let(:tracker) { create(:jobs_tracker) }

  describe 'associations' do
    it { is_expected.to belong_to(:root_job).class_name('QueJob').optional }
    it { is_expected.to belong_to(:owner).class_name('User').optional }
    it { is_expected.to belong_to(:context).optional }
    it { is_expected.to belong_to(:project).optional }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:root_job_type) }
    it { is_expected.to validate_numericality_of(:total).is_greater_than_or_equal_to(:progress).allow_nil }
    it { is_expected.to validate_numericality_of(:progress).is_greater_than_or_equal_to(:error_count) }
    it { is_expected.to validate_numericality_of(:error_count).is_greater_than_or_equal_to(0) }

    it 'validates that error_count is less than or equal to progress' do
      tracker.progress = 5
      tracker.error_count = 3
      expect(tracker).to be_valid

      tracker.error_count = 5
      expect(tracker).to be_valid

      tracker.error_count = 6
      expect(tracker).not_to be_valid
      expect(tracker.errors[:progress]).to be_present
    end

    it 'validates that progress is less than or equal to total' do
      tracker.total = 5
      tracker.progress = 3
      expect(tracker).to be_valid

      tracker.progress = 5
      expect(tracker).to be_valid

      tracker.progress = 6
      expect(tracker).not_to be_valid
      expect(tracker.errors[:total]).to be_present
    end
  end

  describe '#increment_progress' do
    it 'atomically increments the progress' do
      same_tracker = described_class.find(tracker.id)
      expect(tracker.progress).to eq(0)
      expect(same_tracker.progress).to eq(0)

      tracker.increment_progress(20, 10)
      same_tracker.increment_progress(2, 1)

      tracker.reload
      same_tracker.reload

      expect(tracker.progress).to eq(22)
      expect(same_tracker.progress).to eq(22)
      expect(tracker.error_count).to eq(11)
      expect(same_tracker.error_count).to eq(11)
    end

    it 'atomically adjusts the total if necessary' do
      described_class.find(tracker.id).update!(progress: 3, error_count: 2, total: 5)
      # `tracker` is stale now.

      tracker.increment_progress(4, 1)

      expect(tracker.total).to eq(7)
    end

    it 'raises an error when error_count exceeds progress in increment_progress' do
      expect { tracker.increment_progress(5, 6) }.to raise_error(
        ArgumentError, 'error_count must be less than or equal to progress'
      )
    end

    it 'allows error_count equal to progress in increment_progress' do
      expect { tracker.increment_progress(5, 5) }.not_to raise_error
      expect(tracker.progress).to eq(5)
      expect(tracker.error_count).to eq(5)
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

    it 'updates the total if necessary' do
      described_class.find(tracker.id).update!(progress: 3, error_count: 1, total: 5)
      # `tracker` is stale now.
      expect(tracker.total).to be_nil

      tracker.complete!

      expect(tracker.total).to eq(3)
    end
  end

  describe '.completed scope' do
    let_it_be(:completed_tracker) { create(:jobs_tracker, completed_at: 1.hour.ago) }
    let_it_be(:incomplete_tracker) { create(:jobs_tracker, completed_at: nil) }

    it 'returns completed trackers when true or no parameter' do
      expect(described_class.completed).to match_array [completed_tracker]
      expect(described_class.completed(true)).to match_array [completed_tracker]
    end

    it 'returns incomplete trackers when false' do
      expect(described_class.completed(false)).to match_array [incomplete_tracker]
    end

    it 'returns all trackers when nil' do
      expect(described_class.completed(nil)).to match_array [completed_tracker, incomplete_tracker]
    end

    it 'raises error for invalid completion values' do
      expect { described_class.completed('invalid') }.to raise_error(ArgumentError)
    end
  end
end
