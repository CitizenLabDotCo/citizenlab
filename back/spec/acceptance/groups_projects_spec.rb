# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'GroupsProjects' do
  explanation 'Which groups can access which projects.'

  before do
    header 'Content-Type', 'application/json'
    @project = create(:project)
    @groups = create_list(:group, 4)
    @groups_projects = @groups.map { |g| create(:groups_project, project: @project, group: g) }
  end

  context 'when admin' do
    before { admin_header_token }

    get 'web_api/v1/projects/:project_id/groups_projects' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of groups-projects per page'
      end
      parameter :sort, "Either 'new', '-new'", required: false

      let(:project_id) { @project.id }

      example_request 'List all groups-projects of a project' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4
      end

      example 'List all groups-projects sorted by new', document: false do
        gp1 = create(:groups_project, project: @project, group: create(:group))
        do_request sort: 'new'
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
        expect(json_response[:data][0][:id]).to eq gp1.id
      end
    end

    get 'web_api/v1/groups_projects/:id' do
      let(:id) { @groups_projects.first.id }

      example_request 'Get one groups-project by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @groups_projects.first.id
      end
    end

    post 'web_api/v1/projects/:project_id/groups_projects' do
      with_options scope: :groups_project do
        parameter :group_id, 'The group id of the groups-project.', required: true
      end
      ValidationErrorHelper.new.error_fields(self, GroupsProject)

      let(:project_id) { @project.id }
      let(:groups_project) { build(:groups_project) }
      let(:group) { create(:group) }
      let(:group_id) { group.id }
      let(:title_multiloc) { group.title_multiloc }

      example_request 'Add a groups-project' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :group, :data, :id)).to eq group_id
        expect(json_response[:included].first.dig(:attributes, :title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    delete 'web_api/v1/groups_projects/:id' do
      let(:groups_project) { create(:groups_project) }
      let(:id) { groups_project.id }

      example_request 'Delete a groups-project' do
        expect(response_status).to eq 200
        expect { GroupsProject.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
