# frozen_string_literal: true

require 'rails_helper'

describe IdeaFeed::LiveClusteringService do
  let(:service) { described_class.new(phase) }

  let_it_be(:topics) do
    [
      create(:topic, title_multiloc: { 'en' => 'Transportation' }, description_multiloc: { 'en' => 'Ideas about transportation' }),
      create(:topic, title_multiloc: { 'en' => 'Housing' }, description_multiloc: { 'en' => 'Ideas about housing' }),
      create(:topic, title_multiloc: { 'en' => 'Education' }, description_multiloc: { 'en' => 'Ideas about education' })
    ]
  end

  let_it_be(:project) { create(:project, allowed_input_topics: topics) }
  let_it_be(:phase) { create(:idea_feed_phase, project:) }
  let_it_be(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

  describe '#classify' do
    it 'classifies an unclassified idea into the correct topic' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Free bike sharing!' }, body_multiloc: { 'en' => 'I love biking around the city.' }, topics: [])

      service.classify(idea)

      expect(idea.topics).to contain_exactly(topics[0])
    end

    it 'erases previous topic associations when classifying' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Affordable housing for all' }, body_multiloc: { 'en' => 'We need more affordable housing.' }, topics: [topics[0]])

      service.classify(idea)

      expect(idea.topics).to contain_exactly(topics[1])
    end
  end
end
