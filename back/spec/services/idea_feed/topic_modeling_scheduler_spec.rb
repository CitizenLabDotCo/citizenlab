# frozen_string_literal: true

require 'rails_helper'

describe IdeaFeed::TopicModelingScheduler do
  let(:project) { create(:project) }
  let(:phase) { create(:idea_feed_phase, project:) }
  let(:scheduler) { described_class.new(phase) }
  let(:timezone) { AppConfiguration.timezone }

  before do
    stub_const('IdeaFeed::TopicModelingScheduler::MINIMUM_INPUTS', 3)
  end

  # Returns a time at the specified hour in the app's timezone for today
  def time_at_hour(hour)
    timezone.now.change(hour:, min: 0, sec: 0)
  end

  describe '#on_every_hour' do
    context 'when phase has fewer than MINIMUM_INPUTS ideas' do
      before do
        create_list(:idea, 2, project:, phases: [phase])
      end

      it 'returns nil' do
        travel_to time_at_hour(4) do
          expect(scheduler.on_every_hour).to be_nil
        end
      end
    end

    context 'when a recent run happened less than MINIMUM_INTERVAL_BETWEEN_RUNS ago' do
      it 'returns nil' do
        create_list(:idea, 5, project:, phases: [phase])
        travel_to time_at_hour(4) do
          create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 10.minutes.ago, payload: { 'input_count' => 3 })
          expect(scheduler.on_every_hour).to be_nil
        end
      end
    end

    context 'when current hour is not DAILY_SCHEDULE_HOUR (4 AM)' do
      before do
        create_list(:idea, 5, project:, phases: [phase])
      end

      it 'returns nil when it is 3 AM' do
        travel_to time_at_hour(3) do
          expect(scheduler.on_every_hour).to be_nil
        end
      end

      it 'returns nil when it is 5 AM' do
        travel_to time_at_hour(5) do
          expect(scheduler.on_every_hour).to be_nil
        end
      end
    end

    context 'when input increase since last run is less than MINIMUM_INPUT_INCREASE (10%)' do
      it 'returns nil' do
        create_list(:idea, 10, project:, phases: [phase])
        travel_to time_at_hour(4) do
          create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 1.day.ago, payload: { 'input_count' => 10 })
          expect(scheduler.on_every_hour).to be_nil
        end
      end
    end

    context 'when all conditions are met' do
      it 'enqueues TopicModelingJob when input increase is >= 10%' do
        create_list(:idea, 6, project:, phases: [phase])
        travel_to time_at_hour(4) do
          create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 1.day.ago, payload: { 'input_count' => 5 })
          expect { scheduler.on_every_hour }.to have_enqueued_job(IdeaFeed::TopicModelingJob).with(phase)
        end
      end
    end

    context 'when there is no previous run' do
      before do
        create_list(:idea, 3, project:, phases: [phase])
      end

      it 'enqueues TopicModelingJob' do
        travel_to time_at_hour(4) do
          expect { scheduler.on_every_hour }.to have_enqueued_job(IdeaFeed::TopicModelingJob).with(phase)
        end
      end
    end

    context 'when previous run had 0 inputs' do
      it 'enqueues TopicModelingJob' do
        create_list(:idea, 3, project:, phases: [phase])
        travel_to time_at_hour(4) do
          create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 1.day.ago, payload: { 'input_count' => 0 })
          expect { scheduler.on_every_hour }.to have_enqueued_job(IdeaFeed::TopicModelingJob).with(phase)
        end
      end
    end
  end

  describe '#on_new_input' do
    context 'when phase has fewer than MINIMUM_INPUTS ideas' do
      before do
        create_list(:idea, 2, project:, phases: [phase])
      end

      it 'returns nil' do
        expect(scheduler.on_new_input).to be_nil
      end
    end

    context 'when a recent run happened less than MINIMUM_INTERVAL_BETWEEN_RUNS ago' do
      before do
        create_list(:idea, 7, project:, phases: [phase])
        create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 10.minutes.ago, payload: { 'input_count' => 5 })
      end

      it 'returns nil' do
        expect(scheduler.on_new_input).to be_nil
      end
    end

    context 'when input increase since last run is less than INSTANT_INPUT_INCREASE (30%)' do
      before do
        create_list(:idea, 6, project:, phases: [phase])
        create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 1.day.ago, payload: { 'input_count' => 5 })
      end

      it 'returns nil when increase is 20%' do
        expect(scheduler.on_new_input).to be_nil
      end
    end

    context 'when all conditions are met' do
      before do
        create_list(:idea, 7, project:, phases: [phase])
        create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 1.day.ago, payload: { 'input_count' => 5 })
      end

      it 'enqueues TopicModelingJob when input increase is >= 30%' do
        expect { scheduler.on_new_input }.to have_enqueued_job(IdeaFeed::TopicModelingJob).with(phase)
      end
    end

    context 'when there is no previous run' do
      before do
        create_list(:idea, 3, project:, phases: [phase])
      end

      it 'enqueues TopicModelingJob' do
        expect { scheduler.on_new_input }.to have_enqueued_job(IdeaFeed::TopicModelingJob).with(phase)
      end
    end

    context 'when previous run had 0 inputs' do
      before do
        create_list(:idea, 3, project:, phases: [phase])
        create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 1.day.ago, payload: { 'input_count' => 0 })
      end

      it 'enqueues TopicModelingJob' do
        expect { scheduler.on_new_input }.to have_enqueued_job(IdeaFeed::TopicModelingJob).with(phase)
      end
    end
  end

  describe 'edge cases' do
    context 'when exactly at MINIMUM_INPUT_INCREASE boundary (10%)' do
      it 'enqueues job via on_every_hour' do
        create_list(:idea, 10, project:, phases: [phase])
        travel_to time_at_hour(4) do
          # 10 ideas now, 9 at last run = 11.1% increase (just over 10%)
          create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 1.day.ago, payload: { 'input_count' => 9 })
          expect { scheduler.on_every_hour }.to have_enqueued_job(IdeaFeed::TopicModelingJob)
        end
      end

      it 'does not enqueue job via on_new_input (needs 30%)' do
        create_list(:idea, 10, project:, phases: [phase])
        # 10 ideas now, 9 at last run = 11.1% increase (under 30%)
        create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 1.day.ago, payload: { 'input_count' => 9 })
        expect(scheduler.on_new_input).to be_nil
      end
    end

    context 'when exactly at INSTANT_INPUT_INCREASE boundary (30%)' do
      before do
        create_list(:idea, 10, project:, phases: [phase])
        # 10 ideas now, 7 at last run = 42.8% increase (over 30%)
        create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 1.day.ago, payload: { 'input_count' => 7 })
      end

      it 'enqueues job via on_new_input' do
        expect { scheduler.on_new_input }.to have_enqueued_job(IdeaFeed::TopicModelingJob)
      end
    end

    context 'when exactly at MINIMUM_INTERVAL_BETWEEN_RUNS boundary (20 minutes)' do
      before do
        create_list(:idea, 5, project:, phases: [phase])
      end

      it 'allows job when exactly 20 minutes have passed' do
        create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 20.minutes.ago, payload: { 'input_count' => 3 })
        expect { scheduler.on_new_input }.to have_enqueued_job(IdeaFeed::TopicModelingJob)
      end

      it 'blocks job when just under 20 minutes have passed' do
        create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 19.minutes.ago, payload: { 'input_count' => 3 })
        expect(scheduler.on_new_input).to be_nil
      end
    end

    context 'when multiple previous run activities exist' do
      before do
        create_list(:idea, 8, project:, phases: [phase])
        create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 2.days.ago, payload: { 'input_count' => 3 })
        create(:activity, item: phase, action: 'topics_rebalanced', acted_at: 1.day.ago, payload: { 'input_count' => 5 })
      end

      it 'uses the most recent activity for calculations' do
        # 8 ideas now, 5 at last run = 60% increase, should trigger on_new_input
        expect { scheduler.on_new_input }.to have_enqueued_job(IdeaFeed::TopicModelingJob)
      end
    end

    context 'with unpublished ideas' do
      before do
        create_list(:idea, 2, project:, phases: [phase])
        create_list(:idea, 5, project:, phases: [phase], publication_status: 'draft')
      end

      it 'only counts published ideas' do
        # 2 published ideas < 3 minimum
        expect(scheduler.on_new_input).to be_nil
      end
    end
  end
end
