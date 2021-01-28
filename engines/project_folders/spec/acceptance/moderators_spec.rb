require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Moderators' do
  explanation 'Moderators can manage (e.g. changing phases, ideas) only certain project_folders.'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'as a folder moderator' do
    let(:project_folder) { create(:project_folder) }
    let(:moderator) { create(:project_folder_moderator, project_folder: project_folder) }

    before do
      header_token_for(moderator)
    end

    get 'web_api/v1/project_folders/:project_folder_id/moderators' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of members per page'
      end

      let!(:same_folder_moderators) { create_list(:project_folder_moderator, 5, project_folder: project_folder) }
      let!(:other_project_folder) { create(:project_folder) }

      example 'List all moderators of a project_folder' do
        do_request project_folder_id: project_folder.id
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq same_folder_moderators.size + 1
      end

      example '[error] List all moderators of a project_folder you don\'t moderate' do
        do_request project_folder_id: other_project_folder.id
        expect(status).to eq(401)
      end
    end

    get 'web_api/v1/project_folders/:project_folder_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:project_folder_id) { project_folder.id }
      let(:user_id) { create(:user).id }
      let(:other_moderators) { create_list(:project_folder_moderator, 2, project_folder: project_folder) }
      let(:project_folder_id) { project_folder.id }
      let(:user_id) { other_moderators.first.id }

      example_request 'Get one moderator by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq other_moderators.first.id
      end
    end

    post 'web_api/v1/project_folders/:project_folder_id/moderators' do
      with_options scope: :project_folder_moderator do
        parameter :user_id, 'The id of user to become moderator (the id of the moderator will be the same).', required: true
      end

      ValidationErrorHelper.new.error_fields(self, User)

      let(:project_folder_id) { project_folder.id }
      let(:user) { create(:user) }
      let(:user_id) { user.id }
      let!(:child_projects) { create_list(:project, 3) }

      example_request '[error] Add a moderator of a project_folder' do
        expect(response_status).to eq 401
      end
    end

    delete 'web_api/v1/project_folders/:project_folder_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:project_folder_id) { project_folder.id }
      let(:user_id) { moderator.id }
      let!(:child_projects) { create_list(:project, 3) }

      example_request '[error] Delete a moderator of a project_folder' do
        expect(response_status).to eq 401
      end
    end
  end

  context 'as an admin' do
    let(:admin) { create(:admin) }

    before do
      header_token_for(admin)
    end

    get 'web_api/v1/project_folders/:project_folder_id/moderators' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of members per page'
      end

      let(:project_folder) { create(:project_folder) }
      let(:project_folder_id) { project_folder.id }
      let(:user_id) { create(:user).id }
      let(:other_moderators) { create_list(:project_folder_moderator, 2, project_folder: project_folder) }
      let(:project_folder_id) { project_folder.id }
      let(:user_id) { other_moderators.first.id }
      let!(:same_project_folder_moderators) { create_list(:project_folder_moderator, 2, project_folder: project_folder) }

      example_request 'List all moderators of a project_folder', document: false do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq same_project_folder_moderators.size
      end
    end

    get 'web_api/v1/project_folders/:project_folder_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:project_folder) { create(:project_folder) }
      let(:project_folder_id) { project_folder.id }
      let(:user_id) { create(:user).id }
      let(:other_moderators) { create_list(:project_folder_moderator, 2, project_folder: project_folder) }
      let(:project_folder_id) { project_folder.id }
      let(:user_id) { other_moderators.first.id }

      example_request 'Get one moderator by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq other_moderators.first.id
      end
    end

    post 'web_api/v1/project_folders/:project_folder_id/moderators' do
      with_options scope: :project_folder_moderator do
        parameter :user_id, 'The id of user to become moderator (the id of the moderator will be the same).', required: true
      end

      ValidationErrorHelper.new.error_fields(self, User)

      let(:moderator) { create(:project_folder_moderator, project_folder: project_folder) }
      let(:project_folder) { create(:project_folder) }
      let(:project_folder_id) { project_folder.id }
      let(:user) { create(:user) }
      let(:user_id) { user.id }
      let!(:child_projects) { create_list(:project, 3) }

      before do
        child_projects.each do |project|
          project.folder = project_folder
          project.save
        end

        expect(user.reload.moderatable_project_ids).to be_empty
      end

      example_request 'Add a moderator role' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq user_id
        expect(user.reload.moderatable_project_ids).to match_array child_projects.pluck(:id)
      end
    end

    delete 'web_api/v1/project_folders/:project_folder_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:moderator) { create(:project_folder_moderator, project_folder: project_folder) }
      let(:project_folder) { create(:project_folder) }
      let(:project_folder_id) { project_folder.id }
      let(:other_moderators) { create_list(:project_folder_moderator, 2, project_folder: project_folder) }
      let(:user) { other_moderators.first }
      let(:user_id) { user.id }
      let!(:child_projects) { create_list(:project, 3) }

      before do
        child_projects.each do |project|
          project.folder = project_folder
          project.save
          user.add_role('project_moderator', project_id: project.id)
        end
        user.save

        expect(user.reload.moderatable_project_ids).to match_array child_projects.pluck(:id)
      end

      example_request('Delete the moderator role of a user for a project_folder') do
        expect(response_status).to eq 200
        expect(user.reload.roles).to be_empty
        expect(user.reload.moderatable_project_ids).to be_empty
      end
    end
  end
end
