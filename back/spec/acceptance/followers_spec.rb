# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Followers' do
  explanation 'Followers are relationships between users and the "followables" in which they are interested. For example, a user can follow a project.'

  before do
    header 'Content-Type', 'application/json'
    header_token_for user
  end

  let(:user) { create(:user) }

  get 'web_api/v1/followers' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of followers per page'
    end

    example 'List all followers' do
      followers = create_list(:follower, 2, user: user)
      create(:follower, user: create(:user))

      do_request
      assert_status 200
      json_response = json_parse response_body
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].pluck(:id)).to match_array followers.map(&:id)
      expect(json_response[:included].select { |included| included[:type] == 'project' }.pluck(:id)).to match_array followers.map(&:followable_id)
      # TODO: add a follower to a proposal and a folder
    end
  end

  get 'web_api/v1/followers/:id' do
    let(:id) { create(:follower, user: user).id }

    example_request 'Get one follower by id' do
      assert_status 200
      json_response = json_parse response_body
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  post 'web_api/v1/projects/:project_id/followers' do
    ValidationErrorHelper.new.error_fields self, Follower

    let(:project_id) { create(:project).id }

    example_request 'Create a follower of a project' do
      assert_status 201
      json_response = json_parse response_body
      expect(json_response.dig(:data, :relationships)).to match({
        user: { data: { id: user.id, type: 'user' } },
        followable: { data: { id: project_id, type: 'project' } }
      })
    end
  end

  post 'web_api/v1/initiatives/:initiative_id/followers' do
    ValidationErrorHelper.new.error_fields self, Follower

    let(:initiative_id) { create(:initiative).id }

    example_request 'Create a follower of a proposal' do
      assert_status 201
      json_response = json_parse response_body
      expect(json_response.dig(:data, :relationships)).to match({
        user: { data: { id: user.id, type: 'user' } },
        followable: { data: { id: initiative_id, type: 'initiative' } }
      })
    end
  end

  post 'web_api/v1/project_folders/:folder_id/followers' do
    ValidationErrorHelper.new.error_fields self, Follower

    let(:folder_id) { create(:project_folder).id }

    example_request 'Create a follower of a folder' do
      assert_status 201
      json_response = json_parse response_body
      expect(json_response.dig(:data, :relationships)).to match({
        user: { data: { id: user.id, type: 'user' } },
        followable: { data: { id: folder_id, type: 'folder' } }
      })
      # TODO: verify that projects are also automatically followed
    end
  end

  delete 'web_api/v1/followers/:id' do
    let(:follower) { create(:follower, user: user) }
    let!(:id) { follower.id }

    example 'Delete a follower' do
      expect { do_request }.to change(Follower, :count).by(-1)
      assert_status 200
    end

    # TODO: when unfollowing a folder, also unfollow the projects
  end
end
