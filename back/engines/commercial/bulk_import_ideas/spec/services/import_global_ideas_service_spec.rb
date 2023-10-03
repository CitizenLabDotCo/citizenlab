# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::ImportGlobalIdeasService do
  let(:service) { described_class.new(create(:admin)) }

  describe 'xlsx_to_idea_rows' do
    it 'converts uploaded XLSX to more parseable format with permission to create user details' do
      xlsx_ideas_array = [
        {
          'Title_nl-NL' => 'Mijn idee titel',
          'Title_fr-FR' => 'Mon idée titre',
          'Body_nl-NL' => 'Mijn idee inhoud',
          'Body_fr-FR' => 'Mon idée contenu',
          'Email' => 'moderator@citizenlab.co',
          'First name' => 'Bob',
          'Last name' => 'Moderator',
          'Permission' => 'X',
          'Project' => 'Project 1',
          'Phase' => 2,
          'Date (dd-mm-yyyy)' => '18-07-2022',
          'Topics' => 'topic 1;topic 2 ; topic 3',
          'Latitude' => 50.5035,
          'Longitude' => 6.0944,
          'Location Description' => 'Panorama sur les Hautes Fagnes / Hohes Venn',
          'Image URL' => 'https://images.com/image.png'
        },
        {
          'ID' => 'c891c58b-a0d7-42f5-9262-9f3031d70a39',
          'Title_en' => 'My wonderful idea title',
          'Body_en' => 'My wonderful idea content',
          'Email' => 'admin@citizenlab.co',
          'Permission' => '',
          'Project' => 'Project 2'
        },
        {
          'ID' => 'd891c58b-a0d7-42f5-9262-9f3031d70a38',
          'Title_en' => 'A third title',
          'Body_en' => 'My wonderful third idea content',
          'Email' => 'newone@citizenlab.co',
          'Project' => 'Project 2'
        }
      ]

      idea_rows = service.ideas_to_idea_rows xlsx_ideas_array

      expect(idea_rows).to eq [
        {
          id: nil,
          title_multiloc: { 'nl-NL' => 'Mijn idee titel', 'fr-FR' => 'Mon idée titre' },
          body_multiloc: { 'nl-NL' => 'Mijn idee inhoud', 'fr-FR' => 'Mon idée contenu' },
          user_email: 'moderator@citizenlab.co',
          user_first_name: 'Bob',
          user_last_name: 'Moderator',
          user_consent: true,
          project_title: 'Project 1',
          phase_rank: 2,
          topic_titles: ['topic 1', 'topic 2', 'topic 3'],
          published_at: '18-07-2022',
          latitude: 50.5035,
          longitude: 6.0944,
          location_description: 'Panorama sur les Hautes Fagnes / Hohes Venn',
          image_url: 'https://images.com/image.png'
        },
        {
          id: 'c891c58b-a0d7-42f5-9262-9f3031d70a39',
          title_multiloc: { 'en' => 'My wonderful idea title' },
          body_multiloc: { 'en' => 'My wonderful idea content' },
          user_consent: false,
          project_title: 'Project 2',
          phase_rank: nil,
          topic_titles: [],
          published_at: nil,
          latitude: nil,
          longitude: nil,
          location_description: nil,
          image_url: nil
        },
        {
          id: 'd891c58b-a0d7-42f5-9262-9f3031d70a38',
          title_multiloc: { 'en' => 'A third title' },
          body_multiloc: { 'en' => 'My wonderful third idea content' },
          user_consent: false,
          project_title: 'Project 2',
          phase_rank: nil,
          topic_titles: [],
          published_at: nil,
          latitude: nil,
          longitude: nil,
          location_description: nil,
          image_url: nil
        }
      ]
    end

    it 'ignores completely blank rows' do
      xlsx_ideas_array = [
        {
          'Title_nl-NL' => '',
          'Title_fr-FR' => '',
          'Body_nl-NL' => '',
          'Body_fr-FR' => '',
          'Email' => '',
          'Project' => '',
          'Phase' => '',
          'Date (dd-mm-yyyy)' => '',
          'Topics' => '',
          'Location Description' => '',
          'Image URL' => ''
        }
      ]
      idea_rows = service.ideas_to_idea_rows xlsx_ideas_array
      expect(idea_rows.count).to eq 0
    end

    it 'throws an error if imported locales do not match any on the tenant' do
      xlsx_ideas_array = [
        {
          'Title_nl-BE' => 'Mijn idee titel',
          'Body_nl-BE' => 'Mijn idee inhoud',
          'Email' => 'moderator@citizenlab.co',
          'Project' => 'Project 1',
          'Phase' => 2,
          'Date (dd-mm-yyyy)' => '18-07-2022',
          'Topics' => 'topic 1;topic 2 ; topic 3',
          'Latitude' => 50.5035,
          'Longitude' => 6.0944,
          'Location Description' => 'Panorama sur les Hautes Fagnes / Hohes Venn',
          'Image URL' => 'https://images.com/image.png'
        }
      ]

      expect { service.ideas_to_idea_rows xlsx_ideas_array }.to raise_error(
        an_instance_of(BulkImportIdeas::Error).and(having_attributes(key: 'bulk_import_ideas_locale_not_valid', params: { value: 'nl-BE' }))
      )
    end
  end

  # Importing published ideas
  describe 'import_ideas' do
    before { create(:idea_status, code: 'proposed') }

    it 'imports multiple published ideas to existing authors' do
      project1 = create(:project, title_multiloc: { 'fr-BE' => 'Projet un', 'en' => 'Project 1' })
      project2 = create(:project, title_multiloc: { 'nl-BE' => 'Project twee', 'en' => 'Project 2' })
      create(:idea, project: project2)
      user1 = create(:user, email: 'userimport@citizenlab.co')
      user2 = create(:user, email: 'userimport2@citizenlab.co')

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
      expect(idea1.idea_import.user_created).to be false

      expect(project2.reload.ideas_count).to eq 2
      idea2 = user2.ideas.first
      expect(idea2.project_id).to eq project2.id
      expect(idea2.title_multiloc).to eq({ 'en' => 'My idea title 2' })
      expect(idea2.body_multiloc).to eq({ 'en' => 'My idea description 2' })
      expect(idea2.idea_import.user_created).to be false
    end

    it 'imports multiple published ideas and creates new authors - with or without email addresses & names' do
      project1 = create(:project, title_multiloc: { 'fr-BE' => 'Projet un', 'en' => 'Project 1' })
      project2 = create(:project, title_multiloc: { 'nl-BE' => 'Project twee', 'en' => 'Project 2' })
      project3 = create(:project, title_multiloc: { 'fr-BE' => 'Projet trois', 'en' => 'Project 3' })

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project 1',
          user_email: 'userimport1@citizenlab.co',
          user_first_name: 'Gary',
          user_last_name: 'Import'
        },
        {
          title_multiloc: { 'en' => 'My idea title 2' },
          body_multiloc: { 'en' => 'My idea description 2' },
          project_title: 'Project 2',
          user_email: nil
        },
        {
          title_multiloc: { 'en' => 'My idea title 3' },
          body_multiloc: { 'en' => 'My idea description 3' },
          project_title: 'Project 3',
          user_email: 'userimport1@citizenlab.co'
        }
      ]
      service.import_ideas idea_rows

      expect(project1.reload.ideas_count).to eq 1
      idea1 = project1.ideas.first
      expect(idea1.project_id).to eq project1.id
      expect(idea1.title_multiloc).to eq({ 'en' => 'My idea title' })
      expect(idea1.body_multiloc).to eq({ 'en' => 'My idea description' })
      expect(idea1.author[:email]).to eq 'userimport1@citizenlab.co'
      expect(idea1.author[:first_name]).to eq 'Gary'
      expect(idea1.author[:last_name]).to eq 'Import'
      expect(idea1.idea_import.user_created).to be true

      expect(project2.reload.ideas_count).to eq 1
      idea2 = project2.ideas.first
      expect(idea2.project_id).to eq project2.id
      expect(idea2.title_multiloc).to eq({ 'en' => 'My idea title 2' })
      expect(idea2.body_multiloc).to eq({ 'en' => 'My idea description 2' })
      expect(idea2.author.email).to be_nil
      expect(idea2.author.unique_code).not_to be_nil
      expect(idea2.idea_import.user_created).to be true

      expect(project3.reload.ideas_count).to eq 1
      idea3 = project3.ideas.first
      expect(idea3.project_id).to eq project3.id
      expect(idea3.title_multiloc).to eq({ 'en' => 'My idea title 3' })
      expect(idea3.body_multiloc).to eq({ 'en' => 'My idea description 3' })
      expect(idea3.author).to eq idea1.author
      expect(idea3.idea_import.user_created).to be false
    end

    it 'imports published ideas with publication info' do
      create(:user, email: 'userimport@citizenlab.co')
      create(:project, title_multiloc: { 'en' => 'Project title' })

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project title',
          user_email: 'userimport@citizenlab.co',
          published_at: '18-07-2022'
        }
      ]

      service.import_ideas idea_rows

      expect(Idea.count).to eq 1
      idea = Idea.first
      expect(idea.published_at).to eq Date.parse('2022-07-18')
      expect(idea.publication_status).to eq 'published'
    end

    it 'imports published ideas with location info' do
      create(:user, email: 'userimport@citizenlab.co')
      create(:project, title_multiloc: { 'en' => 'Project title' })

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

    it 'imports published ideas in a phase' do
      create(:user, email: 'userimport@citizenlab.co')
      project = create(:project_with_phases, phases_count: 2, title_multiloc: { 'en' => 'Project title' })

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

    it 'imports published ideas with special date cells' do
      create(:user, email: 'userimport@citizenlab.co')
      create(:project, title_multiloc: { 'en' => 'Project title' })

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project title',
          user_email: 'userimport@citizenlab.co',
          published_at: Time.zone.today
        }
      ]

      service.import_ideas idea_rows

      expect(Idea.count).to eq 1
      idea = Idea.first
      expect(idea.published_at).to eq Time.zone.today
      expect(idea.publication_status).to eq 'published'
    end

    it 'imports published ideas with topics' do
      create(:user, email: 'userimport@citizenlab.co')
      create(:project, title_multiloc: { 'en' => 'Project title' })
      create(:topic)
      topic1 = create(:topic, title_multiloc: { 'en' => 'Topic 1' })
      topic2 = create(:topic, title_multiloc: { 'nl-BE' => 'Project twee', 'en' => 'Topic 2' })

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

    it 'returns an error if title and body are blank when not importing as draft' do
      project = create(:project)
      idea_rows = [
        {
          title_multiloc: {},
          body_multiloc: {},
          project_id: project.id
        }
      ]
      expect { service.import_ideas idea_rows }.to raise_error(an_instance_of(BulkImportIdeas::Error))
    end

    # TODO: Cannot be enabled because mocking image URLs is not working.
    # it 'imports ideas with images' do
    #   # WebMock.disable_net_connect!
    #   # FakeWeb.register_uri(:get, 'https://images.com/image.png', body: 'Hello World!')

    #   create :user, email: 'userimport@citizenlab.co'
    #   create :project, title_multiloc: { 'en' => 'Project title' }

    #   idea_rows = [
    #     {
    #       title_multiloc: { 'en' => 'My idea title' },
    #       body_multiloc: { 'en' => 'My idea description' },
    #       project_title: 'Project title',
    #       user_email: 'userimport@citizenlab.co',
    #       image_url: 'https://images.com/image.png'
    #     }
    #   ]

    #   service.import_ideas idea_rows

    #   expect(Idea.count).to eq 1
    #   idea = Idea.first
    #   expect(idea.idea_images.count).to eq 1
    # end
  end
end
