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
    parameter :followable_type, 'One of: "Project", "ProjectFolders::Folder", "Idea"', required: false

    describe do
      let!(:project_follows) { create_list(:project, 2).map { |project| create(:follower, user: user, followable: project) } }
      let!(:other_follow) { create(:follower, user: create(:user)) }
      let!(:folder_follows) { create_list(:project_folder, 2).map { |project| create(:follower, user: user, followable: project) } }
      let!(:idea_follows) { [create(:follower, user: user, followable: create(:idea))] }
      let!(:topic_follows) { [create(:follower, user: user, followable: create(:topic))] }
      let!(:area_follows) { [create(:follower, user: user, followable: create(:area))] }

      example_request 'List all followers' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to eq 7
        expect(json_response[:data].pluck(:id)).to match_array (project_follows + folder_follows + idea_follows + topic_follows + area_follows).map(&:id)
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

    example_request 'Get one follower by ID' do
      assert_status 200
      json_response = json_parse response_body
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  [
    {
      type: 'folder',
      resource: 'project_folders',
      factory: 'project_folder'
    },
    {
      type: 'project',
      resource: 'projects',
      factory: 'project'
    },
    {
      type: 'idea',
      resource: 'ideas',
      factory: 'idea'
    },
    {
      type: 'global_topic',
      resource: 'global_topics',
      factory: 'global_topic'
    },
    {
      type: 'area',
      resource: 'areas',
      factory: 'area'
    }
  ].each do |followable_mapper|
    post "web_api/v1/#{followable_mapper[:resource]}/:followable_id/followers" do
      ValidationErrorHelper.new.error_fields self, Follower

      let(:followable_id) { create(followable_mapper[:factory]).id }

      example_request "Create a follower of a #{followable_mapper[:type]}" do
        assert_status 201
        json_response = json_parse response_body
        expect(json_response.dig(:data, :relationships)).to match({
          user: { data: { id: user.id, type: 'user' } },
          followable: { data: { id: followable_id, type: followable_mapper[:type] } }
        })
      end
    end
  end

  delete 'web_api/v1/followers/:id' do
    let(:follower) { create(:follower, user: user) }
    let!(:id) { follower.id }

    example 'Delete a follower (unfollow)' do
      expect { do_request }.to change(Follower, :count).by(-1)
      assert_status 200
    end
  end
end
