require 'rails_helper'

RSpec.describe UserConfirmation::ExpireConfirmationCodeJob do
  let(:user) { create(:user) }

  it 'changes the confirmation code' do
    expect { described_class.perform_now(user, user.email_confirmation_code) }
      .to(change(user, :email_confirmation_code)
          .from(user.email_confirmation_code)
          .to(nil))
  end
end
