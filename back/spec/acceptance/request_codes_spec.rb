# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Request codes' do
  let(:mailer) do
    instance_double(
      ConfirmationsMailer,
      send_confirmation_code: instance_double(ActionMailer::MessageDelivery, deliver_now: true)
    )
  end

  before do
    set_api_content_type
    allow(ConfirmationsMailer).to receive(:with).and_return(mailer)
  end

  post 'web_api/v1/user/request_code_unauthenticated' do
    with_options scope: :request_code do
      parameter :email, 'The email of the user requesting a confirmation code.', required: true
    end

    example 'works if user has no password and has email confirmed' do
      user = create(:unconfirmed_user, email: 'test@test.com')
      user.email_confirmation.confirm!
      expect(user.password_digest).to be_nil
      expect(user.confirmation_required?).to be false

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 200
      expect(ConfirmationsMailer).to have_received(:with).with(user: user).once
      # Requesting a new code should not reset the confirmation_required value
      expect(user.reload.confirmation_required?).to be false
    end

    example 'works if user has no password and does not have email confirmed' do
      user = create(:unconfirmed_user, email: 'test@test.com')
      expect(user.password_digest).to be_nil
      expect(user.confirmation_required?).to be true

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 200
      expect(ConfirmationsMailer).to have_received(:with).with(user: user).once
    end

    example 'does not work if user has password and has email confirmed' do
      user = create(:user, email: 'test@test.com')
      expect(user.password_digest).not_to be_nil
      expect(user.confirmation_required?).to be false

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 401
      expect(ConfirmationsMailer).not_to have_received(:with)
    end

    # This is an edge case related to legacy users, where a user has a password set
    # but has not confirmed their email yet. This should not be possible anymore.
    example 'works if user has password and does not have email confirmed' do
      user = create(:unconfirmed_user, email: 'test@test.com', password_digest: 'super_secret')
      expect(user.password_digest).not_to be_nil
      expect(user.confirmation_required?).to be true

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 200
      expect(ConfirmationsMailer).to have_received(:with).with(user: user).once
    end

    example 'It does not work if user reached code_reset_count' do
      user = create(:unconfirmed_user)
      user.email_confirmation.update!(code_reset_count: 4)

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 401
      expect(ConfirmationsMailer).not_to have_received(:with)
    end

    example 'It does not work if new_email is present' do
      user = create(:unconfirmed_user, new_email: 'new@email.com')
      expect(user.new_email).to eq 'new@email.com'

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 401
      expect(ConfirmationsMailer).not_to have_received(:with)
    end
  end

  post 'web_api/v1/user/request_code_email_change' do
    with_options scope: :request_code do
      parameter :new_email, 'The email of the user requesting a confirmation code.', required: false
    end

    example 'It works with authenticated user' do
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_email: 'new_email@example.com' })
      expect(response_status).to eq 200
      expect(ConfirmationsMailer).to have_received(:with).with(user: user).once
      expect(user.reload.new_email).to eq 'new_email@example.com'
    end

    example 'It does not work if new_email is blank and new_email is not yet set on user' do
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_email: '' })
      expect(response_status).to eq 422
      expect(ConfirmationsMailer).not_to have_received(:with)
    end

    example 'It does not work if user reached code_reset_count' do
      user = create(:user)
      user.new_email_confirmation.update!(code_reset_count: 4)
      header_token_for(user)
      do_request(request_code: { new_email: 'new_email@example.com' })
      expect(response_status).to eq 401
      expect(ConfirmationsMailer).not_to have_received(:with)
    end
  end
end
