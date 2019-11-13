require 'rails_helper'
require 'rspec_api_documentation/dsl'


describe "Omniauth flow" do

  before do
    @user = create(:user)
    @token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    host! 'example.org'
  end

  describe "bosa_fas" do
    before do
      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[:bosa_fas] = OmniAuth::AuthHash.new({
        :provider => 'bosa_fas',
        :uid => '93051822361',
        info: {
          last_name: 'Verhipperd',
          email: nil,
          first_name: 'Hypoliet',
        }
      })
      @tenant = Tenant.current
      settings = @tenant.settings
      settings['verification'] = {
        allowed: true,
        enabled: true,
        verification_methods: [{name: 'bosa_fas', environment: 'integration', identifier: 'fake', secret: 'fake'}],
      }
      @tenant.save!
    end

    it "successfully verifies a user" do
      get "/auth/bosa_fas?token=#{@token}&random-passthrough-param=somevalue"
      follow_redirect!

      expect(response).to redirect_to("/en/verification-success?random-passthrough-param=somevalue")

      expect(@user.reload).to have_attributes({
        verified: true,
        first_name: 'Hypoliet',
        last_name: 'Verhipperd'
      })
      expect(@user.verifications.first).to have_attributes({
        method_name: "bosa_fas",
        user_id: @user.id,
        active: true,
        hashed_uid: 'b711c606279e1e0ee103a05c6cadc93cd65210f705ccf4b9dcbd1a68af0a33b9'
      })
    end
  end
end