# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::ImportProjectIdeasService do
  let(:project) { create(:continuous_project) }
  let(:service) { described_class.new project.id }

  describe 'import_ideas' do
    before { create(:idea_status, code: 'proposed') }

    it 'imports multiple ideas, with images, custom fields and authors' do
      # idea_rows = [
      #   {
      #     title_multiloc: { 'en' => 'My idea title' },
      #     body_multiloc: { 'en' => 'My idea description' },
      #     user_email: 'userimport1@citizenlab.co'
      #   },
      #   {
      #     title_multiloc: { 'en' => 'My idea title 2' },
      #     body_multiloc: { 'en' => 'My idea description 2' },
      #     user_email: nil
      #   },
      #   {
      #     title_multiloc: { 'en' => 'My idea title 3' },
      #     body_multiloc: { 'en' => 'My idea description 3' },
      #     user_email: 'userimport1@citizenlab.co'
      #   }
      # ]
      # service.import_ideas idea_rows
      #
      # expect(project.reload.ideas_count).to eq 3
    end

    it 'imports ideas in a phase' do
      # create(:user, email: 'userimport@citizenlab.co')
      # project = create(:project_with_phases, phases_count: 2, title_multiloc: { 'en' => 'Project title' })
      #
      # idea_rows = [
      #   {
      #     title_multiloc: { 'en' => 'My idea title' },
      #     body_multiloc: { 'en' => 'My idea description' },
      #     project_title: 'Project title',
      #     user_email: 'userimport@citizenlab.co',
      #     phase_rank: 2
      #   }
      # ]
      #
      # service.import_ideas idea_rows
      #
      # expect(Idea.count).to eq 1
      # idea = Idea.first
      # expect(idea.phase_ids).to eq [project.phases.order(:start_at).last.id]
    end

    it 'enqueues tenant dump job after importing ideas' do
      # idea_rows = [
      #   {
      #     title_multiloc: { 'en' => 'My idea title' },
      #     body_multiloc: { 'en' => 'My idea description' },
      #     project_title: create(:project).title_multiloc.values.first,
      #     user_email: create(:user).email,
      #     published_at: '18-07-2022'
      #   }
      # ]
      #
      # expect { service.import_ideas(idea_rows) }
      #   .to have_enqueued_job(DumpTenantJob).exactly(1).times
      #
      # expect(Idea.count).to eq 1
    end

    it 'does not accept invalid import data' do
      # create(:user, email: 'userimport@citizenlab.co')
      # create(:project, title_multiloc: { 'en' => 'Project title' })
      #
      # idea_rows = [
      #   {
      #     id: '1',
      #     title_multiloc: { 'en' => 'My idea title' },
      #     body_multiloc: { 'en' => 'My idea description' },
      #     project_title: 'Project title',
      #     user_email: 'userimport@citizenlab.co'
      #   },
      #   {
      #     id: '2',
      #     title_multiloc: { 'en' => 'My idea title' },
      #     body_multiloc: { 'en' => 'My idea description' },
      #     project_title: 'Non-existing project',
      #     user_email: 'userimport@citizenlab.co'
      #   }
      # ]
      # expect { service.import_ideas idea_rows }.to raise_error(
      #   an_instance_of(BulkImportIdeas::Error).and(having_attributes(key: 'bulk_import_ideas_project_not_found', params: { value: 'Non-existing project', row: '2' }))
      # )
      # expect(Idea.count).to eq 0
    end
  end

  describe 'xlsx_to_idea_rows' do
    it 'converts uploaded XLSX to more parseable format for the idea import method' do
      xlsx_array = [
        {
          'Title_nl-NL' => 'Mijn idee titel',
          'Title_fr-FR' => 'Mon idée titre',
          'Body_nl-NL' => 'Mijn idee inhoud',
          'Body_fr-FR' => 'Mon idée contenu',
          'Email' => 'moderator@citizenlab.co',
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
          'Project' => 'Project 2'
        }
      ]

      idea_rows = service.xlsx_to_idea_rows xlsx_array

      expect(idea_rows).to eq [
        {
          id: nil,
          title_multiloc: { 'nl-NL' => 'Mijn idee titel', 'fr-FR' => 'Mon idée titre' },
          body_multiloc: { 'nl-NL' => 'Mijn idee inhoud', 'fr-FR' => 'Mon idée contenu' },
          user_email: 'moderator@citizenlab.co',
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
          user_email: 'admin@citizenlab.co',
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

    it 'throws an error if imported locales do not match any on the tenant' do
      xlsx_array = [
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

      expect { service.xlsx_to_idea_rows xlsx_array }.to raise_error(
        an_instance_of(BulkImportIdeas::Error).and(having_attributes(key: 'bulk_import_ideas_locale_not_valid', params: { value: 'nl-BE' }))
      )
    end
  end

  describe 'generate_example_xlsx' do
    it 'produces an xlsx file with all the fields for a project' do
      xlsx = service.generate_example_xlsx
      # binding.pry
      # TODO: Test that phase only appears if timeline project
      # TODO: Test that all custom fields appear
    end
  end

  describe 'paper_forms_to_idea_rows' do
    it 'converts the output from GoogleFormParser into idea rows' do
      docs = [
        {
          'No' => { value: nil, type: 'unfilled_checkbox' },
          'Title:' => { value: "Free donuts for all", type: '' },
          'Name:' => { value: 'John Rambo', type: '' },
          'Email:' => { value: 'john_rambo@gravy.com', type: '' },
          'Yes' => { value: nil, type: 'filled_checkbox' },
          'Body:' => { value: 'Give them all donuts', type: '' }
        },
        {
          'Yes' => { value: '', type: 'filled_checkbox' },
          'No' => { value: '', type: 'unfilled_checkbox' },
          'Title:' => { value: 'New Wrestling Arena needed', type: '' },
          'Email:' => { value: 'ned@simpsons.com', type: '' },
          'Name:' => { value: 'Ned Flanders', type: '' },
          'Body:' => { value: "I'm convinced that if we do not get something we will struggle", type: '' }
        }
      ]
      rows = service.paper_docs_to_idea_rows docs

      expect(rows.count).to eq 2
      expect(rows[0][:title_multiloc]).to eq({ en: 'Free donuts for all' })
      expect(rows[0][:body_multiloc]).to eq({ en: 'Give them all donuts' })
      expect(rows[0][:user_email]).to eq 'john_rambo@gravy.com'
      expect(rows[0][:user_name]).to eq 'John Rambo'
      expect(rows[0][:project_id]).to eq project.id
    end
  end
end
