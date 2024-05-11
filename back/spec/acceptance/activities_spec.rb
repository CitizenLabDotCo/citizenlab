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
    @activity1 = create(:phase_created_activity, user: @user)
    @activity2 = create(:phase_deleted_activity, project_id: @project.id)
    @activity3 = create(:project_created_activity, item: @project, user: @user)
    @activity4 = create(:project_changed_activity, item: @project)
    @activity5 = create(:project_deleted_activity, item: @project)
    @activity6 = create(:project_published_activity, item: create(:project))
    @activity7 = create(:project_changed_publication_status_activity, item: create(:project))
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
      expect(json_response[:data].size).to eq 7
    end

    example 'List all activities associated with a user' do
      do_request user_ids: [@user.id]
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].pluck(:id)).to match_array [@activity1.id, @activity3.id]
    end

    example 'List all activities with a specific project_id' do
      do_request project_ids: [@project.id]
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 4
      expect(json_response[:data].pluck(:id))
        .to match_array [@activity2.id, @activity3.id, @activity4.id, @activity5.id]
    end
  end
end
