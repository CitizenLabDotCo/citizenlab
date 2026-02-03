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

    parameter(
      :publication_status, <<~DESC.squish,
        List only the projects that have the specified publication status.
      DESC
      required: false,
      in: 'query',
      type: 'string',
      enum: AdminPublication::PUBLICATION_STATUSES
    )

    parameter(
      :topic_ids,
      'List only the projects that have all the specified topics.',
      required: false,
      in: 'query',
      type: 'array',
      items: { type: 'string' }
    )

    parameter(
      :area_ids,
      'List only the projects that are in the specified areas.',
      required: false,
      in: 'query',
      type: 'array',
      items: { type: 'string' }
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

    context "when filtering by a valid 'publication_status'" do
      let(:publication_status) { 'draft' }

      before do
        projects.first.tap do |p|
          p.admin_publication.update!(publication_status: publication_status)
        end
      end

      example_request 'List only the projects with the specified status' do
        assert_status 200

        expected_projects = Project
          .joins(:admin_publication)
          .where(admin_publications: { publication_status: publication_status })

        # Sanity check
        expect(expected_projects.count).to eq(1)

        expect(json_response_body[:projects].pluck(:id))
          .to match_array expected_projects.pluck(:id)
      end
    end

    context "when filtering by an invalid 'publication_status'" do
      let(:publication_status) { 'invalid-status' }

      example_request 'Returns an error', document: false do
        assert_status 400
        expect(json_response_body).to include(
          parameter_name: 'publication_status',
          parameter_value: publication_status,
          allowed_values: AdminPublication::PUBLICATION_STATUSES
        )
      end
    end

    context "when filtering by 'topic_ids'" do
      let(:topics) { create_list(:global_topic, 2) }
      let(:topic_ids) { topics.pluck(:id) }

      let!(:project) do
        create(:project).tap { |project| project.global_topics << topics }
      end

      before do
        # This project should not be returned because it only has one of the requested
        # topics.
        create(:project).tap { |project| project.global_topics << topics.first }
      end

      example_request 'List only the projects that have all the specified topics' do
        assert_status 200
        expect(json_response_body[:projects].pluck(:id))
          .to contain_exactly(project.id)
      end
    end

    context "when filtering by 'area_ids'" do
      let(:areas) { create_list(:area, 2) }
      let(:area_ids) { areas.pluck(:id) }
      let!(:project) { create(:project, areas: areas) }
      let!(:project_in_all_areas) { create(:project, include_all_areas: true) }

      before do
        # This project shouldn't be returned since it only has one of the requested areas.
        create(:project, areas: areas.take(1))
      end

      example_request 'List only the projects that are in the specified areas' do
        assert_status 200
        expect(json_response_body[:projects].pluck(:id))
          .to contain_exactly(project.id, project_in_all_areas.id)
      end
    end

    include_examples 'filtering_by_date', :project, :created_at
    include_examples 'filtering_by_date', :project, :updated_at
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

  include_examples '/api/v2/.../deleted', :projects
  #  TODO: Error responses
end
