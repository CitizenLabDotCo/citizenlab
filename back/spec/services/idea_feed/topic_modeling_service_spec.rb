# frozen_string_literal: true

require 'rails_helper'

describe IdeaFeed::TopicModelingService do
  let(:service) { described_class.new(phase) }

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
      let(:old_topics) do
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

      it 'when the mapping maps multiple old topics to the same new topic, removes them both and creates the new topic' do
        create(:idea, project:, phases: [phase], title_multiloc: { 'en' => 'Finding parking is impossible' }, body_multiloc: { 'en' => "I'm getting tired of the impossible parking situation in the city center. Sometimes I have to drive around for half an hour to find a parking space near my house." })

        allow_any_instance_of(Analysis::LLM::Gemini25Pro).to receive(:chat).and_return([
          { 'title_multiloc' => { 'en' => 'Public Transportation' }, 'description_multiloc' => { 'en' => 'Ideas about public transportation systems and services' } },
          { 'title_multiloc' => { 'en' => 'Parking' }, 'description_multiloc' => { 'en' => 'Contributions related to parking availability, regulations, and infrastructure for vehicles.' } }
        ],
          { 'OLD-0' => { 'new_topic_id' => 'NEW-1', 'adjusted_topic_description_multiloc' => { 'en' => 'Contributions related to parking availability, regulations, and infrastructure for vehicles.', 'fr-FR' => 'Contributions relatives à la disponibilité du stationnement, à la réglementation et aux infrastructures pour les véhicules.', 'nl-NL' => 'Bijdragen met betrekking tot de beschikbaarheid van parkeerplaatsen, regelgeving en infrastructuur voor voertuigen.' }, 'adjusted_topic_title_multiloc' => { 'en' => 'Parking', 'fr-FR' => 'Stationnement', 'nl-NL' => 'Parkeren' } },
            'OLD-1' => { 'new_topic_id' => 'NEW-1' },
            'OLD-2' => { 'new_topic_id' => nil } })

        expect { service.rebalance_topics! }.to change(Topic, :count).from(3).to(5)
          .and have_enqueued_job(LogActivityJob).twice.with(kind_of(Topic), 'created', nil, anything)
          .and have_enqueued_job(LogActivityJob).at_least(:once).with(phase, 'topics_rebalanced', nil, anything, project_id: kind_of(String), payload: hash_including(
            update_log: [],
            input_count: 1,
            creation_log: [
              { topic_id: kind_of(String), title_multiloc: { 'en' => 'Public Transportation' }, description_multiloc: { 'en' => 'Ideas about public transportation systems and services' } },
              { topic_id: kind_of(String), title_multiloc: { 'en' => 'Parking' }, description_multiloc: { 'en' => 'Contributions related to parking availability, regulations, and infrastructure for vehicles.' } }
            ],
            removal_log: [{ topic_id: old_topics[0].id }, { topic_id: old_topics[1].id }, { topic_id: old_topics[2].id }]
          ))
      end
    end

    context 'simulating incremental application' do
      it 'loads an xlsx', skip: 'Too slow and API dependent for CI, only use manual testing' do
        raw_file = Rails.root.join('spec/fixtures/a1-tryout-ideas.xlsx')
        base_64_content = Base64.encode64(raw_file.read)
        admin = create(:admin)
        parser = BulkImportIdeas::Parsers::IdeaXlsxFileParser.new(
          admin,
          'en', phase.id, false
        )
        file = parser.send(:upload_source_file, "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{base_64_content}")
        parsed_rows = parser.parse_rows(file)
        parsed_rows.sort_by! { |row| row[:published_at] }
        from_date = parsed_rows.first[:published_at].to_date
        to_date = parsed_rows.last[:published_at].to_date
        puts "Importing ideas from #{from_date} to #{to_date}"

        activities = []
        parsed_rows
          .chunk_while { |a, b| a[:published_at].to_date.cweek == b[:published_at].to_date.cweek }
          .each do |rows_of_same_week|
            puts "Processing date #{rows_of_same_week.first[:published_at].to_date} to #{rows_of_same_week.last[:published_at].to_date}"

            puts "  - #{rows_of_same_week.size} ideas to import"
            rows_of_same_week.each do |row|
              create(:idea, project: phase.project, phases: [phase], title_multiloc: row[:title_multiloc], body_multiloc: row[:body_multiloc], created_at: row[:created_at], published_at: row[:published_at])
            end

            puts '  - Rebalancing topics'
            activity = service.rebalance_topics!
            activities << activity
          end
        # write out all activities to a file
        Rails.root.join('topic_rebalancing_activities.json').write(JSON.pretty_generate(activities.map(&:as_json)))
      end
    end
  end
end
