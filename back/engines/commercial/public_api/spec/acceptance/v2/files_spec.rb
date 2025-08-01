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
      create(:file, uploader: user, category: 'meeting'),
      create(:file, uploader: user, category: 'report'),
      create(:file, uploader: nil, category: 'policy'),
      create(:file, uploader: user, category: 'other'),
      create(:file, uploader: nil, category: 'info_sheet')
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

    parameter :uploader, 'Filter by uploader ID (can be an array)', type: :string
    parameter :project_id, 'Filter by project ID (can be an array)', type: :string
    parameter :category, 'Filter by category (can be an array)', type: :string
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
end