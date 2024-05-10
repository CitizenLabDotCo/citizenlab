# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Activity' do
  explanation 'Activities.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
    @user = create(:admin)
    @project = create(:project)
    @management_activity1 = create(:phase_created_activity, user: @user)
    @management_activity2 = create(:phase_deleted_activity, project_id: @project.id)
    @management_activity3 = create(:activity, item_type: 'Project', action: 'created', project_id: @project.id, user: @user)
    @management_activity4 = create(:activity, item_type: 'Project', action: 'deleted', project_id: @project.id)
    @non_management_activity = create(:comment_created_activity)
  end

  get 'web_api/v1/activities' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of areas per page'
    end

    example_request 'List all activities' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 4
    end

    example 'List all activities associated with a user' do
      do_request user_ids: [@user.id]
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].pluck(:id)).to match_array [@management_activity1.id, @management_activity3.id]
    end

    example 'List all activities associated with a project' do
      do_request project_ids: [@project.id]
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
      expect(json_response[:data].pluck(:id))
        .to match_array [@management_activity2.id, @management_activity3.id, @management_activity4.id]
    end
  end
end
