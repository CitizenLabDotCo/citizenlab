# frozen_string_literal: true

require 'rails_helper'

describe IdeaFeed::TopicModelingSchedulerJob do
  describe '#perform' do
    it 'calls the scheduler for current ideation phases with topic modeling enabled' do
      phase = create(:phase, participation_method: 'ideation', start_at: 1.day.ago, end_at: 1.day.from_now)
      phase.project.update!(live_auto_input_topics_enabled: true)

      scheduler = instance_double(IdeaFeed::TopicModelingScheduler)
      allow(IdeaFeed::TopicModelingScheduler).to receive(:new).with(phase).and_return(scheduler)
      expect(scheduler).to receive(:on_every_hour)

      described_class.perform_now
    end

    it 'skips phases where the participation method does not support input topics' do
      phase = create(:phase, participation_method: 'common_ground', start_at: 1.day.ago, end_at: 1.day.from_now)
      phase.project.update!(live_auto_input_topics_enabled: true)

      expect(IdeaFeed::TopicModelingScheduler).not_to receive(:new)

      described_class.perform_now
    end

    it 'skips phases where topic modeling is not enabled on the project' do
      create(:phase, participation_method: 'ideation', start_at: 1.day.ago, end_at: 1.day.from_now)

      expect(IdeaFeed::TopicModelingScheduler).not_to receive(:new)

      described_class.perform_now
    end

    it 'skips phases that are not current' do
      phase = create(:phase, participation_method: 'ideation', start_at: 1.year.ago, end_at: 6.months.ago)
      phase.project.update!(live_auto_input_topics_enabled: true)

      expect(IdeaFeed::TopicModelingScheduler).not_to receive(:new)

      described_class.perform_now
    end
  end
end
