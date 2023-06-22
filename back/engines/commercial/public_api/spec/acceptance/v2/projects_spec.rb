# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Projects' do
  explanation <<~DESC.squish
    Projects are participation scopes. They establish a framework, including the 
    context, duration, and expected input, to encourage citizens to actively engage in 
    focused discussions. Within these projects, citizens can contribute and post their
    ideas.
  DESC

  include_context 'common_auth'

  let!(:projects) { create_list(:project, 5) }

  get '/api/v2/projects/' do
    route_summary 'List projects'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the projects in the platform, with the newest 
      projects appearing first.
    DESC

    include_context 'common_list_params'

    parameter(
      :folder_id, <<~DESC.squish,
        List only the projects that are in the specified folder.
      DESC
      required: false,
      in: 'query',
      type: 'string'
    )

    context 'when the page size is smaller than the total number of projects' do
      let(:page_size) { 2 }

      example_request 'List only the first page of projects' do
        assert_status 200
        expect(json_response_body[:projects].size).to eq(page_size)

        total_pages = (projects.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    context "when filtering by 'created_at'" do
      let(:created_at) { '2022-05-01,2022-05-03' }

      let!(:project) do
        projects.first.tap { |p| p.update!(created_at: '2022-05-02') }
      end

      example_request 'List only the projects created in the specified range', document: false do
        assert_status 200
        expect(json_response_body[:projects].pluck(:id)).to eq [project.id]
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end

    context "when filtering by 'updated_at'" do
      let(:updated_at) { ',2023-01-31' }

      let!(:project) do
        projects.first.tap { |p| p.update!(updated_at: '2023-01-01') }
      end

      example_request 'List only the projects updated between the specified dates', document: false do
        assert_status 200
        expect(json_response_body[:projects].pluck(:id)).to eq [project.id]
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end

    context "when filtering by 'folder_id'" do
      let(:projects_in_folder) { create_list(:project, 2) }
      let(:folder) { create(:project_folder, projects: projects_in_folder) }
      let(:folder_id) { folder.id }

      example_request 'List only the projects in the specified folder', document: false do
        assert_status 200
        expect(json_response_body[:projects].pluck(:id))
          .to match_array projects_in_folder.pluck(:id)
      end
    end
  end

  get '/api/v2/projects/:id' do
    route_summary 'Get project'
    route_description 'Retrieve a single project by ID.'

    include_context 'common_item_params'

    let(:project) { projects[0] }
    let(:id) { project.id }

    before do
      # NOTE: Temp fix until locales of factories and tenants are consistent
      # Currently, the tenant locales are ["en", "fr-FR", "nl-NL"], while the factory
      # locales are ["en", "nl-BE"]. The following code aligns the two by replacing
      # the "nl-BE" locale with "nl-NL" in the project.
      title = project[:title_multiloc]
      title['nl-NL'] = title.delete 'nl-BE'
      project.update!(title_multiloc: title)
    end

    example_request 'Returns the project in the default locale' do
      assert_status 200
      expect(json_response_body[:project]).to include({ id: id })
    end

    context 'when the locale is specified' do
      let(:locale) { 'nl-NL' }

      example_request 'Returns the project in the specified locale', document: false do
        assert_status 200
        expect(json_response_body.dig(:project, :title))
          .to eq project.title_multiloc['nl-NL']
      end
    end
  end
  #  TODO: Error responses
end
