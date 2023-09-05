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
end
