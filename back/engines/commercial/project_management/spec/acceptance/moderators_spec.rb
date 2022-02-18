require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Moderators' do

  explanation 'Moderators can manage (e.g. changing phases, ideas) only certain projects.'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/projects/:project_id/moderators' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of members per page'
    end

    context 'when moderator' do
      before do
        @project = create(:project)
        @moderator = create(:project_moderator, projects: [@project])
        token = Knock::AuthToken.new(payload: @moderator.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:project_id) { @project.id }
      let!(:same_project_moderators) { create_list(:project_moderator, 5, projects: [@project]) }
      let!(:other_project) { create(:project) }
      let!(:other_project_moderators) { create_list(:project_moderator, 2, projects: [other_project]) }

      example_request 'List all moderators of a project' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq same_project_moderators.size + 1
      end

      example "[error] List all moderators of a project you don't moderate" do
        do_request project_id: other_project.id
        expect(status).to eq(401)
      end
    end

    context 'when admin' do
      before do
        @project = create(:project)
        @admin = create(:admin)
        token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:project_id) { @project.id }
      let!(:same_project_moderators) { create_list(:project_moderator, 2, projects: [@project]) }

      example_request 'List all moderators of a project', document: false do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq same_project_moderators.size
      end
    end
  end

  get 'web_api/v1/projects/:project_id/moderators/:user_id' do
    ValidationErrorHelper.new.error_fields(self, User)

    context 'when moderator' do
      before do
        @project = create(:project)
        @moderator = create(:project_moderator, projects: [@project])
        token = Knock::AuthToken.new(payload: @moderator.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:other_moderators) { create_list(:project_moderator, 2, projects: [@project]) }
      let(:project_id) { @project.id }
      let(:user_id) { other_moderators.first.id }

      example_request 'Get one moderator by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq other_moderators.first.id
      end
    end
  end

  post 'web_api/v1/projects/:project_id/moderators' do
    with_options scope: :moderator do
        parameter :user_id, 'The id of user to become moderator (the id of the moderator will be the same).', required: true
      end
    ValidationErrorHelper.new.error_fields(self, User)

    context 'when moderator' do
      before do
        @project = create(:project)
        @moderator = create(:project_moderator, projects: [@project])
        token = Knock::AuthToken.new(payload: @moderator.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:project_id) { @project.id }
      let(:user_id) { create(:user).id }

      example_request 'Add a moderator role' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq user_id
      end
    end
  end

  delete 'web_api/v1/projects/:project_id/moderators/:user_id' do
    ValidationErrorHelper.new.error_fields(self, User)

    context 'when moderator' do
      before do
        @project = create(:project)
        @moderator = create(:project_moderator, projects: [@project])
        token = Knock::AuthToken.new(payload: @moderator.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:other_moderators) { create_list(:project_moderator, 2, projects: [@project]) }
      let(:project_id) { @project.id }
      let(:user_id) { other_moderators.first.id }

      example 'Delete the moderator role of a user for a project' do
        n_roles_before = other_moderators.first.reload.roles.size
        do_request
        expect(response_status).to eq 200
        expect(other_moderators.first.reload.roles.size).to eq(n_roles_before - 1)
      end

      example 'Delete the moderator role of an assignee, unassigns ideas they no longer moderate', document: false, if: defined?(IdeaAssignment::Engine) do
        idea = create :idea, assignee: @moderator, project: @project

        do_request user_id: @moderator.id

        expect(response_status).to eq 200
        expect(idea.reload).to be_valid
        expect(idea.assignee).to be_blank
      end
    end
  end

  get 'web_api/v1/projects/:project_id/moderators/users_search' do
    context "when moderator" do
      before do
        @project = create(:project)
        @moderator = create(:project_moderator, projects: [@project])
        token = Knock::AuthToken.new(payload: @moderator.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of users per page'
      end
      parameter :search, 'The query used for searching users', required: true

      let(:project_id) { @project.id }
      let(:search) { 'jo' }
      let(:other_project) { create(:project) }
      let!(:u1) { 
        create(:user, 
          first_name: 'Freddy', last_name: 'Smith', email: 'jofreddy@jojo.com', 
          roles: [{'type' => 'project_moderator', 'project_id' => @project.id}]) 
      }
      let!(:u2) { 
        create(:user, 
          first_name: 'Jon', last_name: 'Smith', email: 'freddy1@zmail.com', 
          roles: [{'type' => 'project_moderator', 'project_id' => other_project.id}]) 
      }
      let!(:u3) { 
        create(:user, 
          first_name: 'Jonny', last_name: 'Johnson', email: 'freddy2@zmail.com', 
          roles: []) 
      }
      let!(:u4) { 
        create(:user, 
          first_name: 'Freddy', last_name: 'Johnson', email: 'freddy3@zmail.com', 
          roles: [{'type' => 'project_moderator', 'project_id' => @project.id}, {'type' => 'project_moderator', 'project_id' => other_project.id}]) 
      }
      let!(:u5) { 
        create(:user, 
          first_name: 'Freddy', last_name: 'Smith', email: 'freddy4@zmail.com', 
          roles: [{'type' => 'project_moderator', 'project_id' => @project.id}]) 
      }

      example_request 'Search for users and whether or not they are moderator of the project' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to be >= 4
        expect(json_response[:data].select{ |d| d[:id] == u1.id }.first.dig(:attributes, :is_moderator)).to be true
        expect(json_response[:data].select{ |d| d[:id] == u2.id }.first.dig(:attributes, :is_moderator)).to be false
        expect(json_response[:data].select{ |d| d[:id] == u3.id }.first.dig(:attributes, :is_moderator)).to be false
        expect(json_response[:data].select{ |d| d[:id] == u4.id }.first.dig(:attributes, :is_moderator)).to be true
        expect(json_response[:data].select{ |d| d[:id] == u5.id }.empty?).to be true
      end
    end
  end
end
