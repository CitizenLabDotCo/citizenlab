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
    parameter :followable_type, 'One of: "Project", "ProjectFolders::Folder", "Initiative", "Idea"', required: false

    describe do
      let!(:project_follows) { create_list(:project, 2).map { |project| create(:follower, user: user, followable: project) } }
      let!(:other_follow) { create(:follower, user: create(:user)) }
      let!(:folder_follows) { create_list(:project_folder, 2).map { |project| create(:follower, user: user, followable: project) } }
      let!(:idea_follows) { [create(:follower, user: user, followable: create(:idea))] }
      let!(:initiative_follows) { [create(:follower, user: user, followable: create(:initiative))] }

      example_request 'List all followers' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to eq 6
        expect(json_response[:data].pluck(:id)).to match_array (project_follows + folder_follows + idea_follows + initiative_follows).map(&:id)
      end

      describe do
        let(:followable_type) { 'Project' }

        example_request 'List all followers by followable type' do
          assert_status 200
          json_response = json_parse response_body
          expect(json_response[:data].size).to eq 2
          expect(json_response[:data].pluck(:id)).to match_array project_follows.map(&:id)
          expect(json_response[:included].select { |included| included[:type] == 'project' }.pluck(:id)).to match_array project_follows.map(&:followable_id)
        end
      end
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

  post 'web_api/v1/ideas/:idea_id/followers' do
    ValidationErrorHelper.new.error_fields self, Follower

    let(:idea_id) { create(:idea).id }

    example_request 'Create a follower of a proposal' do
      assert_status 201
      json_response = json_parse response_body
      expect(json_response.dig(:data, :relationships)).to match({
        user: { data: { id: user.id, type: 'user' } },
        followable: { data: { id: idea_id, type: 'idea' } }
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
