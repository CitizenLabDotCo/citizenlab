# frozen_string_literal: true

require 'rails_helper'

describe IdeaFeed::TopicModelingSchedulerJob do
  describe '#perform' do
    it 'calls the scheduler for projects with topic modeling enabled' do
      project = create(:project)
      project.update!(live_auto_input_topics_enabled: true)

      scheduler = instance_double(IdeaFeed::TopicModelingScheduler)
      allow(IdeaFeed::TopicModelingScheduler).to receive(:new).with(project).and_return(scheduler)
      expect(scheduler).to receive(:on_every_hour)

      described_class.perform_now
    end

    it 'skips projects where topic modeling is not enabled' do
      create(:project, live_auto_input_topics_enabled: false)

      expect(IdeaFeed::TopicModelingScheduler).not_to receive(:new)

      described_class.perform_now
    end

    it 'skips archived projects' do
      project = create(:project, live_auto_input_topics_enabled: true)
      project.admin_publication.update!(publication_status: 'archived')

      expect(IdeaFeed::TopicModelingScheduler).not_to receive(:new)

      described_class.perform_now
    end

    it 'skips draft projects' do
      project = create(:project, live_auto_input_topics_enabled: true)
      project.admin_publication.update!(publication_status: 'draft')

      expect(IdeaFeed::TopicModelingScheduler).not_to receive(:new)

      described_class.perform_now
    end

    it 'still runs after the only feed phase has ended' do
      project = create(:project, live_auto_input_topics_enabled: true)
      create(:idea_feed_phase, project:, start_at: 1.year.ago, end_at: 6.months.ago)

      scheduler = instance_double(IdeaFeed::TopicModelingScheduler)
      allow(IdeaFeed::TopicModelingScheduler).to receive(:new).with(project).and_return(scheduler)
      expect(scheduler).to receive(:on_every_hour)

      described_class.perform_now
    end
  end
end
