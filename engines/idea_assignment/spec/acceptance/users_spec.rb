resource "Users" do
  explanation "Citizens and city administrators."
  context "when authenticated" do
    before do
      @user = create(:user, last_name: 'Hoorens')
      @users = ["Bednar", "Cole", "Hagenes", "MacGyver", "Oberbrunner"].map{|l| create(:user, last_name: l)}
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    context "when admin" do
      before do
        @user.update(roles: [{type: 'admin'}])
      end

      put "web_api/v1/users/:id" do
        let(:assignee) { create(:admin) }
        let!(:assigned_idea) { create(:idea, assignee: assignee) }
        let!(:assigned_initiative) { create(:initiative, assignee: assignee) }
        let(:id) { assignee.id }
        let(:roles) { [] }

        example_request "Remove user as assignee when losing admin rights" do
          expect(response_status).to eq 200
          expect(assignee.reload.admin?).to be_falsey
          expect(assigned_idea.reload.assignee_id).not_to eq id
          expect(assigned_initiative.reload.assignee_id).not_to eq id
        end
      end
    end
  end
end
