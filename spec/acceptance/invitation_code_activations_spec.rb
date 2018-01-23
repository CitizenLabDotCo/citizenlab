require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Invitation code activations" do

  before do
    header "Content-Type", "application/json"
    @group = create(:group)
    @invitation_code = create(:invitation_code, code: InvitationCode.generate_code, group: @group)
    @user = create(:user)
  end

  context "when authenticated" do
    before do
      token = Knock::AuthToken.new(payload: { sub: @user.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    post "web_api/v1/users/:user_id/invitation_code_activations" do
      with_options scope: :invitation_code_activation do
        parameter :code, "The code of the invitation code", required: true
      end

      let(:code) { @invitation_code.code }

      example_request "Activation of an invitation code for a user adds the user as a member of the corresponding group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(@group.refresh.memberships.size).to eq(1)
      end
    end

  end
end
