# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::ImportIdeasService do
  let(:service) { described_class.new(create(:admin)) }

  describe 'upload_file' do
    it 'uploads a file successfully' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_1.pdf').read
      service.create_files "data:application/pdf;base64,#{base_64_content}"
      expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 1
      expect(BulkImportIdeas::IdeaImportFile.first.import_type).to eq 'pdf'
    end

    it 'detects the file type if an xlsx file is uploaded' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/import.xlsx').read
      service.create_files "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{base_64_content}"
      expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 1
      expect(BulkImportIdeas::IdeaImportFile.first.import_type).to eq 'xlsx'
    end
  end

  describe 'import_ideas' do
    before { create(:idea_status, code: 'proposed') }

    it 'imports multiple draft ideas using project IDs' do
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

      expect(project.ideas.count).to eq 2
      expect(project.reload.ideas_count).to eq 0
      idea1 = project.ideas.first
      expect(idea1.project_id).to eq project.id

      idea2 = project.ideas.last
      expect(idea2.project_id).to eq project.id
    end

    it 'imports multiple draft ideas with custom fields' do
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

      expect(project.ideas.count).to eq 2
      expect(project.reload.ideas_count).to eq 0
      expect(project.reload.ideas.pluck(:custom_field_values)).to match_array(
        [{ 'text_field' => 'custom text field content' }, { 'text_field' => 'custom text field content 2' }]
      )
    end

    it 'imports draft ideas with idea import meta data' do
      project = create(:project)

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_id: project.id,
          pdf_pages: [1, 2],
          user_consent: false
        },
        {
          title_multiloc: { 'en' => 'My idea title 2' },
          body_multiloc: { 'en' => 'My idea description 2' },
          project_id: project.id,
          pdf_pages: [3, 4],
          user_email: 'userimport@citizenlab.co',
          user_consent: true
        }
      ]
      service.import_ideas idea_rows

      ideas = project.reload.ideas
      expect(project.ideas.count).to eq 2
      expect(project.reload.ideas_count).to eq 0
      expect(ideas[0].idea_import).not_to be_nil
      expect(ideas[0].idea_import.page_range).to eq %w[1 2]
      expect(ideas[0].idea_import.user_created).to be true
      expect(ideas[0].idea_import.user_consent).to be false
      expect(ideas[1].idea_import).not_to be_nil
      expect(ideas[1].idea_import.page_range).to eq %w[3 4]
      expect(ideas[1].idea_import.user_created).to be true
      expect(ideas[1].idea_import.user_consent).to be true
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

      service.import_ideas idea_rows

      expect(Idea.count).to eq 1
      idea = Idea.first
      expect(idea.published_at).to be_nil
      expect(idea.publication_status).to eq 'draft'
    end

    it 'ignores validation and can import blank ideas when importing as draft to a project' do
      project = create(:project)
      idea_rows = [
        {
          title_multiloc: {},
          body_multiloc: {},
          project_id: project.id
        },
        {
          project_id: project.id
        }
      ]
      service.import_ideas idea_rows

      expect(project.reload.ideas.count).to eq 2
    end

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

    it 'imports an anonymous user if there is a problem with saving a named user' do
      project = create(:project, title_multiloc: { 'en' => 'Project title' })
      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_id: project.id,
          user_email: 'userimport@@citizenlab....co'
        }
      ]
      service.import_ideas idea_rows
      expect(project.ideas.first).not_to be_nil
      expect(project.ideas.first.author.email).to be_nil
      expect(project.ideas.first.author.unique_code).not_to be_nil
    end

    context 'surveys' do
      it 'can import surveys with' do
        project = create(:continuous_native_survey_project)
        create(:custom_form, participation_context: project)

        idea_rows = [
          {
            title_multiloc: {},
            body_multiloc: {},
            project_id: project.id,
            user_email: 'surveyimport@citizenlab.co'
          }
        ]
        service.import_ideas idea_rows

        expect(Idea.count).to eq 1
        expect(User.count).to eq 2
      end
    end
  end
end
