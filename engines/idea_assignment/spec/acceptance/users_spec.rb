require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Users' do
  explanation 'Citizens and city administrators.'

  context 'when admin' do
    before do
      header 'Content-Type', 'application/json'
      @users = %w[Bednar Cole Hagenes MacGyver Oberbrunner].map { |l| create(:user, last_name: l) }
      admin_header_token
    end

    put 'web_api/v1/users/:id' do
      with_options scope: 'user' do
        parameter :roles, 'Roles array, only allowed when admin'
      end

      let(:assignee) { create(:admin) }
      let!(:assigned_idea) { create(:idea, assignee: assignee) }
      let(:id) { assignee.id }
      let(:roles) { [] }

      example_request 'Remove user as assignee when losing admin rights' do
        expect(response_status).to eq 200
        expect(assignee.reload).not_to be_admin
        expect(assigned_idea.reload.assignee_id).not_to eq id
      end
    end
  end
end
