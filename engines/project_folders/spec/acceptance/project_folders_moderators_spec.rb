require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Project Folder Moderators' do
  explanation 'Moderators can manage (e.g. changing phases, ideas) only certain projects.'

  before :all do
    unless User.roles.key?('project_folder_moderator')
      skip('The User class does not have the project folder moderator role')
    end
  end

  def serialize_moderators(moderators, current_user)
    WebApi::V1::UserSerializer.new(moderators, params: { current_user: current_user }).serialized_json
  end

  get 'web_api/v1/users/project_folder_moderators' do
    let(:project_folder)       { create(:project_folder) }
    let(:other_project_folder) { create(:project_folder) }

    before do
      create_list(:project_folder_moderator, 3, project_folder: project_folder)
      create_list(:project_folder_moderator, 3, project_folder: other_project_folder)
    end

    parameter :project_folder_id, 'The project folder id to filter moderators by'

    context 'when current_user is a normal user' do
      before do
        user_header_token
      end

      example_request 'It does not authorize the user' do
        expect(status).to eq(401)
      end
    end

    context 'when current_user is an admin' do
      let(:admin) { create(:admin) }

      before do
        header_token_for(admin)
      end

      example_request 'It authorizes the user' do
        expect(status).to eq(200)
      end

      example_request 'It returns a serialized json with all project folder moderators' do
        json_response       = json_parse(response_body)
        serializer_mock     = serialize_moderators(User.project_folder_moderator, admin)
        data_length         = json_response.dig(:data).length

        expect(json_response).to be_present
        expect(data_length).to   eq 6
        expect(response_body).to eq serializer_mock
      end
    end

    context 'when current_user is a project folder moderator' do
      let(:moderator)         { create(:project_folder_moderator) }
      let(:moderated_folders) { moderator.moderated_project_folders }

      before do
        header_token_for(moderator)
      end

      example_request 'It authorizes the user' do
        expect(status).to eq(200)
      end

      example_request 'It returns a serialized json containing moderators that moderate the users folders' do
        json_response       = json_parse(response_body)
        serializer_mock     = serialize_moderators(User.project_folder_moderator(moderated_folders), moderator)
        data_length         = json_response.dig(:data).length

        expect(json_response).to be_present
        expect(data_length).to   eq 3
        expect(response_body).to eq serializer_mock
      end
    end
  end
end
