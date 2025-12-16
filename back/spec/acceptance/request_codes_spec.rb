# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Request codes' do
  before do
    set_api_content_type
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  post 'web_api/v1/user/request_code_unauthenticated' do
    with_options scope: :request_code do
      parameter :email, 'The email of the user requesting a confirmation code.', required: true
    end

    before do
      allow(RequestConfirmationCodeJob).to receive(:perform_now)
    end

    example 'It works with a passwordless user' do
      user = create(:user_no_password)
      do_request(request_code: { email: user.email })
      expect(response_status).to eq 200
      expect(RequestConfirmationCodeJob).to have_received(:perform_now).with(user).once
    end

    example 'It does not work with a user with password' do
      user = create(:user)
      do_request(request_code: { email: user.email })
      expect(response_status).to eq 401
      expect(RequestConfirmationCodeJob).not_to have_received(:perform_now)
    end

    example 'It does not work if user reached email_confirmation_code_reset_count' do
      user = create(:user_no_password, email_confirmation_code_reset_count: 4)
      do_request(request_code: { email: user.email })
      expect(response_status).to eq 401
      expect(RequestConfirmationCodeJob).not_to have_received(:perform_now)
    end

    example 'It does not work if new_email is present' do
      user = create(:user_no_password, new_email: 'new@email.com')
      expect(user.new_email).to eq 'new@email.com'
      do_request(request_code: { email: user.email })
      expect(response_status).to eq 401
    end
  end

  post 'web_api/v1/user/request_code_email_change' do
    with_options scope: :request_code do
      parameter :new_email, 'The email of the user requesting a confirmation code.', required: true
    end

    before do
      allow(RequestConfirmationCodeJob).to receive(:perform_now)
    end

    example 'It works with authenticated user' do
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_email: 'new_email@example.com' })
      expect(response_status).to eq 200
      expect(RequestConfirmationCodeJob).to have_received(:perform_now)
        .with(user, new_email: 'new_email@example.com').once
    end

    example 'It does not work if new_email is blank' do
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_email: '' })
      expect(response_status).to eq 422
      expect(RequestConfirmationCodeJob).not_to have_received(:perform_now)
    end

    example 'It does not work if user reached email_confirmation_code_reset_count' do
      user = create(:user)
      user.update_column(:email_confirmation_code_reset_count, 4)
      header_token_for(user)
      do_request(request_code: { new_email: 'new_email@example.com' })
      expect(response_status).to eq 401
      expect(RequestConfirmationCodeJob).not_to have_received(:perform_now)
    end
  end
end
