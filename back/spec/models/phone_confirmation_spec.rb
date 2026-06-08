# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PhoneConfirmation do
  let(:user) { create(:user, phone_number: '+14155552671') }
  let(:confirmation) { described_class.create!(user: user, code: '1234') }

  describe '#confirm!' do
    it 'marks the phone number as verified and clears the code' do
      expect { confirmation.confirm! }
        .to change { user.reload.phone_number_verified_at }.from(nil)

      expect(confirmation.reload.code).to be_nil
      expect(user.reload.phone_verified?).to be true
    end
  end

  describe '#pending?' do
    it 'is true before verification and false after' do
      expect(confirmation.pending?).to be true
      confirmation.confirm!
      expect(confirmation.pending?).to be false
    end
  end

  describe 'reusing the Confirmation code machinery' do
    it 'resets the code and retry count' do
      confirmation.update!(code_retry_count: 3)
      confirmation.reset_code!
      expect(confirmation.code_retry_count).to eq(0)
      expect(confirmation.code).to be_present
    end
  end
end
