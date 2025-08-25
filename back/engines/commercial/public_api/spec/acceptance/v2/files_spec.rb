# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Files' do
  explanation <<~DESC.squish
    Files represent uploaded documents and media that can be attached to various resources
    within the platform.
  DESC

  include_context 'common_auth'

  let!(:user) { create(:user) }
  let!(:project) { create(:project) }
  let!(:files) do
    [
      create(:file, :meeting, uploader: user),
      create(:file, :report, uploader: user),
      create(:file, :policy, uploader: nil),
      create(:file, :other, uploader: user),
      create(:file, :info_sheet, uploader: nil)
    ]
  end

  before do
    # Create file-project associations
    files[0].files_projects.create!(project: project)
    files[1].files_projects.create!(project: project)
  end

  get '/api/v2/files/' do
    route_summary 'List files'
    route_description <<~DESC.squish
      Retrieve a paginated list of all files in the platform, with the most recently
      created ones first. Supports filtering by uploader, project, category, and search term.
    DESC

    include_context 'common_list_params'

    parameter :uploader, 'Filter by uploader ID (can be an array)', type: %i[string array]
    parameter :project_id, 'Filter by project ID (can be an array)', type: %i[string array]
    parameter :category, 'Filter by category (can be an array)', type: %i[string array]
    parameter :search, 'Search files by name or description', type: :string

    context 'when the page size is smaller than the total number of files' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:files].size).to eq(page_size)

        total_pages = (files.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    context 'when filtering by uploader' do
      let(:uploader) { user.id }

      example_request 'Returns only files uploaded by the specified user' do
        assert_status 200
        expect(json_response_body[:files].size).to eq(3)
        expect(json_response_body[:files].pluck(:uploader_id).uniq).to eq([user.id])
      end
    end

    context 'when filtering by project' do
      let(:project_id) { project.id }

      example_request 'Returns only files associated with the specified project' do
        assert_status 200
        expect(json_response_body[:files].size).to eq(2)
      end
    end

    context 'when filtering by category' do
      let(:category) { 'meeting' }

      example_request 'Returns only files with the specified category' do
        assert_status 200
        expect(json_response_body[:files].size).to eq(1)
        expect(json_response_body[:files].first[:category]).to eq('meeting')
      end
    end

    context 'when searching files' do
      before do
        files[0].update!(name: 'Annual Report 2023.pdf')
        files[1].update!(name: 'Meeting Minutes.docx')
      end

      let(:search) { 'report' }

      example_request 'Returns files matching the search term' do
        assert_status 200
        expect(json_response_body[:files]).not_to be_empty
        expect(json_response_body[:files].map { |f| f[:name] }).to include('Annual Report 2023.pdf')
      end
    end

    include_examples 'filtering_by_date', :file, :created_at
    include_examples 'filtering_by_date', :file, :updated_at
  end

  get '/api/v2/files/:id' do
    route_summary 'Get file'
    route_description 'Retrieve a single file by its ID.'

    include_context 'common_item_params'

    let(:file) { files[0] }
    let(:id) { file.id }

    before do
      # Set up multiloc description
      file.update!(
        description_multiloc: {
          'en' => 'Meeting summary document',
          'nl-NL' => 'Vergadering samenvattingsdocument',
          'fr-FR' => 'Document de synthèse de réunion'
        }
      )
    end

    example_request 'Returns the file in the default locale' do
      assert_status 200
      expect(json_response_body[:file]).to include({
        id: id,
        name: file.name,
        category: 'meeting',
        uploader_id: user.id,
        size: file.size,
        mime_type: file.mime_type,
        ai_processing_allowed: false,
        description: 'Meeting summary document',
        url: file.content.url
      })
    end

    context 'when the locale is specified' do
      let(:locale) { 'nl-NL' }

      example_request 'Returns the file in the specified locale' do
        assert_status 200
        expect(json_response_body.dig(:file, :description))
          .to eq 'Vergadering samenvattingsdocument'
      end
    end
  end

  include_examples '/api/v2/.../deleted', :files

  post '/api/v2/files' do
    route_summary 'Upload a file'
    route_description 'Upload a new file to the platform, in the scope of a specific project.'
    include_context 'common_auth'
    header 'Content-Type', 'application/json'

    with_options scope: :file do
      parameter :name, 'Name of the file', required: true, type: :string
      parameter :project_id, 'ID of the project to associate the file with', required: true, type: :string
      parameter :content, 'The content of the file, encoded in Base64', required: true, type: :file
      parameter :category, "Category of the file', required: false, type: :string. One of #{Files::File.categories.keys.map { "`#{_1}`" }.join(', ')}"
      parameter :description_multiloc, 'The description of the file, as a an object with locale keys', required: false, type: :object
      parameter :ai_processing_allowed, 'Whether AI processing is allowed for this file (defaults to false)', required: false, type: :boolean
    end

    let(:name) { 'Test File' }
    let(:project_id) { project.id }
    let(:content) { file_as_base64('minimal_pdf.pdf', 'application/pdf') }
    let(:category) { 'meeting' }
    let(:description_multiloc) { { 'en' => 'Test file description' } }
    let(:ai_processing_allowed) { true }

    example_request 'Uploads a file' do
      assert_status 201
      expect(json_response_body[:file]).to include({
        name: 'Test File',
        category: 'meeting',
        uploader_id: nil,
        description: 'Test file description',
        ai_processing_allowed: true,
        created_at: kind_of(String),
        updated_at: kind_of(String),
        size: 130,
        url: kind_of(String)
      })
      file = Files::File.find(json_response_body.dig(:file, :id))
      expect(file.projects).to contain_exactly(project)
    end

    context 'without project_id' do
      let(:project_id) { nil }

      example_request '[Error] Uploads a file without a project' do
        assert_status 422
        expect(json_response_body).to include({
          errors: include({
            files_projects: [{ error: 'invalid' }]
          })
        })
      end
    end
  end

  patch '/api/v2/files/:id' do
    route_summary 'Update a file'
    route_description 'Update the metadata of an existing file. Changing the content of the file is not supported.'
    include_context 'common_auth'
    header 'Content-Type', 'application/json'

    with_options scope: :file do
      parameter :name, 'New name of the file', required: false, type: :string
      parameter :category, "New category of the file', required: false, type: :string. One of #{Files::File.categories.keys.map { "`#{_1}`" }.join(', ')}"
      parameter :description_multiloc, 'New description of the file, as a an object with locale keys', required: false, type: :object
      parameter :ai_processing_allowed, 'Whether AI processing is allowed for this file (defaults to false)', required: false, type: :boolean
    end
    let(:file) { files[0] }
    let(:id) { file.id }
    let(:name) { 'Updated File Name' }
    let(:category) { 'meeting' }
    let(:description_multiloc) { { 'en' => 'Updated description' } }
    let(:ai_processing_allowed) { true }

    example_request 'Updates the file metadata' do
      assert_status 200
      expect(json_response_body[:file]).to include({
        id: id,
        name: 'Updated File Name',
        category: 'meeting',
        description: 'Updated description',
        ai_processing_allowed: true,
        updated_at: kind_of(String)
      })
    end
  end

  delete '/api/v2/files/:id' do
    route_summary 'Delete a file'
    route_description 'Delete an existing file from the platform.'
    include_context 'common_auth'

    let(:file) { files[0] }
    let(:id) { file.id }

    example_request 'Deletes the file' do
      assert_status 204
      expect { Files::File.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
