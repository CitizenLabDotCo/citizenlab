require 'rails_helper'

RSpec.describe UserConfirmation::ExpireConfirmationCodeJob do
  let(:user) { create(:user_with_confirmation) }

  before do
    AppConfiguration.instance.activate_feature!('user_confirmation')
  end

  it 'changes the confirmation code' do
    expect { described_class.perform_now(user, user.email_confirmation_code) }
      .to(change(user, :email_confirmation_code))
  end
end
