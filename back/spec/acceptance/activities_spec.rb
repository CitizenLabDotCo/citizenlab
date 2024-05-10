# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Activity' do
  explanation 'Activities.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
    @management_activity1 = create(:phase_created_activity)
    @management_activity2 = create(:phase_deleted_activity)
    @non_management_activity = create(:comment_created_activity)
  end

  get 'web_api/v1/activities' do
    example_request 'List all activities' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end
end
