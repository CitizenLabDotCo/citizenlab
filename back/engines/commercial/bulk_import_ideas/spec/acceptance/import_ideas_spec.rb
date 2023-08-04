# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'BulkImportIdeasImportIdeas' do
  explanation 'Create many ideas at once by importing an XLSX sheet.'

  before { header 'Content-Type', 'application/json' }

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
          assert_status 200
        end
      end
    end

    context 'project import' do
      parameter(:project_id, 'ID of the project to import these ideas to', required: true)

      let(:project_id) { create(:project).id }

      get 'web_api/v1/import_ideas/:project_id/example_xlsx' do
        example_request 'Get the example xlsx for a project' do
          assert_status 200
        end
      end

      post 'web_api/v1/import_ideas/:project_id/bulk_create_xlsx' do
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
          assert_status 200
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

end
