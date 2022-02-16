require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Users' do
  explanation 'Citizens and city administrators.'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'when authenticated as an admin' do
    before do
      admin_header_token
    end

    put 'web_api/v1/users/:id' do
      with_options scope: 'user' do
        parameter :roles, 'Roles array, only allowed when admin'
      end

      ValidationErrorHelper.new.error_fields(self, User)

      let!(:folder) { create(:project_folder) }
      let!(:user) { create(:project_folder_moderator, project_folders: [folder]) }

      let(:id) { user.id }
      let(:roles) { user.roles + [{ 'type' => 'admin' }] }

      describe do
        example 'Update a user' do
          do_request
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :roles)).to include(*user.roles.map(&:symbolize_keys))
        end

        example 'Clear project moderator rights, removes user as assignee', document: false do
          idea = create :idea, assignee: user, project: create(:project, folder: folder)
          do_request user: { roles: [] }

          expect(response_status).to eq 200
          expect(user.reload.roles).to eq []
          expect(idea.reload).to be_valid
        end
      end
    end
  end
end
