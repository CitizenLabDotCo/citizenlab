# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Activity' do
  explanation 'Activities.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
    @user1 = create(:admin)
    @user2 = create(:user, roles: [{ type: 'project_moderator', project_id: SecureRandom.uuid }])
    @project = create(:project)
    @non_management_activity = create(:comment_created_activity, user: @user2)
  end

  get 'web_api/v1/activities' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of areas per page'
    end

    example 'List all activities' do
      create(:phase_created_activity, user: @user1)
      create(:phase_changed_activity, user: @user2)
      create(:phase_deleted_activity, user: @user2)
      create(:project_created_activity, user: @user1)
      create(:project_changed_activity, user: @user2)
      create(:project_deleted_activity, user: @user2)
      create(:project_folder_created_activity, user: @user1)
      create(:project_folder_changed_activity, user: @user2)
      create(:project_folder_deleted_activity, user: @user2)
      create(:idea_created_activity, user: @user1)
      create(:idea_deleted_activity, user: @user2)
      create(:idea_changed_activity, user: @user2)

      do_request
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 12
      expect(json_response[:data].pluck(:id).include?(@non_management_activity.id)).to be false
    end

    example 'List all activities associated with a user' do
      _activity1 = create(:phase_created_activity, user: @user1)
      activity2 = create(:phase_changed_activity, user: @user2)
      activity3 = create(:phase_deleted_activity, user: @user2)

      do_request user_ids: [@user2.id]
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].pluck(:id)).to contain_exactly(activity2.id, activity3.id)
    end

    example 'List all activities where project_id matches a given project_id' do
      _activity1 = create(:phase_created_activity, user: @user1, project_id: SecureRandom.uuid)
      activity2 = create(:phase_created_activity, user: @user1, project_id: @project.id)
      activity3 = create(:project_created_activity, user: @user1, project_id: @project.id)

      do_request project_ids: [@project.id]
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].pluck(:id)).to contain_exactly(activity2.id, activity3.id)
    end

    example 'List all activities excludes activities with acted_at more than 30 days ago', document: false do
      activity1 = create(:phase_created_activity, user: @user1, acted_at: 31.days.ago)
      _activity2 = create(:phase_created_activity, user: @user1)
      _activity3 = create(:project_created_activity, user: @user1)

      do_request
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].pluck(:id)).not_to include activity1.id
    end

    example 'List all activities excludes activities where actor is not an admin or moderator', document: false do
      activity1 = create(:phase_created_activity, user: create(:user))
      _activity2 = create(:phase_created_activity, user: @user1)
      _activity3 = create(:project_created_activity, user: @user2)

      do_request
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].pluck(:id)).not_to include activity1.id
    end

    describe 'Sorting by acted_at' do
      let!(:activity1) { create(:phase_created_activity, user: @user1, acted_at: 1.day.ago) }
      let!(:activity2) { create(:project_deleted_activity, user: @user1, acted_at: 3.days.ago) }
      let!(:activity3) { create(:project_changed_activity, user: @user1, acted_at: 2.days.ago) }

      example 'List all activities sorts by sort: acted_at param (asc)' do
        do_request sort: 'acted_at'
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].pluck(:id)).to eq [activity2.id, activity3.id, activity1.id]
      end

      example 'List all activities sorts by sort: -acted_at param (asc)' do
        do_request sort: '-acted_at'
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].pluck(:id)).to eq [activity1.id, activity3.id, activity2.id]
      end
    end

    example 'List all activities handles case where user has been deleted', document: false do
      activity1 = create(:phase_created_activity, user: @user1)
      _activity2 = create(:project_deleted_activity, user: @user2)
      @user1.destroy!

      do_request
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data].pluck(:id)).not_to include activity1.id
    end

    example 'List all activities handles case where item has been deleted', document: false do
      activity1 = create(:phase_created_activity, user: @user1)
      activity2 = create(:project_deleted_activity, user: @user1, item: @project)
      @project.destroy!

      do_request
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].pluck(:id)).to contain_exactly(activity1.id, activity2.id)
    end
  end
end
