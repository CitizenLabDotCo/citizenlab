require 'rails_helper'

RSpec.describe UserConfirmation::ExpireConfirmationCodeJob do
  let(:user) { create(:user) }

  it 'changes the confirmation code' do
    expect { described_class.perform_now(user) }
      .to(change(user, :confirmation_code)
          .from(user.confirmation_code)
          .to(user.reload.confirmation_code))
  end
end
