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
          'Full name' => 'Bob Moderator',
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
          user_name: 'Bob Moderator',
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

    it 'imports ideas as published with publication info' do
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

    it 'imports ideas with location info' do
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

    it 'imports ideas in a phase' do
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

    it 'imports ideas with special date cells' do
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

    it 'imports ideas with topics' do
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

  end
end
