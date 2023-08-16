# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'BulkImportIdeasImportIdeas' do
  explanation 'Create many ideas at once by importing an XLSX sheet or a scanned PDF of multiple ideas.'

  before do
    create(:idea_status, code: 'proposed')
    header 'Content-Type', 'application/json'
  end

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
        expect_any_instance_of(BulkImportIdeas::ImportIdeasService).not_to receive :import_ideas
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

        example 'Bulk import ideas' do
          expect_any_instance_of(BulkImportIdeas::ImportIdeasService).to receive :import_ideas
          do_request
          assert_status 201
        end
      end
    end

    context 'project import' do
      parameter(:project_id, 'ID of the project to import these ideas to', required: true)

      let(:project) { create(:project) }
      let(:id) { project.id }

      get 'web_api/v1/projects/:id/import_ideas/example_xlsx' do
        example_request 'Get the example xlsx for a project' do
          assert_status 200
        end
      end

      get 'web_api/v1/projects/:id/import_ideas/draft_ideas' do
        let!(:draft_ideas) do
          create_list(:idea, 5, project: project, publication_status: 'draft').each do |idea|
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
        end
      end

      post 'web_api/v1/projects/:id/import_ideas/bulk_create' do
        parameter(
          :xlsx,
          'Base64 encoded xlsx file with ideas details. See web_api/v1/import_ideas/example_xlsx for the format',
          scope: :import_ideas
        )
        parameter(
          :pdf,
          'Base64 encoded scanned PDF of ideas. Must be from the version of the form downloaded from the site.',
          scope: :import_ideas
        )
        parameter(:locale, 'Locale of the ideas being imported.', scope: :import_ideas)

        context 'xlsx import' do
          let(:xlsx) { create_bulk_import_ideas_xlsx }

          example 'Bulk import ideas from .xlsx' do
            expect_any_instance_of(BulkImportIdeas::ImportIdeasService).to receive :import_ideas
            do_request
            assert_status 201
          end
        end

        context 'pdf import' do
          let(:pdf) { create_project_bulk_import_ideas_pdf }
          let(:locale) { 'en' }

          example 'Bulk import ideas from scanned .pdf' do
            # Stubbed to avoid call to google webservice
            expect_any_instance_of(BulkImportIdeas::GoogleFormParserService).to receive(:parse_pdf).and_return(
              [
                [
                  { name: 'Name', value: 'Bob Test', type: '', page: 1, x: 0.09, y: 1.16 },
                  { name: 'Email', value: 'bob@test.com', type: '', page: 1, x: 0.09, y: 1.24 },
                  { name: 'Title', value: 'This is really a great title', type: '', page: 1, x: 0.09, y: 1.34 },
                  { name: 'Body', value: 'And this is the body', type: '', page: 1, x: 0.09, y: 1.41 },
                  { name: 'Yes', value: nil, type: 'filled_checkbox', page: 1, x: 0.11, y: 1.66 },
                  { name: 'No', value: nil, type: 'unfilled_checkbox', page: 1, x: 0.45, y: 1.66 }
                ]
              ]
            )

            do_request

            assert_status 201
            expect(response_data.count).to eq 1
            expect(response_data.first[:attributes][:title_multiloc][:en]).to eq 'This is really a great title'
            expect(response_data.first[:attributes][:publication_status]).to eq 'draft'
            expect(User.all.count).to eq 2 # 1 new user created
            expect(Idea.all.count).to eq 1
            expect(BulkImportIdeas::IdeaImport.all.count).to eq 1
            expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 1
            expect(project.reload.ideas_count).to eq 0 # Draft ideas should not be counted

            # Relationships
            expect(response_data.first.dig(:relationships, :idea_import, :data)).not_to be_nil
            expect(json_response_body[:included].pluck(:type)).to include 'idea_import'
          end
        end
      end
    end

    context 'idea import metadata' do
      get 'web_api/v1/ideas/:id/idea_import' do
        let(:id) do
          idea = create(:idea)
          idea.update! idea_import: create(:idea_import, idea: idea)
          idea.id
        end

        example_request 'Get the import meta data for an idea' do
          assert_status 200
          expect(response_data[:type]).to eq 'idea_import'
        end
      end
    end
  end

  def create_bulk_import_ideas_xlsx
    hash_array = [
      {
        'Title_en' => 'My idea title',
        'Body_en' => 'My idea content',
        'Email' => 'moderator@citizenlab.co',
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
        'Title_en' => 'My idea title',
        'Body_en' => 'My idea content',
        'Email' => 'moderator@citizenlab.co',
        'Project' => 'Project 1'
      }
    ]
    xlsx_stringio = XlsxService.new.hash_array_to_xlsx hash_array
    base_64_content = Base64.encode64 xlsx_stringio.read
    "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{base_64_content}"
  end

  def create_project_bulk_import_ideas_pdf
    base_64_content = Base64.encode64 File.read('/cl2_back/engines/commercial/bulk_import_ideas/spec/fixtures/testscan.pdf')
    "data:application/pdf;base64,#{base_64_content}"
  end
end
