# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'BulkImportIdeasImportIdeas' do
  explanation 'Create many ideas at once by importing an XLSX sheet or a scanned PDF of multiple ideas.'

  before do
    create(:idea_status, code: 'proposed')
    header 'Content-Type', 'application/json'
  end

  let!(:project) { create(:single_phase_ideation_project, title_multiloc: { en: 'Project 1' }) }
  let!(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

  context 'when not authorized' do
    let(:phase_id) { project.phases.first.id }

    post 'web_api/v1/phases/:phase_id/importer/bulk_create_async/idea/xlsx' do
      parameter(
        :file,
        'Base64 encoded xlsx or PDF file using the template downloaded from the phase.',
        scope: :import,
        required: true
      )

      let(:file) { create_bulk_import_ideas_xlsx }

      example '[error] Bulk import ideas' do
        do_request
        assert_status 401
      end
    end
  end

  context 'when admin' do
    before do
      admin_header_token
    end

    parameter(:phase_id, 'ID of the phase to import these ideas to', required: true)

    let(:phase_id) { project.phases.first.id }

    context 'Imports' do
      parameter(
        :file,
        'Base64 encoded xlsx or PDF file using the template downloaded from the phase.',
        scope: :import
      )
      parameter(:locale, 'Locale of the inputs being imported.', scope: :import)
      parameter(:personal_data, 'Has the uploaded form got the personal data section in it', scope: :import)

      let(:model) { 'idea' }
      let(:locale) { 'en' }

      post 'web_api/v1/phases/:phase_id/importer/bulk_create_async/:model/:format' do
        context 'xlsx import' do
          let(:format) { 'xlsx' }
          let(:file) { create_project_bulk_import_ideas_xlsx }

          example 'Bulk import ideas to phase from .xlsx via asynchronous jobs', :active_job_que_adapter do
            do_request
            assert_status 200

            expect(response_data).to be_a Array
            expect(response_data.first[:type]).to eq 'background_job'
            expect(response_data.first[:attributes]).to include(:active, :failed, :job_id)

            expect(Idea.all.count).to eq 0 # No ideas created yet
            expect(User.all.count).to eq 1 # No new users created
            expect(BulkImportIdeas::IdeaImport.all.count).to eq 0
            expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 2
            # If we used the normal test adapter instead of :active_job_que_adapter, we could test it like this
            # expect(BulkImportIdeas::IdeaImportJob).to have_been_enqueued
            expect(QueJob.by_args({ job_class: 'BulkImportIdeas::IdeaImportJob' }).count).to eq 1
          end
        end

        context 'pdf import' do
          let(:format) { 'pdf' }
          let(:file) { create_project_bulk_import_ideas_pdf 1 }

          # We use :active_job_que_adapter to properly check the response
          example 'Bulk import ideas to phase from .pdf via asynchronous jobs', :active_job_que_adapter do
            do_request
            assert_status 200

            expect(response_data).to be_a Array
            expect(response_data.first[:type]).to eq 'background_job'
            expect(response_data.first[:attributes]).to include(:active, :failed, :job_id)

            expect(Idea.all.count).to eq 0 # No ideas created yet
            expect(User.all.count).to eq 1 # No new users created
            expect(BulkImportIdeas::IdeaImport.all.count).to eq 0
            expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 2
            # If we used the normal test adapter instead of :active_job_que_adapter, we could test it like this
            # expect(BulkImportIdeas::IdeaImportJob).to have_been_enqueued
            expect(QueJob.by_args({ job_class: 'BulkImportIdeas::IdeaImportJob' }).count).to eq 1
          end
        end
      end
    end

    get 'web_api/v1/phases/:phase_id/importer/draft_records/idea' do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:phase) { project.phases.first }
      let!(:draft_ideas) do
        create_list(:idea, 5, project: project, publication_status: 'draft').each do |idea|
          idea.update! idea_import: create(:idea_import, idea: idea)
        end
      end

      let(:phase_id) { phase.id }

      example 'Get the imported draft ideas for a phase' do
        draft_ideas[0].update! creation_phase: phase, phases: [phase]
        draft_ideas[1].update! creation_phase: phase, phases: [phase]

        do_request
        assert_status 200

        # Should return only the 2 draft ideas added to the phase
        expect(response_data.count).to eq 2
        expect(response_data.pluck(:id)).to match_array [draft_ideas[0][:id], draft_ideas[1][:id]]

        # Relationships
        expect(response_data.first.dig(:relationships, :idea_import, :data)).not_to be_nil
        expect(json_response_body[:included].pluck(:type)).to include 'idea_import'
      end

      example 'Should only return draft ideas created via the importer' do
        draft_ideas[0].update! creation_phase: phase, phases: [phase]
        draft_ideas[1].update! creation_phase: phase, phases: [phase]
        draft_ideas[0].idea_import.destroy!

        do_request
        assert_status 200

        # Should return only the 1 draft idea on the phase with an idea_import
        expect(response_data.count).to eq 1
      end
    end

    patch 'web_api/v1/phases/:phase_id/importer/approve_all/idea' do
      let(:phase) { create(:phase) }
      let!(:draft_ideas) do
        create_list(:idea, 3, project: phase.project, phases: [phase], publication_status: 'draft').each do |idea|
          idea.update! idea_import: create(:idea_import, idea: idea)
        end
      end

      let(:phase_id) { phase.id }

      example 'Approves all the ideas for a phase' do
        expect(draft_ideas.map(&:publication_status)).to eq %w[draft draft draft]
        expect(draft_ideas.map { |idea| idea.idea_import.approved_at }).to all(be_nil)

        do_request
        assert_status 200
        expect(response_data).to eq({ type: 'approve_all', attributes: { approved: 3, not_approved: 0 } })
        expect(draft_ideas.map { |idea| idea.reload.publication_status }).to eq %w[published published published]
        expect(draft_ideas.map { |idea| idea.idea_import.approved_at }).to all(be_a(ActiveSupport::TimeWithZone))
      end

      example 'Does not approve any ideas that fail validation' do
        draft_ideas[0].update!(title_multiloc: { en: '' })

        do_request
        assert_status 200
        expect(response_data).to eq({ type: 'approve_all', attributes: { approved: 2, not_approved: 1 } })
        expect(draft_ideas.map { |idea| idea.reload.publication_status }).to eq %w[draft published published]
      end
    end

    context 'idea import metadata' do
      get 'web_api/v1/idea_imports/:id' do
        let(:id) do
          idea = create(:idea)
          create(:idea_import, idea: idea)
          idea.idea_import.id
        end

        example_request 'Get the import meta data for an idea' do
          assert_status 200
          expect(response_data[:type]).to eq 'idea_import'
          expect(response_data[:attributes].keys).to eq %i[user_created user_consent page_range locale created_at updated_at file import_type]
        end
      end

      get 'web_api/v1/idea_import_files/:id' do
        let(:id) do
          project = create(:single_phase_ideation_project)
          create(:idea_import_file, project: project).id
        end

        example_request 'Get an imported file' do
          assert_status 200
        end
      end
    end
  end

  context 'when moderator' do
    before { header_token_for create(:project_moderator, projects: [project]) }

    context 'project can be moderated' do
      let(:survey_project) { create(:project_with_active_native_survey_phase) }
      let(:phase) { survey_project.phases.first }
      let(:phase_id) { phase.id }

      before { header_token_for create(:project_moderator, projects: [survey_project]) }

      get 'web_api/v1/phases/:phase_id/importer/draft_records/idea' do
        example_request 'Getting draft ideas is authorized' do
          assert_status 200
        end
      end

      get 'web_api/v1/idea_imports/:id' do
        let(:id) { create(:idea_import, idea: create(:idea, project: survey_project)).id }

        example_request 'Getting idea import metadata is authorized' do
          assert_status 200
        end
      end
    end

    context 'project can NOT be moderated' do
      let(:survey_project) { create(:project_with_active_native_survey_phase) }
      let(:file) { create_project_bulk_import_ideas_xlsx }
      let(:phase_id) { phase.id }
      let(:other_project) { create(:project) }
      let(:phase) { survey_project.phases.first }

      parameter(
        :file,
        'Base64 encoded xlsx or PDF file using the template downloaded from the phase.',
        scope: :import
      )

      before { header_token_for create(:project_moderator, projects: [other_project]) }

      get 'web_api/v1/phases/:phase_id/importer/draft_records/idea' do
        example_request 'Getting draft ideas is NOT authorized' do
          assert_status 401
        end
      end

      get 'web_api/v1/idea_imports/:id' do
        let(:id) { create(:idea_import, idea: create(:idea, project: survey_project)).id }

        example_request 'Getting idea import metadata is NOT authorized' do
          assert_status 401
        end
      end
    end
  end

  def create_bulk_import_ideas_xlsx
    hash_array = [
      {
        'Title_en' => 'My idea title 1',
        'Body_en' => 'My idea content',
        'Email' => 'dave@citizenlab.co',
        'Permission' => 'X',
        'Project' => 'Project 1'
      },
      {
        'Title_en' => 'My idea title 2',
        'Body_en' => 'My idea content',
        'Email' => 'bob@citizenlab.co',
        'Permission' => '',
        'Project' => 'Project 1'
      }
    ]
    xlsx_stringio = XlsxService.new.hash_array_to_xlsx hash_array
    base_64_content = Base64.encode64 xlsx_stringio.read
    "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{base_64_content}"
  end

  def create_project_bulk_import_ideas_xlsx
    hash_array = [
      {
        'Title' => 'My project idea title 1',
        'Body' => 'My idea content',
        'Email address' => 'dave@citizenlab.co',
        'Permission' => 'X'
      },
      {
        'Title' => 'My project idea title 2',
        'Body' => 'My idea content',
        'Email address' => 'bob@citizenlab.co',
        'Permission' => ''
      }
    ]
    xlsx_stringio = XlsxService.new.hash_array_to_xlsx hash_array
    base_64_content = Base64.encode64 xlsx_stringio.read
    "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{base_64_content}"
  end

  def create_project_bulk_import_ideas_pdf(num_pages)
    # Open 1 page scan
    base_64_content = Base64.encode64 Rails.root.join("engines/commercial/bulk_import_ideas/spec/fixtures/scan_#{num_pages}.pdf").read
    "data:application/pdf;base64,#{base_64_content}"
  end

  def create_project_bulk_import_raw_text_array
    ["
      Title
      This is really a great title
      Description
      And this is the body
      Location (optional)
      Somewhere
      Page 1
    "]
  end

  def create_project_bulk_import_parse_pdf
    {
      pdf_pages: [1],
      fields: {
        'Title' => 'My very good idea',
        'Description' => 'And this is the very good body'
      }
    }
  end

  def stub_external_api
    allow_any_instance_of(Analysis::LLM::GPT41).to receive(:chat).and_return('[{}]')

    expect_any_instance_of(BulkImportIdeas::Parsers::Pdf::IdeaGoogleFormParserService).to receive(:raw_text_page_array).and_return(create_project_bulk_import_raw_text_array)
    expect_any_instance_of(BulkImportIdeas::Parsers::Pdf::IdeaGoogleFormParserService).to receive(:parse_pdf).and_return(create_project_bulk_import_parse_pdf)
  end
end
