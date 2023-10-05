# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'BulkImportIdeasImportIdeas' do
  explanation 'Create many ideas at once by importing an XLSX sheet or a scanned PDF of multiple ideas.'

  before do
    create(:idea_status, code: 'proposed')
    header 'Content-Type', 'application/json'
  end

  let!(:project) { create(:continuous_project, title_multiloc: { en: 'Project 1' }) }

  context 'when not authorized' do
    get 'web_api/v1/import_ideas/example_xlsx' do
      example_request 'Get the example xlsx' do
        assert_status 401
      end
    end

    post 'web_api/v1/import_ideas/bulk_create_xlsx' do
      parameter(
        :xlsx,
        'Base64 encoded xlsx file with ideas details. See web_api/v1/import_ideas/example_xlsx for the format',
        scope: :import_ideas,
        required: true
      )

      let(:xlsx) { create_bulk_import_ideas_xlsx }

      example '[error] Bulk import ideas' do
        do_request
        assert_status 401
      end
    end
  end

  context 'when admin' do
    before { admin_header_token }

    context 'global import' do
      get 'web_api/v1/import_ideas/example_xlsx' do
        example_request 'Get the example xlsx' do
          assert_status 200
        end
      end

      post 'web_api/v1/import_ideas/bulk_create_xlsx' do
        parameter(
          :xlsx,
          'Base64 encoded xlsx file with ideas details. See web_api/v1/import_ideas/example_xlsx for the format',
          scope: :import_ideas,
          required: true
        )

        let(:xlsx) { create_bulk_import_ideas_xlsx }

        example 'Bulk import ideas globally' do
          do_request
          assert_status 201
          expect(response_data.count).to eq 2
          expect(Idea.count).to eq 2
          expect(Idea.all.pluck(:title_multiloc)).to match_array [{ 'en' => 'My idea title 1' }, { 'en' => 'My idea title 2' }]
          expect(User.count).to eq 2
          expect(User.all.pluck(:email)).to include 'dave@citizenlab.co'
          expect(User.all.pluck(:email)).not_to include 'bob@citizenlab.co'
          expect(BulkImportIdeas::IdeaImport.count).to eq 2
          expect(BulkImportIdeas::IdeaImportFile.count).to eq 1
          expect(project.reload.ideas_count).to eq 2
        end
      end
    end

    context 'project import' do
      parameter(:project_id, 'ID of the project to import these ideas to', required: true)

      let(:id) { project.id }

      get 'web_api/v1/projects/:id/import_ideas/example_xlsx' do
        example_request 'Get the example xlsx for a project' do
          assert_status 200
        end
      end

      post 'web_api/v1/projects/:id/import_ideas/bulk_create' do
        parameter(
          :xlsx,
          'Base64 encoded xlsx file with ideas details. See web_api/v1/projects/:id/import_ideas/example_xlsx for the format',
          scope: :import_ideas
        )
        parameter(
          :pdf,
          'Base64 encoded scanned PDF of ideas. Must be from the version of the form downloaded from the site.',
          scope: :import_ideas
        )
        parameter(:locale, 'Locale of the ideas being imported.', scope: :import_ideas)
        parameter(:phase_id, 'ID of the phase to import these ideas to', scope: :import_ideas)
        parameter(:personal_data, 'Has the uploaded form got the personal data section in it', scope: :import_ideas)

        context 'xlsx import' do
          let(:xlsx) { create_project_bulk_import_ideas_xlsx }

          example 'Bulk import ideas from .xlsx' do
            do_request

            assert_status 201
            expect(response_data.count).to eq 2
            expect(Idea.count).to eq 2
            expect(Idea.all.pluck(:title_multiloc)).to match_array [{ 'en' => 'My project idea title 1' }, { 'en' => 'My project idea title 2' }]
            expect(User.count).to eq 2
            expect(User.all.pluck(:email)).to include 'dave@citizenlab.co'
            expect(User.all.pluck(:email)).not_to include 'bob@citizenlab.co'
            expect(BulkImportIdeas::IdeaImport.count).to eq 2
            expect(BulkImportIdeas::IdeaImportFile.count).to eq 1
          end
        end

        context 'pdf import' do
          let(:locale) { 'en' }

          # NOTE: GoogleFormParserService is stubbed to avoid calls to google APIs
          context 'continuous projects with single page idea form with 1 page scanned' do
            let(:pdf) { create_project_bulk_import_ideas_pdf 1 }
            let(:personal_data) { 'true' }

            example 'Bulk import ideas to continuous project from .pdf' do
              expect_any_instance_of(BulkImportIdeas::GoogleFormParserService).to receive(:raw_text_page_array).and_return(create_project_bulk_import_raw_text_array)
              expect_any_instance_of(BulkImportIdeas::GoogleFormParserService).to receive(:parse_pdf).and_return(create_project_bulk_import_parse_pdf)
              do_request
              assert_status 201

              expect(response_data.count).to eq 1
              expect(response_data.first[:attributes][:title_multiloc][:en]).to eq 'My very good idea'
              expect(response_data.first[:attributes][:location_description]).to eq 'Somewhere'
              expect(response_data.first[:attributes][:publication_status]).to eq 'draft'
              expect(User.all.count).to eq 1 # No new users created
              expect(Idea.all.count).to eq 1
              expect(BulkImportIdeas::IdeaImport.count).to eq 1
              expect(BulkImportIdeas::IdeaImportFile.count).to eq 1
              expect(project.reload.ideas_count).to eq 0 # Draft ideas should not be counted

              # Relationships
              expect(response_data.first.dig(:relationships, :idea_import, :data)).not_to be_nil
              expect(json_response_body[:included].pluck(:type)).to include 'idea_import'
            end
          end

          context 'timeline projects' do
            let(:project) { create(:project_with_current_phase) }
            let(:current_phase) { TimelineService.new.current_phase(project) }

            let(:id) { project.id }

            context 'current phase with single page idea form with 1 page scanned' do
              let(:pdf) { create_project_bulk_import_ideas_pdf 1 }

              example 'Bulk import ideas to current phase from .pdf' do
                expect_any_instance_of(BulkImportIdeas::GoogleFormParserService).to receive(:raw_text_page_array).and_return(create_project_bulk_import_raw_text_array)
                expect_any_instance_of(BulkImportIdeas::GoogleFormParserService).to receive(:parse_pdf).and_return(create_project_bulk_import_parse_pdf)
                do_request
                assert_status 201
                expect(response_data.count).to eq 1
                expect(Idea.all.count).to eq 1
                expect(BulkImportIdeas::IdeaImport.all.count).to eq 1
                expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 1
                expect(Idea.all.first.phases.count).to eq 1
                expect(Idea.all.first.phases.first).to eq current_phase
              end
            end

            context 'specified phase with single page idea form with 1 page scanned' do
              let(:phase_id) { project.phases.first.id }
              let(:pdf) { create_project_bulk_import_ideas_pdf 1 }

              example 'Bulk import ideas to a specified phase from .pdf' do
                expect_any_instance_of(BulkImportIdeas::GoogleFormParserService).to receive(:raw_text_page_array).and_return(create_project_bulk_import_raw_text_array)
                expect_any_instance_of(BulkImportIdeas::GoogleFormParserService).to receive(:parse_pdf).and_return(create_project_bulk_import_parse_pdf)
                do_request
                assert_status 201
                expect(response_data.count).to eq 1
                expect(Idea.all.count).to eq 1
                expect(BulkImportIdeas::IdeaImport.all.count).to eq 1
                expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 1
                expect(Idea.all.first.phases.count).to eq 1
                expect(Idea.all.first.phases.first).to eq project.phases.first
                expect(Idea.all.first.phases.first).not_to eq current_phase
              end
            end
          end
        end
      end

      get 'web_api/v1/projects/:id/import_ideas/draft_ideas' do
        let!(:draft_ideas) do
          create_list(:idea, 5, project: project, publication_status: 'draft', custom_field_values: { not_visible: 'value' }).each do |idea|
            idea.update! idea_import: create(:idea_import, idea: idea)
          end
        end
        let!(:published_ideas) { create_list(:idea, 2, project: project) }

        example_request 'Get the imported draft ideas for a project' do
          assert_status 200
          expect(response_data.count).to eq 5

          # Should return only draft ideas and ignore published ideas
          expect(response_data.pluck(:id)).to match_array draft_ideas.pluck(:id)
          expect(response_data.pluck(:id)).not_to match_array published_ideas.pluck(:id)

          # Relationships
          expect(response_data.first.dig(:relationships, :idea_import, :data)).not_to be_nil
          expect(json_response_body[:included].pluck(:type)).to include 'idea_import'

          # Should return ALL custom_fields for draft even if not visible
          expect(response_data.first[:attributes].keys).to include :not_visible
        end
      end

      context 'phases' do
        let(:project) { create(:project_with_active_native_survey_phase) }
        let(:phase) { project.phases.first }

        get 'web_api/v1/phases/:id/import_ideas/draft_ideas' do
          let!(:draft_ideas) do
            create_list(:idea, 5, project: project, publication_status: 'draft').each do |idea|
              idea.update! idea_import: create(:idea_import, idea: idea)
            end
          end

          let(:id) { phase.id }

          before do
            draft_ideas[0].update! creation_phase: phase
            draft_ideas[1].update! creation_phase: phase
          end

          example_request 'Get the imported draft ideas (surveys) for a phase' do
            assert_status 200

            # Should return only the 2 draft ideas added to the phase
            expect(response_data.count).to eq 2
            expect(response_data.pluck(:id)).to match_array [draft_ideas[0][:id], draft_ideas[1][:id]]

            # Relationships
            expect(response_data.first.dig(:relationships, :idea_import, :data)).not_to be_nil
            expect(json_response_body[:included].pluck(:type)).to include 'idea_import'
          end
        end

        get 'web_api/v1/phases/:id/import_ideas/example_xlsx' do
          let(:id) { phase.id }

          example_request 'Get the example xlsx for a survey phase' do
            assert_status 200
          end
        end
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
          project = create(:continuous_project)
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

    context 'global import' do
      post 'web_api/v1/import_ideas/bulk_create_xlsx' do
        parameter(
          :xlsx,
          'Base64 encoded xlsx file with ideas details. See web_api/v1/import_ideas/example_xlsx for the format',
          scope: :import_ideas,
          required: true
        )

        let(:xlsx) { create_bulk_import_ideas_xlsx }

        example 'Bulk import ideas returns unauthorized' do
          do_request
          assert_status 401
        end
      end
    end

    context 'project import' do
      context 'project can be moderated' do
        let(:id) { project.id }

        post 'web_api/v1/projects/:id/import_ideas/bulk_create' do
          parameter(
            :xlsx,
            'Base64 encoded xlsx file with ideas details. See web_api/v1/projects/:id/import_ideas/example_xlsx for the format',
            scope: :import_ideas
          )

          let(:xlsx) { create_project_bulk_import_ideas_xlsx }

          example_request 'Bulk import ideas is authorized' do
            assert_status 201
          end
        end

        get 'web_api/v1/projects/:id/import_ideas/example_xlsx' do
          example_request 'Getting example xlsx is authorized' do
            assert_status 200
          end
        end

        get 'web_api/v1/projects/:id/import_ideas/draft_ideas' do
          example_request 'Getting draft ideas is authorized' do
            assert_status 200
          end
        end

        context 'phases' do
          let(:timeline_project) { create(:project_with_active_native_survey_phase) }
          let(:phase) { timeline_project.phases.first }
          let(:id) { phase.id }

          before { header_token_for create(:project_moderator, projects: [timeline_project]) }

          get 'web_api/v1/phases/:id/import_ideas/example_xlsx' do
            example_request 'Getting example xlsx is authorized' do
              assert_status 200
            end
          end

          get 'web_api/v1/phases/:id/import_ideas/draft_ideas' do
            example_request 'Getting draft ideas is authorized' do
              assert_status 200
            end
          end
        end

        get 'web_api/v1/idea_imports/:id' do
          let(:id) { create(:idea_import, idea: create(:idea, project: project)).id }

          example_request 'Getting idea import metadata is authorized' do
            assert_status 200
          end
        end
      end

      context 'project can NOT be moderated' do
        let(:unauthorized_project) { create(:project) }
        let(:id) { unauthorized_project.id }

        post 'web_api/v1/projects/:id/import_ideas/bulk_create' do
          parameter(
            :xlsx,
            'Base64 encoded xlsx file with ideas details. See web_api/v1/projects/:id/import_ideas/example_xlsx for the format',
            scope: :import_ideas
          )

          let(:xlsx) { create_project_bulk_import_ideas_xlsx }

          example 'Bulk import ideas is NOT authorized' do
            do_request
            assert_status 401
          end

          get 'web_api/v1/projects/:id/import_ideas/example_xlsx' do
            example_request 'Getting example xlsx is NOT authorized' do
              assert_status 401
            end
          end

          get 'web_api/v1/projects/:id/import_ideas/draft_ideas' do
            example_request 'Getting draft ideas is NOT authorized' do
              assert_status 401
            end
          end

          context 'phases' do
            let(:timeline_project) { create(:project_with_active_native_survey_phase) }
            let(:phase) { timeline_project.phases.first }
            let(:id) { phase.id }

            get 'web_api/v1/phases/:id/import_ideas/example_xlsx' do
              example_request 'Getting example xlsx is NOT authorized' do
                assert_status 401
              end
            end

            get 'web_api/v1/phases/:id/import_ideas/draft_ideas' do
              example_request 'Getting draft ideas is NOT authorized' do
                assert_status 401
              end
            end
          end

          get 'web_api/v1/idea_imports/:id' do
            let(:id) { create(:idea_import, idea: create(:idea, project: unauthorized_project)).id }

            example_request 'Getting idea import metadata is NOT authorized' do
              assert_status 401
            end
          end
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
    ["Title\n" \
     "This is really a great title\n" \
     "Description\n" \
     "And this is the body\n" \
     "Location (optional)\n" \
     "Somewhere\n" \
     "Page 1\n"]
  end

  def create_project_bulk_import_parse_pdf
    [{
      form_pages: [1],
      pdf_pages: [1],
      fields: {
        'Title' => 'My very good idea',
        'Description' => 'And this is the very good body'
      }
    }]
  end
end
