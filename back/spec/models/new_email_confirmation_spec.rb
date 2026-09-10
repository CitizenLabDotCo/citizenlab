# frozen_string_literal: true

require 'rails_helper'

RSpec.describe NewEmailConfirmation do
  describe '#confirm!' do
    it 'confirms the user email and deletes the confirmation' do
      user = create(:unconfirmed_user)
      user.email = nil
      user.new_email = 'test@email.com'
      user.save!

      expect(user.confirmation_required?).to be true
      confirmation = user.find_or_create_confirmation(:new_email_confirmation)
      confirmation.confirm!
      expect(user.confirmation_required?).to be false
      expect(user.email).to eq('test@email.com')
      expect(user.new_email_confirmation).to be_nil
      expect(described_class.where(id: confirmation.id)).to be_empty
    end

    it 'works if the user also has new_email and it is the same email' do
      email = 'test@email.com'
      user = create(:unconfirmed_user, email: email, new_email: email)
      expect(user.confirmation_required?).to be true
      user.find_or_create_confirmation(:new_email_confirmation).confirm!
      expect(user.confirmation_required?).to be false
      expect(user.email).to eq(email)
    end
  end
end
