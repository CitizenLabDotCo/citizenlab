# frozen_string_literal: true

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
        header_token_for create(:project_moderator, projects: [@project])
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
        admin_header_token
      end

      let(:project_id) { @project.id }
      let!(:same_project_moderators) { create_list(:project_moderator, 2, projects: [@project]) }

      example 'List all moderators of a project', document: false do
        do_request
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
        header_token_for create(:project_moderator, projects: [@project])
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
        header_token_for create(:project_moderator, projects: [@project])
      end

      let(:project_id) { @project.id }
      let(:user_id) { create(:user).id }

      example_request 'Add a moderator role' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq user_id
      end

      context 'with limited seats' do
        before do
          config = AppConfiguration.instance
          config.settings['core']['maximum_moderators_number'] = 2
          config.settings['core']['additional_moderators_number'] = 0
          config.save!
        end

        context 'when limit is reached' do
          before { create(:project_moderator) } # to reach limit of 2

          example_request 'Increments additional seats', document: false do
            assert_status 201
            expect(AppConfiguration.instance.settings['core']['additional_moderators_number']).to eq(1)
          end
        end

        example_request 'Does not increment additional seats if limit is not reached', document: false do
          assert_status 201
          expect(AppConfiguration.instance.settings['core']['additional_moderators_number']).to eq(0)
        end
      end
    end
  end

  delete 'web_api/v1/projects/:project_id/moderators/:user_id' do
    ValidationErrorHelper.new.error_fields(self, User)

    context 'when moderator' do
      before do
        @project = create(:project)
        header_token_for create(:project_moderator, projects: [@project])
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
    end
  end

  get 'web_api/v1/projects/:project_id/moderators/users_search' do
    context 'when moderator' do
      before do
        @project = create(:project)
        header_token_for create(:project_moderator, projects: [@project])
      end

      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of users per page'
      end
      parameter :search, 'The query used for searching users', required: true

      let(:project_id) { @project.id }
      let(:search) { 'jo' }
      let(:other_project) { create(:project) }
      let!(:u1) do
        create(:user,
          first_name: 'Freddy', last_name: 'Smith', email: 'jofreddy@jojo.com',
          roles: [{ 'type' => 'project_moderator', 'project_id' => @project.id }])
      end
      let!(:u2) do
        create(
          :user,
          first_name: 'Jon', last_name: 'Smith', email: 'freddy1@zmail.com',
          roles: [{ 'type' => 'project_moderator', 'project_id' => other_project.id }]
        )
      end
      let!(:u3) do
        create(
          :user,
          first_name: 'Jonny', last_name: 'Johnson', email: 'freddy2@zmail.com',
          roles: []
        )
      end
      let!(:u4) do
        create(
          :user,
          first_name: 'Freddy', last_name: 'Johnson', email: 'freddy3@zmail.com',
          roles: [{ 'type' => 'project_moderator', 'project_id' => @project.id }, { 'type' => 'project_moderator', 'project_id' => other_project.id }]
        )
      end
      let!(:u5) do
        create(
          :user,
          first_name: 'Freddy', last_name: 'Smith', email: 'freddy4@zmail.com',
          roles: [{ 'type' => 'project_moderator', 'project_id' => @project.id }]
        )
      end

      example_request 'Search for users and whether or not they are moderator of the project' do
        expect(status).to eq(200)
        expect(response_data).not_to include(hash_including(id: u5.id))
        expect(response_data).to include(
          hash_including(id: u1.id, attributes: hash_including(is_moderator: true)),
          hash_including(id: u2.id, attributes: hash_including(is_moderator: false)),
          hash_including(id: u3.id, attributes: hash_including(is_moderator: false)),
          hash_including(id: u4.id, attributes: hash_including(is_moderator: true))
        )
      end
    end
  end
end
