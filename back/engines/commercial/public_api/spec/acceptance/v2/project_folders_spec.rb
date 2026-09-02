# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Project Folders' do
  explanation <<~DESC.squish
    Projects folders are used to group projects together.
  DESC

  include_context 'common_auth'

  get '/api/v2/project_folders' do
    route_summary 'List project folders'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the project folders in the platform.
    DESC

    include_context 'common_list_params'

    parameter(
      :publication_status,
      'List only project folders with the given publication status',
      required: false,
      type: 'string',
      in: :query,
      enum: AdminPublication::PUBLICATION_STATUSES
    )

    context do
      let_it_be(:project_folders) do
        create_list(
          :project_folder, 3,
          admin_publication_attributes: { publication_status: 'published' }
        )
      end

      example_request 'Lists project folders' do
        assert_status 200
        expect(json_response_body[:'project_folders/folders'].pluck(:id))
          .to match_array(project_folders.pluck(:id))
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end

      # Pins the response shape: these fields are a public contract, so adding or removing one is a
      # breaking change for integrations and has to be a deliberate edit here.
      example_request 'Returns the documented project folder fields', document: false do
        assert_status 200
        expect(json_response_body[:'project_folders/folders'].first.keys).to match_array %i[
          id slug created_at updated_at publication_status
          title_multiloc title description_preview_multiloc description_preview
        ]
      end

      context "when filtering by 'publication_status'" do
        let!(:archived_project_folder) do
          create(:project_folder, admin_publication_attributes: { publication_status: 'archived' })
        end

        let(:publication_status) { 'archived' }

        example_request 'Lists project folders with the given publication status' do
          assert_status 200
          expect(json_response_body[:'project_folders/folders'].pluck(:id))
            .to contain_exactly(archived_project_folder.id)
        end
      end
    end

    include_examples 'filtering_by_date', :project_folder, :created_at, :'project_folders/folder'
    include_examples 'filtering_by_date', :project_folder, :updated_at, :'project_folders/folder'
  end

  get '/api/v2/project_folders/:id' do
    route_summary 'Get project folder'
    route_description 'Retrieve a single project folder by its ID.'

    include_context 'common_item_params'

    let(:project_folder) { create(:project_folder) }
    let(:id) { project_folder.id }

    example_request 'Returns the project' do
      assert_status 200
      expect(json_response_body[:'project_folders/folder']).to include({ id: id })
    end

    context 'when the description is authored on the Content Builder' do
      before { author_description(project_folder, { 'en' => '<p>All things pools</p>' }) }

      example_request 'Returns the description held by the folder layout', document: false do
        assert_status 200
        expect(json_response_body[:'project_folders/folder']).to include(
          description_multiloc: { en: '<p>All things pools</p>' },
          description: '<p>All things pools</p>'
        )
      end
    end
  end

  include_examples '/api/v2/.../deleted', :project_folders
end
