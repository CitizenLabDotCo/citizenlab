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
      let!(:user) { create(:project_folder_moderator, project_folder: folder) }

      let(:id) { user.id }
      let(:roles) { user.roles + [{ 'type' => 'admin' }] }

      describe do
        example 'Update a user' do
          do_request
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :roles)).to include(*user.roles.map(&:symbolize_keys))
        end
      end
    end
  end
end
