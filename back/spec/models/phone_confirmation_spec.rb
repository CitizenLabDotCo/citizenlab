# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PhoneConfirmation do
  describe '#confirm!' do
    it 'stamps phone_confirmed_at and clears the confirmation code' do
      user = create(:user, phone: '+14155552671')
      confirmation = user.find_or_create_confirmation(:phone_confirmation)
      confirmation.update!(code: '1234', code_sent_at: Time.zone.now)

      expect(confirmation.confirm!).to be true

      user.reload
      expect(user.phone_confirmed_at).to be_present
      expect(confirmation.reload.code).to be_nil
    end

    it "cancels other users' pending change requests targeting the same number" do
      other = create(:user, new_phone: '+14155552671')
      user = create(:user, phone: '+14155552671')

      user.find_or_create_confirmation(:phone_confirmation).confirm!

      expect(other.reload.new_phone).to be_nil
    end
  end

  describe '#generate_code' do
    it "returns '1234' when the sms use_test_mode setting is enabled" do
      config = AppConfiguration.instance
      config.settings['sms'] = { 'allowed' => true, 'enabled' => true, 'use_test_mode' => true }
      config.save!

      user = create(:user)
      expect(user.find_or_create_confirmation(:phone_confirmation).generate_code).to eq('1234')
    end
  end

  describe '#pending?' do
    it 'is true only when the phone is set and not yet confirmed' do
      user = create(:user)
      confirmation = user.find_or_create_confirmation(:phone_confirmation)
      expect(confirmation.pending?).to be false

      user.update!(phone: '+14155552671')
      expect(confirmation.pending?).to be true

      user.update!(phone_confirmed_at: Time.zone.now)
      expect(confirmation.pending?).to be false
    end
  end
end
