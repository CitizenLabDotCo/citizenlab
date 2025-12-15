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

  describe '#classify', :vcr do
    it 'classifies an unclassified idea into the correct topic' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Free bike sharing!' }, body_multiloc: { 'en' => 'I love biking around the city.' }, topics: [])

      expect_any_instance_of(Analysis::LLM::Gemini25Flash).to receive(:chat).and_return('[1]')
      service.classify(idea)

      expect(idea.topics).to contain_exactly(topics[0])
    end

    it 'erases previous topic associations when classifying' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Affordable housing for all' }, body_multiloc: { 'en' => 'We need more affordable housing.' }, topics: [topics[0]])

      expect_any_instance_of(Analysis::LLM::Gemini25Flash).to receive(:chat).and_return('[2]')
      service.classify(idea)

      expect(idea.topics).to contain_exactly(topics[1])
    end

    it 'assigns multiple topics if applicable' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Better schools and public transport' }, body_multiloc: { 'en' => 'We need to improve both education and transportation.' }, topics: [])

      expect_any_instance_of(Analysis::LLM::Gemini25Flash).to receive(:chat).and_return('[1, 3]')
      service.classify(idea)

      expect(idea.topics).to contain_exactly(topics[0], topics[2])
    end

    it 'removes all topics if no topic is relevant' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'More parks and green spaces' }, body_multiloc: { 'en' => 'We need more parks in the city.' }, topics: [topics[0]])

      expect_any_instance_of(Analysis::LLM::Gemini25Flash).to receive(:chat).and_return('[]')
      service.classify(idea)

      expect(idea.topics).to be_empty
    end

    it 'retries when the LLM response is invalid JSON' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Improve public transport' }, body_multiloc: { 'en' => 'Public transport needs to be more efficient.' }, topics: [])

      llm_instance = instance_double(Analysis::LLM::Gemini25Flash)
      expect(Analysis::LLM::Gemini25Flash).to receive(:new).and_return(llm_instance)
      expect(llm_instance).to receive(:chat).and_return('invalid json', '[1]')

      service.classify(idea)

      expect(idea.topics).to contain_exactly(topics[0])
    end

    it 'retries when the LLM response contains invalid topic IDs' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Improve public transport' }, body_multiloc: { 'en' => 'Public transport needs to be more efficient.' }, topics: [])

      llm_instance = instance_double(Analysis::LLM::Gemini25Flash)
      expect(Analysis::LLM::Gemini25Flash).to receive(:new).and_return(llm_instance)
      expect(llm_instance).to receive(:chat).and_return('[99]', '[1]')

      service.classify(idea)

      expect(idea.topics).to contain_exactly(topics[0])
    end
  end
end
