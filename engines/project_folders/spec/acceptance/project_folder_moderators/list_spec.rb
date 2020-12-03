require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Project Folder Moderators' do
  explanation 'Moderators can manage (e.g. changing phases, ideas) only certain projects.'

  def serialize_moderators(current_user, *moderators)
    WebApi::V1::UserSerializer.new(moderators.flatten, params: { current_user: current_user }).serialized_json
  end

  describe 'Routes to Roles Controller', type: :routing do
    it 'routes to roles/roles#index' do
      expect(get: 'web_api/v1/project_folder_moderators').to route_to(
        controller: 'roles/roles',
        action: 'index',
        format: :json
      )
    end
  end

  get 'web_api/v1/project_folder_moderators' do
    header 'Content-Type', 'application/json'

    let(:project_folder)       { create(:project_folder) }
    let(:other_project_folder) { create(:project_folder) }

    before do
      create_list(:project_folder_moderator, 3, project_folder: project_folder)
      create_list(:project_folder_moderator, 3, project_folder: other_project_folder)
    end

    parameter :folder_id, 'The project folder id to filter moderators by'

    context 'when not passing a folder id' do
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
          serializer_mock     = serialize_moderators(admin, User.project_folder_moderator)
          data_length         = json_response.dig(:data).length

          expect(json_response).to be_present
          expect(data_length).to   eq 6
          expect(response_body).to eq serializer_mock
        end
      end

      context 'when current_user is a project folder moderator' do
        let(:moderator)         { User.project_folder_moderator.first }
        let(:moderated_folders) { moderator.moderated_project_folders }

        before do
          header_token_for(moderator)
        end

        example_request 'It authorizes the user' do
          expect(status).to eq(200)
        end

        example_request 'It returns a serialized json containing moderators that moderate the users folders' do
          json_response       = json_parse(response_body)
          serializer_mock     = serialize_moderators(moderator, User.project_folder_moderator(moderated_folders))
          data_length         = json_response.dig(:data).length

          expect(json_response).to be_present
          expect(data_length).to   eq 3
          expect(response_body).to eq serializer_mock
        end
      end
    end

    context 'when passing a project folder id' do
      let(:folder_id) { ProjectFolders::Folder.first.id }

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

        example_request 'It returns a serialized json with the filtered project moderators' do
          json_response       = json_parse(response_body)
          serializer_mock     = serialize_moderators(admin, User.project_folder_moderator(folder_id))
          data_length         = json_response.dig(:data).length

          expect(json_response).to be_present
          expect(data_length).to   eq 3
          expect(response_body).to eq serializer_mock
        end
      end

      context 'when current_user is a project folder moderator of the folder with id = folder_id' do
        let(:moderator)         { User.project_folder_moderator(folder_id).first }
        let(:moderated_folders) { moderator.moderated_project_folders }

        before do
          header_token_for(moderator)
        end

        example_request 'It authorizes the user' do
          expect(status).to eq(200)
        end

        example_request 'It returns a serialized json containing moderators that moderate the users folders' do
          json_response       = json_parse(response_body)
          serializer_mock     = serialize_moderators(moderator, User.project_folder_moderator(folder_id))
          data_length         = json_response.dig(:data).length

          expect(json_response).to be_present
          expect(data_length).to   eq 3
          expect(response_body).to eq serializer_mock
        end
      end

      context 'when current_user is not project folder moderator of the folder with id = folder_id' do
        let(:moderator)         { User.not_project_folder_moderator(folder_id).first }
        let(:moderated_folders) { moderator.moderated_project_folders }

        before do
          header_token_for(moderator)
        end

        example_request 'It authorizes the user' do
          expect(status).to eq(200)
        end

        example_request 'It returns an empty json' do
          json_response       = json_parse(response_body)
          serializer_mock     = serialize_moderators(moderator, User.none)
          data_length         = json_response.dig(:data).length

          expect(json_response).to be_present
          expect(data_length).to   eq 0
          expect(response_body).to eq serializer_mock
        end
      end
    end
  end
end
