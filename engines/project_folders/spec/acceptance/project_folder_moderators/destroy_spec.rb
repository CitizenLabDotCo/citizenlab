require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Project Folder Moderators' do
  explanation 'Moderators can manage (e.g. changing phases, ideas) only certain projects.'

  def serialize_moderators(current_user, *moderators)
    WebApi::V1::UserSerializer.new(moderators, params: { current_user: current_user }).serialized_json
  end

  describe 'Routes to Roles Controller', type: :routing do
    it 'routes to roles/roles#delete' do
      expect(delete: 'web_api/v1/project_folder_moderators').to route_to(
        controller: 'roles/roles',
        action: 'destroy',
        format: :json
      )
    end
  end

  delete 'web_api/v1/project_folder_moderators/:id' do
    header 'Content-Type', 'application/json'

    parameter :id, 'The user id of the moderator to remove rights from', type: :uuid

    with_options scope: :project_folder_moderator do
      parameter :folder_id, 'The folder id to remove', type: :uuid
    end

    let(:id)             { moderator.id }
    let(:moderator)      { create(:project_folder_moderator, project_folder: project_folder) }
    let(:project_folder) { create(:project_folder) }
    let(:folder_id)      { project_folder.id }

    context 'when passing valid params' do
      let(:project_folder) { create(:project_folder) }
      let(:user)           { create(:user) }

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
          expect(moderator.project_folder_moderator?(project_folder)).to be_truthy
        end

        example_request 'It allows the deletion of a folder moderator' do
          moderator.reload
          json_response       = json_parse(response_body)
          serializer_mock     = serialize_moderators(admin, moderator)

          expect(status).to eq(200)
          expect(moderator.project_folder_moderator?(project_folder)).to be_falsy
          expect(json_response).to be_present
          expect(response_body).to eq serializer_mock
        end
      end

      context 'when current_user is a project folder moderator of the given folder_id' do
        before do
          header_token_for(moderator)
          expect(moderator.project_folder_moderator?(project_folder)).to be_truthy
        end

        example_request 'It allows the deletion of a folder moderator' do
          moderator.reload
          json_response       = json_parse(response_body)
          serializer_mock     = serialize_moderators(moderator, moderator)

          expect(status).to eq(200)
          expect(moderator.project_folder_moderator?(project_folder)).to be_falsy
          expect(json_response).to be_present
          expect(response_body).to eq serializer_mock
        end
      end

      context 'when current_user is a project folder moderator but not of the given folder_id' do
        let(:another_project_folder) { create(:project_folder) }
        let(:another_moderator) { create(:project_folder_moderator, project_folder: another_project_folder) }

        before do
          header_token_for(another_moderator)
          expect(moderator.project_folder_moderator?(project_folder)).to be_truthy
          expect(moderator.project_folder_moderator?(another_project_folder)).to be_falsy
          expect(another_moderator.project_folder_moderator?(another_project_folder)).to be_truthy
          expect(another_moderator.project_folder_moderator?(project_folder)).to be_falsy
        end

        example_request 'It returns an unauthorized status' do
          expect(status).to eq(401)
        end
      end
    end
  end
end
