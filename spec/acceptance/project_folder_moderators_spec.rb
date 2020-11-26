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
    let(:project_folder) { create(:project_folder) }
    let(:other_project_folder) { create(:project_folder) }

    before do
      create_list(:user, 3).each do |u|
        u.add_project_folder_moderator_role(project_folder)
        u.save
      end

      create_list(:user, 3).each do |u|
        u.add_project_folder_moderator_role(other_project_folder)
        u.save
      end
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
      before do
        header_token_for(admin)
      end

      let(:admin) { create(:admin) }

      example_request 'It authorizes the user' do
        expect(status).to eq(200)
      end

      example_request 'It returns a serialized json with all project folder moderators' do
        json_response       = json_parse(response_body)
        serializer_response = serialize_moderators(User.project_folder_moderator, admin)

        expect(json_response.dig(:data).length).to eq 6
        expect(response_body).to eq serializer_response
      end
    end

    context 'when current_user is another project folder moderator' do
      before do
        project_folder_moderator.add_project_folder_moderator_role(other_project_folder)
        project_folder_moderator.save
        header_token_for(project_folder_moderator)
      end

      let(:project_folder_moderator) { create(:user) }

      example_request 'It authorizes the user' do
        expect(status).to eq(200)
      end
    end
  end
end
