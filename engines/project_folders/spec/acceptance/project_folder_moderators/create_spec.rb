require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Project Folder Moderators' do
  explanation 'Moderators can manage (e.g. changing phases, ideas) only certain projects.'

  before :all do
    unless User.roles.key?('project_folder_moderator')
      skip('The User class does not have the project folder moderator role')
    end
  end

  def serialize_moderators(current_user, *moderators)
    WebApi::V1::UserSerializer.new(moderators, params: { current_user: current_user }).serialized_json
  end

  describe 'Routes to Roles Controller', type: :routing do
    it 'routes to roles/roles#create' do
      expect(post: 'web_api/v1/users/project_folder_moderators').to route_to(
        controller: 'roles/roles',
        action: 'create',
        format: :json
      )
    end
  end

  post 'web_api/v1/users/project_folder_moderators' do
    with_options scope: :folder do
      parameter :folder_id, 'The project folder id to filter moderators by', type: :uuid
      parameter :user_id, 'The user id of the moderator', type: :uuid
    end

    context 'when passing invalid params' do
      let(:project_folder) { create(:project_folder) }
      let(:user)           { create(:user) }

      context 'when current_user is a normal user' do
        before do
          user_header_token
        end

        example_request 'It does not authorize the user' do
          request = {
            folder: {
              folder_id: project_folder.id,
              user_id: user.id
            }
          }
          do_request(request)
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
          serializer_mock     = serialize_moderators(User.project_folder_moderator(moderated_folders), moderator)
          data_length         = json_response.dig(:data).length

          expect(json_response).to be_present
          expect(data_length).to   eq 3
          expect(response_body).to eq serializer_mock
        end
      end
    end

    context 'when passing valid params' do
      let(:user) { create(:user) }
      let(:project_folder) { ProjectFolders::Folder.first }

      context 'when current_user is a normal user' do
        before do
          user_header_token
        end

        example_request 'It does not authorize the user' do
          byebug
          do_request(folder: { folder_id: project_folder.id, user_id: user.id })
          expect(status).to eq(401)
        end
      end

      context 'when current_user is an admin' do
        let(:admin) { create(:admin) }

        before do
          header_token_for(admin)
        end

        example_request 'It authorizes the user' do
          do_request(folder: { folder_id: folder_id, user_id: user_id })
          expect(status).to eq(200)
        end

        example_request 'It returns a serialized json with the filtered project moderators' do
          do_request(data: { folder: { folder_id: folder_id, user_id: user_id } })

          json_response       = json_parse(response_body)
          serializer_mock     = serialize_moderators(User.project_folder_moderator(folder_id), admin)
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
          do_request(folder: { folder_id: folder_id, user_id: user_id })
          expect(status).to eq(200)
        end

        example_request 'It returns a serialized json containing moderators that moderate the users folders' do
          do_request(folder: { folder_id: folder_id, user_id: user_id })

          json_response       = json_parse(response_body)
          serializer_mock     = serialize_moderators(User.project_folder_moderator(folder_id), moderator)
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
          do_request(folder: { folder_id: folder_id, user_id: user_id })
          expect(status).to eq(200)
        end

        example_request 'It returns an empty json' do
          do_request(folder: { folder_id: folder_id, user_id: user_id })

          json_response       = json_parse(response_body)
          serializer_mock     = serialize_moderators(User.none, moderator)
          data_length         = json_response.dig(:data).length

          expect(json_response).to be_present
          expect(data_length).to   eq 0
          expect(response_body).to eq serializer_mock
        end
      end
    end
  end
end
