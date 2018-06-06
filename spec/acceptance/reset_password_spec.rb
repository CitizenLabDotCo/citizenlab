require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Users" do

  explanation "Users who forgot their password can request a password reset email."

  header "Content-Type", "application/json"
  before do
    @user = create(:user)
  end

  context "when not authenticated" do

    post "web_api/v1/users/reset_password_email" do
      with_options scope: :user do
        parameter :email, "The email of the user for whom the password should be reset", required: true
      end
      let (:email) { @user.email }

      example_request "Trigger email with password reset link" do
        expect(status).to eq 202
      end
    end

    post "web_api/v1/users/reset_password" do
      before do
        @user.update(reset_password_token: ResetPasswordService.new.generate_reset_password_token(@user))
      end
      with_options scope: :user do
        parameter :token, "The password reset token received through the params in the reset link", required: true
        parameter :password, "The new password", required: true
      end
      response_field :token, "Array containing objects with signature {error: 'invalid'}", scope: :errors

      let(:password) { "new_password" }
      let(:token) { @user.reload.reset_password_token }

      example_request "Reset password using token" do
        expect(status).to eq 200
        expect(@user.reload.reset_password_token).to be_nil
        expect(@user.authenticate(password)).to be_truthy
      end

      example "[error] Reset password using invalid token" do
        do_request(user: {password: password, token: 'abcabcabc'})
        expect(status).to be 401
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors, :token)).to eq [{error: 'invalid', value: 'abcabcabc'}]
      end
    end
  end
end
