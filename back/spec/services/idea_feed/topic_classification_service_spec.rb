# frozen_string_literal: true

require 'rails_helper'

describe IdeaFeed::TopicClassificationService do
  let(:service) { described_class.new(phase) }

  describe '#classify_topics!' do
    let_it_be(:project) { create(:project) }
    let_it_be(:phase) { create(:idea_feed_phase, project:) }
    let_it_be(:topics) do
      [
        create(:input_topic, title_multiloc: { 'en' => 'Transportation' }, description_multiloc: { 'en' => 'Ideas about transportation' }, project:),
        create(:input_topic, title_multiloc: { 'en' => 'Housing' }, description_multiloc: { 'en' => 'Ideas about housing' }, project:),
        create(:input_topic, title_multiloc: { 'en' => 'Education' }, description_multiloc: { 'en' => 'Ideas about education' }, project:)
      ]
    end
    let_it_be(:subtopics) do
      [
        create(:input_topic, title_multiloc: { 'en' => 'Sidewalks' }, description_multiloc: { 'en' => 'Ideas about public transport' }, parent: topics[0], project:),
        create(:input_topic, title_multiloc: { 'en' => 'Public transport' }, description_multiloc: { 'en' => 'Ideas about public transport' }, parent: topics[0], project:)
      ]
    end
    let_it_be(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
    it 'classifies an unclassified idea into the correct subtopic' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Free bike sharing!' }, body_multiloc: { 'en' => 'I love biking around the city.' }, input_topics: [])

      expect_any_instance_of(Analysis::LLM::Gemini3Flash).to receive(:chat).and_return(['1.1'])
      service.classify_topics!(idea)

      expect(idea.input_topics).to contain_exactly(subtopics[0])
    end

    it 'classifies an unclassified idea into the correct topic' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Free bike sharing!' }, body_multiloc: { 'en' => 'I love biking around the city.' }, input_topics: [])

      expect_any_instance_of(Analysis::LLM::Gemini3Flash).to receive(:chat).and_return(['2'])
      service.classify_topics!(idea)

      expect(idea.input_topics).to contain_exactly(topics[1])
    end

    it 'erases previous topic associations when classifying' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Affordable housing for all' }, body_multiloc: { 'en' => 'We need more affordable housing.' }, input_topics: [topics[0]])

      expect_any_instance_of(Analysis::LLM::Gemini3Flash).to receive(:chat).and_return(['2'])
      service.classify_topics!(idea)

      expect(idea.input_topics).to contain_exactly(topics[1])
    end

    it 'assigns multiple topics if applicable' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Better schools and public transport' }, body_multiloc: { 'en' => 'We need to improve both education and transportation.' }, input_topics: [])

      expect_any_instance_of(Analysis::LLM::Gemini3Flash).to receive(:chat).and_return(['1.2', '3'])
      service.classify_topics!(idea)

      expect(idea.input_topics).to contain_exactly(subtopics[1], topics[2])
    end

    it 'removes all topics if no topic is relevant' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'More parks and green spaces' }, body_multiloc: { 'en' => 'We need more parks in the city.' }, input_topics: [topics[0]])

      expect_any_instance_of(Analysis::LLM::Gemini3Flash).to receive(:chat).and_return([])
      service.classify_topics!(idea)

      expect(idea.input_topics).to be_empty
    end

    it 'retries when the LLM response contains invalid topic IDs' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Improve public transport' }, body_multiloc: { 'en' => 'Public transport needs to be more efficient.' }, input_topics: [])

      llm_instance = instance_double(Analysis::LLM::Gemini3Flash)
      expect(Analysis::LLM::Gemini3Flash).to receive(:new).and_return(llm_instance)
      expect(llm_instance).to receive(:chat).and_return(['99'], ['1'])

      service.classify_topics!(idea)

      expect(idea.input_topics).to contain_exactly(topics[0])
    end

    it 'retries when the LLM response is not an in-bounds integer array' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Improve public transport' }, body_multiloc: { 'en' => 'Public transport needs to be more efficient.' }, input_topics: [])

      llm_instance = instance_double(Analysis::LLM::Gemini3Flash)
      expect(Analysis::LLM::Gemini3Flash).to receive(:new).and_return(llm_instance)
      expect(llm_instance).to receive(:chat).and_return(%w[a b], ['1'])

      service.classify_topics!(idea)

      expect(idea.input_topics).to contain_exactly(topics[0])
    end
  end

  describe '#classify_all_inputs_in_background!' do
    let_it_be(:project) { create(:project) }
    let_it_be(:phase) { create(:idea_feed_phase, project:) }
    let_it_be(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

    it 'enqueues classification jobs for all published ideas in the phase' do
      create_list(:idea, 3, project:, phases: [phase], input_topics: [])
      create(:idea)

      expect do
        service.classify_all_inputs_in_background!
      end.to have_enqueued_job(IdeaFeed::TopicClassificationJob).exactly(3).times
    end
  end

  describe '#classify_parallel_batch' do
    let_it_be(:project) { create(:project) }
    let_it_be(:phase) { create(:idea_feed_phase, project:) }
    let_it_be(:topics) do
      [
        create(:input_topic, title_multiloc: { 'en' => 'Transportation' }, description_multiloc: { 'en' => 'Ideas about transportation' }, project:),
        create(:input_topic, title_multiloc: { 'en' => 'Housing' }, description_multiloc: { 'en' => 'Ideas about housing' }, project:),
        create(:input_topic, title_multiloc: { 'en' => 'Education' }, description_multiloc: { 'en' => 'Ideas about education' }, project:)
      ]
    end
    let_it_be(:subtopics) do
      [
        create(:input_topic, title_multiloc: { 'en' => 'Sidewalks' }, description_multiloc: { 'en' => 'Ideas about sidewalks' }, parent: topics[0], project:),
        create(:input_topic, title_multiloc: { 'en' => 'Public transport' }, description_multiloc: { 'en' => 'Ideas about public transport' }, parent: topics[0], project:)
      ]
    end
    let_it_be(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

    it 'classifies multiple ideas in parallel and returns a hash of results' do
      idea1 = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Bike lanes' }, body_multiloc: { 'en' => 'We need more bike lanes.' }, input_topics: [])
      idea2 = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Affordable housing' }, body_multiloc: { 'en' => 'Housing is too expensive.' }, input_topics: [])
      idea3 = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Better schools' }, body_multiloc: { 'en' => 'Schools need more funding.' }, input_topics: [])

      llm_instance = instance_double(Analysis::LLM::Gemini3Flash)
      expect(Analysis::LLM::Gemini3Flash).to receive(:new).and_return(llm_instance)
      expect(llm_instance).to receive(:chat).and_return(['1.1'], ['2'], ['3'])

      result = service.classify_parallel_batch([idea1, idea2, idea3], n_threads: 2)

      expect(result).to be_a(Hash)
      expect(result.keys).to contain_exactly(idea1, idea2, idea3)
      expect(idea1.reload.input_topics).to contain_exactly(subtopics[0])
      expect(idea2.reload.input_topics).to contain_exactly(topics[1])
      expect(idea3.reload.input_topics).to contain_exactly(topics[2])
    end

    it 'returns an empty hash for empty input' do
      result = service.classify_parallel_batch([])

      expect(result).to eq({})
    end

    it 'handles ActiveRecord::Relation input' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Bike lanes' }, body_multiloc: { 'en' => 'We need more bike lanes.' }, input_topics: [])

      llm_instance = instance_double(Analysis::LLM::Gemini3Flash)
      expect(Analysis::LLM::Gemini3Flash).to receive(:new).and_return(llm_instance)
      expect(llm_instance).to receive(:chat).and_return(['1'])

      result = service.classify_parallel_batch(Idea.where(id: idea.id))

      expect(result.keys).to contain_exactly(idea)
      expect(idea.reload.input_topics).to contain_exactly(topics[0])
    end

    it 'retries on invalid LLM responses' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Bike lanes' }, body_multiloc: { 'en' => 'We need more bike lanes.' }, input_topics: [])

      llm_instance = instance_double(Analysis::LLM::Gemini3Flash)
      expect(Analysis::LLM::Gemini3Flash).to receive(:new).and_return(llm_instance)
      expect(llm_instance).to receive(:chat).and_return(%w[invalid response], ['1'])

      service.classify_parallel_batch([idea])

      expect(idea.reload.input_topics).to contain_exactly(topics[0])
    end

    it 'assigns empty topics if all retries fail' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Bike lanes' }, body_multiloc: { 'en' => 'We need more bike lanes.' }, input_topics: [topics[0]])

      llm_instance = instance_double(Analysis::LLM::Gemini3Flash)
      expect(Analysis::LLM::Gemini3Flash).to receive(:new).and_return(llm_instance)
      expect(llm_instance).to receive(:chat).and_return(%w[invalid response]).exactly(3).times

      service.classify_parallel_batch([idea])

      expect(idea.reload.input_topics).to be_empty
    end
  end
end
