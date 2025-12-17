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

    context 'when no topics exist yet' do
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

      it 'creates the returned topics' do
        create(:idea, project:, phases: [phase], title_multiloc: { 'en' => 'Finding parking is impossible' }, body_multiloc: { 'en' => "I'm getting tired of the impossible parking situation in the city center. Sometimes I have to drive around for half an hour to find a parking space near my house." })

        expect_any_instance_of(Analysis::LLM::Gemini25Pro).to receive(:chat).and_return([{ 'title_multiloc' => { 'en' => 'Parking', 'fr-FR' => 'Stationnement', 'nl-NL' => 'Parkeren' }, 'description_multiloc' => { 'en' => 'Contributions related to parking availability, regulations, and infrastructure for vehicles.', 'fr-FR' => 'Contributions relatives à la disponibilité du stationnement, à la réglementation et aux infrastructures pour les véhicules.', 'nl-NL' => 'Bijdragen met betrekking tot de beschikbaarheid van parkeerplaatsen, regelgeving en infrastructuur voor voertuigen.' } }])
        expect { service.rebalance_topics! }.to change(Topic, :count).from(0).to(1)
        expect(project.allowed_input_topics.count).to eq 1
      end
    end

    context 'when topics already exist' do
      let_it_be(:old_topics) do
        [
          create(:topic, title_multiloc: { 'en' => 'Parking areas' }, description_multiloc: { 'en' => 'Ideas about depositing your car' }),
          create(:topic, title_multiloc: { 'en' => 'Housing' }, description_multiloc: { 'en' => 'Ideas about housing' }),
          create(:topic, title_multiloc: { 'en' => 'Education' }, description_multiloc: { 'en' => 'Ideas about education' })
        ]
      end
      before do
        project.update!(allowed_input_topics: old_topics)
      end

      it 'updates changed topics, creates new topics, and removes obsolete topics' do
        create(:idea, project:, phases: [phase], title_multiloc: { 'en' => 'Finding parking is impossible' }, body_multiloc: { 'en' => "I'm getting tired of the impossible parking situation in the city center. Sometimes I have to drive around for half an hour to find a parking space near my house." })

        allow_any_instance_of(Analysis::LLM::Gemini25Pro).to receive(:chat).and_return([
          { 'title_multiloc' => { 'en' => 'Public Transportation' }, 'description_multiloc' => { 'en' => 'Ideas about public transportation systems and services' } },
          { 'title_multiloc' => { 'en' => 'Parking' }, 'description_multiloc' => { 'en' => 'Contributions related to parking availability, regulations, and infrastructure for vehicles.' } }
        ],
          { 'OLD-0' => { 'new_topic_id' => 'NEW-1', 'adjusted_topic_description_multiloc' => { 'en' => 'Contributions related to parking availability, regulations, and infrastructure for vehicles.', 'fr-FR' => 'Contributions relatives à la disponibilité du stationnement, à la réglementation et aux infrastructures pour les véhicules.', 'nl-NL' => 'Bijdragen met betrekking tot de beschikbaarheid van parkeerplaatsen, regelgeving en infrastructuur voor voertuigen.' }, 'adjusted_topic_title_multiloc' => { 'en' => 'Parking', 'fr-FR' => 'Stationnement', 'nl-NL' => 'Parkeren' } }, 'OLD-1' => { 'new_topic_id' => nil }, 'OLD-2' => { 'new_topic_id' => nil } })

        expect { service.rebalance_topics! }.to change(Topic, :count).from(3).to(4)
          .and change { project.allowed_input_topics.count }.from(3).to(2)
          .and change { old_topics[0].reload.title_multiloc['en'] }.from('Parking areas').to('Parking')
          .and change { old_topics[0].reload.description_multiloc['fr-FR'] }.from(nil).to('Contributions relatives à la disponibilité du stationnement, à la réglementation et aux infrastructures pour les véhicules.')
          .and have_enqueued_job(LogActivityJob).at_least(:once).with(kind_of(Topic), 'created', nil, anything)
          .and have_enqueued_job(LogActivityJob).at_least(:once).with(phase, 'topics_rebalanced', nil, anything, project_id: kind_of(String), payload: hash_including(
            update_log: [{ topic_id: old_topics[0].id, title_multiloc: { old: { 'en' => 'Parking areas' }, new: { 'en' => 'Parking', 'fr-FR' => 'Stationnement', 'nl-NL' => 'Parkeren' } }, description_multiloc: { old: { 'en' => 'Ideas about depositing your car' }, new: { 'en' => 'Contributions related to parking availability, regulations, and infrastructure for vehicles.', 'fr-FR' => 'Contributions relatives à la disponibilité du stationnement, à la réglementation et aux infrastructures pour les véhicules.', 'nl-NL' => 'Bijdragen met betrekking tot de beschikbaarheid van parkeerplaatsen, regelgeving en infrastructuur voor voertuigen.' } } }],
            input_count: 1,
            creation_log: [{ topic_id: kind_of(String), title_multiloc: { 'en' => 'Public Transportation' }, description_multiloc: { 'en' => 'Ideas about public transportation systems and services' } }],
            removal_log: [{ topic_id: old_topics[1].id }, { topic_id: old_topics[2].id }]
          ))
      end
    end
  end

  describe '#classify_all_inputs_in_background!' do
    let_it_be(:project) { create(:project) }
    let_it_be(:phase) { create(:idea_feed_phase, project:) }
    let_it_be(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

    it 'enqueues classification jobs for all published ideas in the phase' do
      create_list(:idea, 3, project:, phases: [phase], topics: [])
      create(:idea)

      expect do
        service.classify_all_inputs_in_background!
      end.to have_enqueued_job(IdeaFeed::IdeaTopicClassificationJob).exactly(3).times
    end
  end
end
