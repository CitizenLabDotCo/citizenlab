require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Verifications" do
 
  explanation "A Verifications is an attempt from a user to get verified"

  before do
    @user = create(:user)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @tenant = Tenant.current
    settings = @tenant.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{name: 'cow'}],
    }
    @tenant.save!
  end

  post "web_api/v1/verification_methods/cow/verification" do
    with_options scope: :verification do
      parameter :run, "The RUN number of the citizen", required: true
      parameter :id_serial, "The ID card serial number of the citizen", required: true
    end

    let(:run) { "abcd" }
    let(:id_serial) { "1234" }

    example_request "Verify with cow" do
      expect(status).to eq(201)
      expect(@user.reload.verified).to be true
      expect(@user.verifications.first).to have_attributes({
        method_name: "cow",
        user_id: @user.id,
        active: true,
        hashed_uid: 'eb7beb9d44a75e8ca7faee42ceb03d8272d4ae20ec603f9833f4d33f32e9b911'
      })
    end
  end

end
