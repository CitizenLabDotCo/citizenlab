# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailConfirmation do
  describe '#confirm!' do
    it 'confirms the user email and clears the confirmation code' do
      user = create(:unconfirmed_user)
      expect(user.confirmation_required?).to be true
      user.email_confirmation.confirm!
      expect(user.confirmation_required?).to be false
    end

    it 'works if the user also has new_email and it is the same email' do
      email = 'test@email.com'
      user = create(:unconfirmed_user, email: email, new_email: email)
      expect(user.confirmation_required?).to be true
      user.email_confirmation.confirm!
      expect(user.confirmation_required?).to be false
    end
  end
end