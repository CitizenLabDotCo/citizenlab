# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::ImportIdeasService do
  let(:service) { described_class.new }

  before do
    create :idea_status, code: 'proposed'
  end

  it 'imports multiple ideas' do
    project1 = create :project, title_multiloc: { 'fr-BE' => 'Projet un', 'en' => 'Project 1' }
    project2 = create :project, title_multiloc: { 'nl-BE' => 'Project twee', 'en' => 'Project 2' }
    create :idea, project: project2
    user1 = create :user, email: 'userimport@citizenlab.co'
    user2 = create :user, email: 'userimport2@citizenlab.co'

    idea_rows = [
      {
        title_multiloc: { 'en' => 'My idea title' },
        body_multiloc: { 'en' => 'My idea description' },
        project_title: 'Project 1',
        user_email: 'userimport@citizenlab.co'
      },
      {
        title_multiloc: { 'en' => 'My idea title 2' },
        body_multiloc: { 'en' => 'My idea description 2' },
        project_title: 'Project 2',
        user_email: 'userimport2@citizenlab.co'
      }
    ]
    service.import_ideas idea_rows

    expect(project1.reload.ideas_count).to eq 1
    idea1 = user1.ideas.first
    expect(idea1.project_id).to eq project1.id
    expect(idea1.title_multiloc).to eq({ 'en' => 'My idea title' })
    expect(idea1.body_multiloc).to eq({ 'en' => 'My idea description' })

    expect(project2.reload.ideas_count).to eq 2
    idea2 = user2.ideas.first
    expect(idea2.project_id).to eq project2.id
    expect(idea2.title_multiloc).to eq({ 'en' => 'My idea title 2' })
    expect(idea2.body_multiloc).to eq({ 'en' => 'My idea description 2' })
  end

  it 'imports ideas with publication info' do
    create :user, email: 'userimport@citizenlab.co'
    create :project, title_multiloc: { 'en' => 'Project title' }

    idea_rows = [
      {
        title_multiloc: { 'en' => 'My idea title' },
        body_multiloc: { 'en' => 'My idea description' },
        project_title: 'Project title',
        user_email: 'userimport@citizenlab.co',
        published_at: '2022-07-18'
      }
    ]

    service.import_ideas idea_rows

    expect(Idea.count).to eq 1
    idea = Idea.first
    expect(idea.published_at).to eq Date.parse('2022-07-18')
    expect(idea.publication_status).to eq 'published'
  end

  it 'imports ideas with location info' do
    create :user, email: 'userimport@citizenlab.co'
    create :project, title_multiloc: { 'en' => 'Project title' }

    idea_rows = [
      {
        title_multiloc: { 'en' => 'My idea title' },
        body_multiloc: { 'en' => 'My idea description' },
        project_title: 'Project title',
        user_email: 'userimport@citizenlab.co',
        latitude: 50.5035,
        longitude: 6.0944,
        location_description: 'Panorama sur les Hautes Fagnes / Hohes Venn'
      }
    ]

    service.import_ideas idea_rows

    expect(Idea.count).to eq 1
    idea = Idea.first
    expect(RGeo::GeoJSON.encode(idea.location_point)&.dig('coordinates', 1)).to eq 50.5035
    expect(RGeo::GeoJSON.encode(idea.location_point)&.dig('coordinates', 0)).to eq 6.0944
    expect(idea.location_description).to eq 'Panorama sur les Hautes Fagnes / Hohes Venn'
  end

  it 'imports ideas in a phase' do
    create :user, email: 'userimport@citizenlab.co'
    project = create :project_with_phases, phases_count: 2, title_multiloc: { 'en' => 'Project title' }

    idea_rows = [
      {
        title_multiloc: { 'en' => 'My idea title' },
        body_multiloc: { 'en' => 'My idea description' },
        project_title: 'Project title',
        user_email: 'userimport@citizenlab.co',
        phase_rank: 2
      }
    ]

    service.import_ideas idea_rows

    expect(Idea.count).to eq 1
    idea = Idea.first
    expect(idea.phase_ids).to eq [project.phases.order(:start_at).last.id]
  end

  it 'imports ideas with topics' do
    create :user, email: 'userimport@citizenlab.co'
    create :project, title_multiloc: { 'en' => 'Project title' }
    create :topic
    topic1 = create :topic, title_multiloc: { 'en' => 'Topic 1' }
    topic2 = create :topic, title_multiloc: { 'nl-BE' => 'Project twee', 'en' => 'Topic 2' }

    idea_rows = [
      {
        title_multiloc: { 'en' => 'My idea title' },
        body_multiloc: { 'en' => 'My idea description' },
        project_title: 'Project title',
        user_email: 'userimport@citizenlab.co',
        topic_titles: ['Topic 1', 'Topic 2']
      }
    ]

    service.import_ideas idea_rows

    expect(Idea.count).to eq 1
    idea = Idea.first
    expect(idea.topic_ids).to match_array [topic1.id, topic2.id]
  end

  it 'imports ideas with images', pending: true do
    WebMock.disable_net_connect!
    stub_request(:get, 'https://images.com/image.png')
      .to_return(body: 'abc')

    create :user, email: 'userimport@citizenlab.co'
    create :project, title_multiloc: { 'en' => 'Project title' }

    idea_rows = [
      {
        title_multiloc: { 'en' => 'My idea title' },
        body_multiloc: { 'en' => 'My idea description' },
        project_title: 'Project title',
        user_email: 'userimport@citizenlab.co',
        image_url: 'https://images.com/image.png'
      }
    ]

    service.import_ideas idea_rows

    expect(Idea.count).to eq 1
    idea = Idea.first
    expect(idea.idea_images.count).to eq 1
  end

  it 'does not accept invalid import data' do
    create :user, email: 'userimport@citizenlab.co'
    create :project, title_multiloc: { 'en' => 'Project title' }

    idea_rows = [
      {
        title_multiloc: { 'en' => 'My idea title' },
        body_multiloc: { 'en' => 'My idea description' },
        project_title: 'Project title',
        user_email: 'userimport@citizenlab.co'
      },
      {
        title_multiloc: { 'en' => 'My idea title' },
        body_multiloc: { 'en' => 'My idea description' },
        project_title: 'Non-existing project',
        user_email: 'userimport@citizenlab.co'
      }
    ]
    expect { service.import_ideas idea_rows }.to raise_error BulkImportIdeas::Error
    expect(Idea.count).to eq 0
  end
end
