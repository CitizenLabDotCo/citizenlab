require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Users' do
  explanation 'Citizens and city administrators.'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'when admin' do
    before do
      @user = create :admin
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    put 'web_api/v1/users/:id' do
      with_options scope: 'user' do
        parameter :roles, 'Roles array, only allowed when admin'
      end
      ValidationErrorHelper.new.error_fields self, User

      let(:assignee) { create(:admin) }
      let(:id) { assignee.id }
      let(:roles) { [] }

      example 'Remove user as assignee when losing admin rights', document: false do
        assigned_idea = create :idea, assignee: assignee
        assigned_initiative = create :initiative, assignee: assignee

        do_request

        expect(response_status).to eq 200
        expect(assignee.reload).not_to be_admin
        expect(assigned_idea.reload.assignee_id).to be_blank
        expect(assigned_initiative.reload.assignee_id).to be_blank
      end
    end

    delete 'web_api/v1/users/:id' do
      let(:assignee) { create(:admin) }
      let(:id) { assignee.id }

      example 'Remove deleted user as assignee', document: false do
        assigned_idea = create :idea, assignee: @subject_user
        assigned_initiative = create :initiative, assignee: @subject_user

        do_request

        expect(response_status).to eq 200
        expect(assigned_idea.reload.assignee).to be_blank
        expect(assigned_initiative.reload.assignee).to be_blank
      end
    end
  end
end
