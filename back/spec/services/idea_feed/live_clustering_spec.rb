# frozen_string_literal: true

require 'rails_helper'

describe IdeaFeed::LiveClusteringService do
  let(:service) { described_class.new(phase) }

  describe '#classify_topics!' do
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
    it 'classifies an unclassified idea into the correct topic' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Free bike sharing!' }, body_multiloc: { 'en' => 'I love biking around the city.' }, topics: [])

      expect_any_instance_of(Analysis::LLM::Gemini25Flash).to receive(:chat).and_return([1])
      service.classify_topics!(idea)

      expect(idea.topics).to contain_exactly(topics[0])
    end

    it 'erases previous topic associations when classifying' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Affordable housing for all' }, body_multiloc: { 'en' => 'We need more affordable housing.' }, topics: [topics[0]])

      expect_any_instance_of(Analysis::LLM::Gemini25Flash).to receive(:chat).and_return([2])
      service.classify_topics!(idea)

      expect(idea.topics).to contain_exactly(topics[1])
    end

    it 'assigns multiple topics if applicable' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Better schools and public transport' }, body_multiloc: { 'en' => 'We need to improve both education and transportation.' }, topics: [])

      expect_any_instance_of(Analysis::LLM::Gemini25Flash).to receive(:chat).and_return([1, 3])
      service.classify_topics!(idea)

      expect(idea.topics).to contain_exactly(topics[0], topics[2])
    end

    it 'removes all topics if no topic is relevant' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'More parks and green spaces' }, body_multiloc: { 'en' => 'We need more parks in the city.' }, topics: [topics[0]])

      expect_any_instance_of(Analysis::LLM::Gemini25Flash).to receive(:chat).and_return([])
      service.classify_topics!(idea)

      expect(idea.topics).to be_empty
    end

    it 'retries when the LLM response contains invalid topic IDs' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Improve public transport' }, body_multiloc: { 'en' => 'Public transport needs to be more efficient.' }, topics: [])

      llm_instance = instance_double(Analysis::LLM::Gemini25Flash)
      expect(Analysis::LLM::Gemini25Flash).to receive(:new).and_return(llm_instance)
      expect(llm_instance).to receive(:chat).and_return([99], [1])

      service.classify_topics!(idea)

      expect(idea.topics).to contain_exactly(topics[0])
    end

    it 'retries when the LLM response is not an in-bounds integer array' do
      idea = create(:idea, phases: [phase], title_multiloc: { 'en' => 'Improve public transport' }, body_multiloc: { 'en' => 'Public transport needs to be more efficient.' }, topics: [])

      llm_instance = instance_double(Analysis::LLM::Gemini25Flash)
      expect(Analysis::LLM::Gemini25Flash).to receive(:new).and_return(llm_instance)
      expect(llm_instance).to receive(:chat).and_return(%w[a b], [1])

      service.classify_topics!(idea)

      expect(idea.topics).to contain_exactly(topics[0])
    end
  end

  describe '#rebalance_topics!' do
    let_it_be(:project) { create(:project) }
    let_it_be(:phase) { create(:idea_feed_phase, project:) }
    let_it_be(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

    it 'contains the project description in the prompt when not using the ContentBuilder' do
      project.update!(description_multiloc: { 'en' => 'This is a test project about urban development.' })
      expect_any_instance_of(Analysis::LLM::Gemini25Pro).to receive(:chat) do |_, prompt|
        expect(prompt).to include('This is a test project about urban development.')
        []
      end
      service.rebalance_topics!
    end

    it 'contains the ContentBuilder project description in the prompt when available' do
      ContentBuilder::Layout.create!(content_buildable: project, code: 'project_description', enabled: true, craftjs_json:       {
        'ROOT' => {
          'type' => 'div',
          'nodes' => ['-02FjXHWIf'],
          'props' => { 'id' => 'e2e-content-builder-frame' },
          'custom' => {},
          'hidden' => false,
          'isCanvas' => true,
          'displayName' => 'div',
          'linkedNodes' => {}
        },
        '-02FjXHWIf' => {
          'type' => {
            'resolvedName' => 'TextMultiloc'
          },
          'nodes' => [],
          'props' => {
            'text' => {
              'en' => '<p>This is a ContentBuilder project description.</p>'
            }
          },
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.textMultiloc',
              'defaultMessage' => 'Text'
            }
          },
          'hidden' => false,
          'parent' => 'ROOT',
          'isCanvas' => false,
          'displayName' => 'TextMultiloc',
          'linkedNodes' => {}
        }
      })
      expect_any_instance_of(Analysis::LLM::Gemini25Pro).to receive(:chat) do |_, prompt|
        expect(prompt).to include('This is a ContentBuilder project description.')
        []
      end
      service.rebalance_topics!
    end

    it 'creates the returned topics if no topics exist yet' do
      create(:idea, project:, phases: [phase], title_multiloc: { 'en' => 'Finding parking is impossible' }, body_multiloc: { 'en' => "I'm getting tired of the impossible parking situation in the city center. Sometimes I have to drive around for half an hour to find a parking space near my house." })

      expect_any_instance_of(Analysis::LLM::Gemini25Pro).to receive(:chat).and_return([{ 'title_multiloc' => { 'en' => 'Parking', 'fr-FR' => 'Stationnement', 'nl-NL' => 'Parkeren' }, 'description_multiloc' => { 'en' => 'Contributions related to parking availability, regulations, and infrastructure for vehicles.', 'fr-FR' => 'Contributions relatives à la disponibilité du stationnement, à la réglementation et aux infrastructures pour les véhicules.', 'nl-NL' => 'Bijdragen met betrekking tot de beschikbaarheid van parkeerplaatsen, regelgeving en infrastructuur voor voertuigen.' } }])
      expect { service.rebalance_topics! }.to change(Topic, :count).from(0).to(1)
      expect(project.allowed_input_topics.count).to eq 1
    end
  end
end
