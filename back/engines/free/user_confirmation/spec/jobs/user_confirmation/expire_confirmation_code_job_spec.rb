# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserConfirmation::ExpireConfirmationCodeJob do
  let(:user) { create(:user_with_confirmation) }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  it 'changes the confirmation code of an existing user record' do
    old_code = user.email_confirmation_code
    user.save!
    described_class.perform_now(user.id, user.email_confirmation_code)
    expect(user.reload.email_confirmation_code).not_to eq(old_code)
  end

  it 'does nothing when user record does not exist' do
    expect { described_class.perform_now(user, user.email_confirmation_code) }
      .not_to(change(user, :email_confirmation_code))
  end
end
