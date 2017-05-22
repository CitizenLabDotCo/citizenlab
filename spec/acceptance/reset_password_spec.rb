require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Users" do

  header "Content-Type", "application/json"
  before do
    @user = create(:user)
  end

  context "when not authenticated" do


    post "api/v1/users/reset_password_email" do
      with_options scope: :user do
        parameter :email, "The email of the user for whom the password should be reset", required: true
      end

      let (:email) { @user.email }
      example_request "Trigger email with password reset link" do
        expect(status).to eq 202
        expect {
          UserMailer.reset_password.deliver_later
        }.to have_enqueued_job.on_queue('mailers')
      end
    end

    post "api/v1/users/reset_password" do

      before do
        @user.update(reset_password_token: ResetPasswordService.new.generate_reset_password_token(@user))
      end

      with_options scope: :user do
        parameter :token, "The password reset token received through the params in the reset link", required: true
        parameter :password, "The new password", required: true
      end

      let(:password) { "new_password" }
      let(:token) { @user.reload.reset_password_token }


      example_request "Reset password using token" do
        expect(status).to eq 200
        expect(@user.reload.reset_password_token).to be_nil
        expect(@user.authenticate(password)).to be_truthy
      end
    end

  end

end
