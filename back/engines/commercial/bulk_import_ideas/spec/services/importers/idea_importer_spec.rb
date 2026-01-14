# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Importers::IdeaImporter do
  let(:service) { described_class.new(create(:admin), 'en') }

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
      service.import idea_rows

      expect(project.ideas.count).to eq 2
      expect(project.reload.ideas_count).to eq 0

      ideas = project.ideas.order(:created_at)
      idea1 = ideas.first
      expect(idea1.project_id).to eq project.id
      idea2 = ideas.last
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
      service.import idea_rows

      expect(project.ideas.count).to eq 2
      expect(project.reload.ideas_count).to eq 0
      expect(project.reload.ideas.pluck(:custom_field_values)).to contain_exactly({ 'text_field' => 'custom text field content' }, { 'text_field' => 'custom text field content 2' })
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
      service.import idea_rows

      ideas = project.reload.ideas.order(:created_at)
      expect(project.ideas.count).to eq 2
      expect(project.reload.ideas_count).to eq 0
      expect(ideas[0].idea_import).not_to be_nil
      expect(ideas[0].idea_import.page_range).to eq %w[1 2]
      expect(ideas[0].idea_import.user_created).to be false
      expect(ideas[0].idea_import.user_consent).to be false
      expect(ideas[1].idea_import).not_to be_nil
      expect(ideas[1].idea_import.page_range).to eq %w[3 4]
      expect(ideas[1].idea_import.user_created).to be true
      expect(ideas[1].idea_import.user_consent).to be true
    end

    it 'adds the correct locale to the idea import meta data' do
      project = create(:project)
      idea_rows = [
        {
          title_multiloc: { 'fr-BE' => "Titre de l'idée" },
          body_multiloc: { 'fr-BE' => 'Description de mon idée' },
          project_id: project.id,
          pdf_pages: [1, 2],
          user_consent: false
        }
      ]
      service = described_class.new(create(:admin), 'fr-BE')
      service.import idea_rows
      ideas = project.reload.ideas
      expect(ideas[0].idea_import).not_to be_nil
      expect(ideas[0].idea_import.locale).to eq 'fr-BE'
    end

    it 'imports ideas as draft with publication info' do
      create(:user, email: 'userimport@citizenlab.co')
      project = create(:project, title_multiloc: { 'en' => 'Project title' })

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_id: project.id,
          user_email: 'userimport@citizenlab.co'
        }
      ]

      service.import idea_rows

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
      service.import idea_rows

      expect(project.reload.ideas.count).to eq 2
    end

    it 'does not accept import data with invalid date format' do
      create(:user, email: 'userimport@citizenlab.co')
      project = create(:project, title_multiloc: { 'en' => 'Project title' })

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_id: project.id,
          user_email: 'userimport@citizenlab.co',
          published_at: 'BAD DATE FORMAT'
        }
      ]
      expect { service.import idea_rows }.to raise_error(
        an_instance_of(BulkImportIdeas::Error).and(having_attributes(key: 'bulk_import_publication_date_invalid_format', params: { value: 'BAD DATE FORMAT', row: nil }))
      )

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_id: project.id,
          user_email: 'userimport@citizenlab.co',
          published_at: '30-30-2021'
        }
      ]
      expect { service.import idea_rows }.to raise_error(
        an_instance_of(BulkImportIdeas::Error).and(having_attributes(key: 'bulk_import_publication_date_invalid_format', params: { value: '30-30-2021', row: nil }))
      )
    end

    it 'adds a timestamp to published at and submitted at so that idea sorting is consistent' do
      allow(Time).to receive(:now).and_return(Time.new(2024, 12, 25, 11, 22, 33))
      project = create(:project, title_multiloc: { 'en' => 'Project title' })
      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          project_id: project.id,
          published_at: '01-11-2024',
          submitted_at: '01-11-2024'
        }
      ]
      service.import idea_rows
      expect(project.ideas.first.published_at.strftime('%F %T')).to eq '2024-11-01 11:22:33'
      expect(project.ideas.first.submitted_at.strftime('%F %T')).to eq '2024-11-01 11:22:33'
    end

    it 'does not import a user if there is a problem with saving a named user' do
      project = create(:project, title_multiloc: { 'en' => 'Project title' })
      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_id: project.id,
          user_consent: true,
          user_email: 'userimport@@citizenlab....co'
        }
      ]
      service.import idea_rows
      expect(project.ideas.first).not_to be_nil
      expect(project.ideas.first.author).to be_nil
      expect(User.count).to eq 1
    end

    it 'imports a user with no email if first name & consent are present' do
      project = create(:project)
      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_id: project.id,
          user_consent: true,
          user_first_name: 'Terry',
          user_last_name: 'McBerry'
        }
      ]
      service.import idea_rows

      author = project.reload.ideas.first.author
      expect(author).not_to be_nil
      expect(author.first_name).to eq 'Terry'
      expect(author.email).to be_nil
      expect(author.unique_code).not_to be_nil
    end

    context 'surveys' do
      it 'can import surveys' do
        project = create(:single_phase_native_survey_project)
        create(:custom_form, participation_context: project.phases.first)

        idea_rows = [
          {
            title_multiloc: {},
            body_multiloc: {},
            project_id: project.id,
            user_email: 'surveyimport@citizenlab.co'
          }
        ]
        service.import idea_rows

        expect(Idea.count).to eq 1
        expect(User.count).to eq 2
      end

      it 'can import surveys with embedded user custom fields but does not update user whilst in draft' do
        project = create(:single_phase_native_survey_project)
        custom_form = create(:custom_form, participation_context: project.phases.first)
        create(:custom_field_text, resource: custom_form, key: 'text_field')
        create(:custom_field_gender, :with_options)

        idea_rows = [
          {
            title_multiloc: {},
            body_multiloc: {},
            creation_phase_id: project.phases.first.id,
            project_id: project.id,
            custom_field_values: {
              text_field: 'Some text',
              u_gender: 'male'
            },
            user_email: 'surveyimport@citizenlab.co'
          }
        ]

        service.import idea_rows

        expect(Idea.count).to eq 1
        expect(User.count).to eq 2

        expect(Idea.first.publication_status).to eq 'draft'
        expect(Idea.first.custom_field_values).to eq({
          'text_field' => 'Some text',
          'u_gender' => 'male'
        })
        expect(User.order(:created_at).last.custom_field_values).to eq({})
      end
    end

    context 'proposals' do
      it 'can import proposals' do
        project = create(:single_phase_proposals_project)
        create(:custom_form, participation_context: project.phases.first)

        idea_rows = [
          {
            title_multiloc: { 'en' => 'My proposal' },
            body_multiloc: { 'en' => 'My proposal body' },
            project_id: project.id,
            user_email: 'proposalsimport@govocal.com'
          }
        ]
        expect { service.import idea_rows }.to change(Idea, :count).from(0).to(1)

        expect(User.count).to eq 2
      end
    end
  end
end
