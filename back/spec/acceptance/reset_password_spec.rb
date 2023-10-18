# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Users' do
  before do
    header 'Content-Type', 'application/json'
    @user = create(:user, email: 's.hoorens@gmail.com')
  end

  context 'when not authenticated' do
    post 'web_api/v1/users/reset_password_email' do
      with_options scope: :user do
        parameter :email, 'The email of the user for whom the password should be reset', required: true
      end
      let(:email) { @user.email }

      example_request 'Trigger email with password reset link' do
        expect(status).to eq 202
      end

      describe 'Email matching on password reset' do
        example 'is case insensitive' do
          do_request(user: { email: 'S.Hoorens@gmail.com' })
          expect(status).to eq 202
        end

        example 'does not use underscores in a special manner' do
          do_request(user: { email: 's_hoorens@gmail.com' })
          expect(status).to eq 202
        end

        example 'does not use percentages in a special manner' do
          do_request(user: { email: '%hoorens@gmail.com%' })
          expect(status).to eq 202
        end
      end

      example '[error] Request password reset of an invitee' do
        do_request(user: { email: create(:invited_user).email })
        expect(status).to eq 202
      end
    end

    post 'web_api/v1/users/reset_password' do
      before do
        @user.update!(reset_password_token: ResetPasswordService.new.generate_reset_password_token(@user))
      end

      with_options scope: :user do
        parameter :token, 'The password reset token received through the params in the reset link', required: true
        parameter :password, 'The new password', required: true
      end
      response_field :token, "Array containing objects with signature {error: 'invalid'}", scope: :errors

      let(:password) { 'new_password' }
      let(:token) { @user.reload.reset_password_token }

      example_request 'Reset password using token' do
        expect(status).to eq 200
        expect(@user.reload.reset_password_token).to be_nil
        expect(@user.authenticate(password)).to be @user
      end

      example '[error] Reset password using invalid token' do
        do_request(user: { password: password, token: 'abcabcabc' })
        expect(status).to be 401
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors, :token)).to eq [{ error: 'invalid', value: 'abcabcabc' }]
      end

      example '[error] Reset password reset of an invitee' do
        invitee = create(:invited_user)
        token = ResetPasswordService.new.generate_reset_password_token invitee
        invitee.update!(reset_password_token: token)

        do_request(user: { password: password, token: token })
        expect(status).to eq 401
      end
    end
  end
end
