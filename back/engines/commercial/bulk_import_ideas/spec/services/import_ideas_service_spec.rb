# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::ImportIdeasService do
  let(:service) { described_class.new(create(:admin)) }

  describe 'upload_file' do
    it 'uploads a file successfully' do
      base_64_content = Base64.encode64 File.read('/cl2_back/engines/commercial/bulk_import_ideas/spec/fixtures/testscan.pdf')
      service.upload_file "data:application/pdf;base64,#{base_64_content}", 'pdf'
      expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 1
      expect(BulkImportIdeas::IdeaImportFile.first.import_type).to eq 'pdf'
    end
  end

  describe 'import_ideas' do
    before { create(:idea_status, code: 'proposed') }

    it 'imports multiple ideas to existing authors' do
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

    it 'imports multiple ideas and creates new authors - with or without email addresses & names' do
      project1 = create(:project, title_multiloc: { 'fr-BE' => 'Projet un', 'en' => 'Project 1' })
      project2 = create(:project, title_multiloc: { 'nl-BE' => 'Project twee', 'en' => 'Project 2' })
      project3 = create(:project, title_multiloc: { 'fr-BE' => 'Projet trois', 'en' => 'Project 3' })

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project 1',
          user_email: 'userimport1@citizenlab.co',
          user_name: 'Gary Import'
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

    it 'imports multiple ideas using project IDs' do
      project = create(:project, title_multiloc: { 'fr-BE' => 'Projet un', 'en' => 'Project 1' })

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_id: project.id,
          user_email: 'userimport@citizenlab.co'
        },
        {
          title_multiloc: { 'en' => 'My idea title 2' },
          body_multiloc: { 'en' => 'My idea description 2' },
          project_id: project.id,
          user_email: 'userimport@citizenlab.co'
        }
      ]
      service.import_ideas idea_rows

      expect(project.reload.ideas_count).to eq 2
      idea1 = project.ideas.first
      expect(idea1.project_id).to eq project.id

      idea2 = project.ideas.last
      expect(idea2.project_id).to eq project.id
    end

    it 'imports multiple ideas with custom fields' do
      project = create(:project, title_multiloc: { 'fr-BE' => 'Projet un', 'en' => 'Project 1' })
      custom_form = create(:custom_form, :with_default_fields, participation_context: project)
      create(:custom_field, resource: custom_form, key: 'custom_text_field', title_multiloc: { 'en' => 'Custom text field:' }, enabled: true)

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          custom_field_values: { text_field: 'custom text field content' },
          project_id: project.id,
          user_email: 'userimport@citizenlab.co'
        },
        {
          title_multiloc: { 'en' => 'My idea title 2' },
          body_multiloc: { 'en' => 'My idea description 2' },
          custom_field_values: { text_field: 'custom text field content 2' },
          project_id: project.id,
          user_email: 'userimport@citizenlab.co'
        }
      ]
      service.import_ideas idea_rows

      expect(project.reload.ideas_count).to eq 2
      expect(project.reload.ideas.pluck(:custom_field_values)).to match_array(
        [{ 'text_field' => 'custom text field content' }, { 'text_field' => 'custom text field content 2' }]
      )
    end

    it 'imports ideas with idea import meta data' do
      project = create(:project)

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_id: project.id,
          pdf_pages: [1, 2],
          user_email: 'userimport@citizenlab.co'
        },
        {
          title_multiloc: { 'en' => 'My idea title 2' },
          body_multiloc: { 'en' => 'My idea description 2' },
          project_id: project.id,
          pdf_pages: [3, 4],
          user_email: 'userimport@citizenlab.co'
        }
      ]
      service.import_ideas idea_rows

      ideas = project.reload.ideas
      expect(project.reload.ideas_count).to eq 2
      expect(ideas[0].idea_import).not_to be_nil
      expect(ideas[0].idea_import.page_range).to eq %w[1 2]
      expect(ideas[1].idea_import).not_to be_nil
      expect(ideas[1].idea_import.page_range).to eq %w[3 4]
    end

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

    it 'imports ideas as draft with publication info' do
      create(:user, email: 'userimport@citizenlab.co')
      create(:project, title_multiloc: { 'en' => 'Project title' })

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project title',
          user_email: 'userimport@citizenlab.co'
        }
      ]

      service.import_ideas(idea_rows, import_as_draft: true)

      expect(Idea.count).to eq 1
      idea = Idea.first
      expect(idea.published_at).to be_nil
      expect(idea.publication_status).to eq 'draft'
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

    it 'ignores validation and can import blank ideas when importing as draft to a project' do
      project = create(:project)
      idea_rows = [
        {
          title_multiloc: { 'en' => '' },
          body_multiloc: { 'en' => '' },
          project_id: project.id
        },
        {
          project_id: project.id
        }
      ]
      service.import_ideas(idea_rows, import_as_draft: true)

      expect(project.reload.ideas.count).to eq 2
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

    it 'enqueues tenant dump job after importing ideas' do
      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: create(:project).title_multiloc.values.first,
          user_email: create(:user).email,
          published_at: '18-07-2022'
        }
      ]

      expect { service.import_ideas(idea_rows) }
        .to have_enqueued_job(DumpTenantJob).exactly(1).times

      expect(Idea.count).to eq 1
    end

    it 'does not accept invalid import data' do
      create(:user, email: 'userimport@citizenlab.co')
      create(:project, title_multiloc: { 'en' => 'Project title' })

      idea_rows = [
        {
          id: '1',
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project title',
          user_email: 'userimport@citizenlab.co'
        },
        {
          id: '2',
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Non-existing project',
          user_email: 'userimport@citizenlab.co'
        }
      ]
      expect { service.import_ideas idea_rows }.to raise_error(
        an_instance_of(BulkImportIdeas::Error).and(having_attributes(key: 'bulk_import_ideas_project_not_found', params: { value: 'Non-existing project', row: '2' }))
      )
      expect(Idea.count).to eq 0
    end

    it 'does not accept import data with invalid date format' do
      create(:user, email: 'userimport@citizenlab.co')
      create(:project, title_multiloc: { 'en' => 'Project title' })

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project title',
          user_email: 'userimport@citizenlab.co',
          published_at: '01/01/2021'
        }
      ]
      expect { service.import_ideas idea_rows }.to raise_error(
        an_instance_of(BulkImportIdeas::Error).and(having_attributes(key: 'bulk_import_ideas_publication_date_invalid_format', params: { value: '01/01/2021', row: nil }))
      )

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project title',
          user_email: 'userimport@citizenlab.co',
          published_at: '01-13-2021'
        }
      ]
      expect { service.import_ideas idea_rows }.to raise_error(
        an_instance_of(BulkImportIdeas::Error).and(having_attributes(key: 'bulk_import_ideas_publication_date_invalid_format', params: { value: '01-13-2021', row: nil }))
      )
    end

    context 'surveys' do
      it 'can import surveys' do
        project = create(:continuous_native_survey_project)
        create(:custom_form, participation_context: project)

        # TODO: It shouldn't require either title or body to be present
        idea_rows = [
          {
            title_multiloc: { 'en' => '' },
            body_multiloc: { 'en' => '' },
            project_id: project.id,
            user_email: 'surveyimport@citizenlab.co'
          }
        ]
        service.import_ideas idea_rows

        expect(Idea.count).to eq 1
        expect(User.count).to eq 2
      end

      # TODO: it 'can approve surveys' do
      # TODO: it 'can delete surveys' do
    end
  end


end
