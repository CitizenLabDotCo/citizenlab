require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Project Folder Moderators' do
  explanation 'Moderators can manage (e.g. changing phases, ideas) only certain projects.'

  def serialize_moderators(current_user, *moderators)
    WebApi::V1::UserSerializer.new(moderators, params: { current_user: current_user }).serialized_json
  end

  describe 'Routes to Roles Controller', type: :routing do
    it 'routes to roles/roles#create' do
      expect(post: 'web_api/v1/project_folder_moderators').to route_to(
        controller: 'roles/roles',
        action: 'create',
        format: :json
      )
    end
  end

  post 'web_api/v1/project_folder_moderators' do
    header 'Content-Type', 'application/json'

    with_options scope: :project_folder_moderator do
      parameter :project_folder_id, 'The project folder id to filter moderators by', type: :uuid
      parameter :user_id, 'The user id of the moderator', type: :uuid
    end

    let(:project_folder_id) { project_folder.id }
    let(:user_id)   { user.id }

    context 'when passing valid params' do
      let(:project_folder) { create(:project_folder) }
      let(:user)           { create(:user) }

      context 'when current_user is a normal user' do
        before do
          user_header_token
        end

        example_request 'It returns an unauthorized status' do
          expect(status).to eq(401)
        end
      end

      context 'when current_user is an admin' do
        let(:admin) { create(:admin) }

        before do
          header_token_for(admin)
          expect(user.project_folder_moderator?(project_folder)).to be_falsy
        end

        example_request 'It returns an ok status' do
          expect(status).to eq(200)
        end

        example_request 'It allows the creation of a folder moderator' do
          user.reload
          json_response       = json_parse(response_body)
          serializer_mock     = serialize_moderators(admin, user)

          expect(user.project_folder_moderator?(project_folder)).to be_truthy
          expect(json_response).to be_present
          expect(response_body).to eq serializer_mock
        end
      end

      context 'when current_user is a project folder moderator of the given folder' do
        let(:moderator) { create(:project_folder_moderator, project_folder: project_folder) }

        before do
          header_token_for(moderator)
          expect(moderator.project_folder_moderator?(project_folder)).to be_truthy
          expect(user.project_folder_moderator?(project_folder)).to be_falsy
        end

        example_request 'It returns an ok status' do
          expect(status).to eq(200)
        end

        example_request 'It allows the creation of a folder moderator' do
          user.reload
          json_response       = json_parse(response_body)
          serializer_mock     = serialize_moderators(moderator, user)

          expect(user.project_folder_moderator?(project_folder)).to be_truthy
          expect(json_response).to be_present
          expect(response_body).to eq serializer_mock
        end
      end

      context 'when current_user is a project folder moderator but not of the given folder' do
        let(:another_folder) { create(:project_folder) }
        let(:moderator) { create(:project_folder_moderator, project_folder: another_folder) }

        before do
          header_token_for(moderator)
          expect(moderator.project_folder_moderator?(another_folder)).to be_truthy
          expect(moderator.project_folder_moderator?(project_folder)).to be_falsy
          expect(user.project_folder_moderator?(project_folder)).to be_falsy
        end

        example_request 'It returns an unauthorized status' do
          expect(status).to eq(401)
        end
      end
    end
  end
end
