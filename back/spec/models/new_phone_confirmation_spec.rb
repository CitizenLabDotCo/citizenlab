# frozen_string_literal: true

require 'rails_helper'

RSpec.describe NewPhoneConfirmation do
  describe '#confirm!' do
    it 'promotes new_phone to phone, stamps confirmed_at and clears the code' do
      user = create(:user)
      user.update!(new_phone: '+14155552671')
      user.new_phone_confirmation.update!(code: '1234', code_sent_at: Time.zone.now)

      expect(user.new_phone_confirmation.confirm!).to be true

      user.reload
      expect(user.phone).to eq('+14155552671')
      expect(user.new_phone).to be_nil
      expect(user.phone_confirmed_at).to be_present
      expect(user.new_phone_confirmation.code).to be_nil
    end

    it 'returns false when there is no pending phone number' do
      user = create(:user)
      expect(user.new_phone_confirmation.confirm!).to be false
      expect(user.reload.phone).to be_nil
    end

    it "cancels other users' pending change requests targeting the same number" do
      other = create(:user, new_phone: '+14155552671')
      user = create(:user, new_phone: '+14155552671')

      user.new_phone_confirmation.confirm!

      expect(other.reload.new_phone).to be_nil
    end
  end

  describe '#generate_code' do
    it "returns '1234' when the sms use_dummy_code setting is enabled" do
      config = AppConfiguration.instance
      config.settings['sms'] = { 'allowed' => true, 'enabled' => true, 'use_dummy_code' => true }
      config.save!

      user = create(:user)
      expect(user.new_phone_confirmation.generate_code).to eq('1234')
    end
  end

  describe '#pending?' do
    it 'is true only when a new_phone is set' do
      user = create(:user)
      expect(user.new_phone_confirmation.pending?).to be false

      user.update!(new_phone: '+14155552671')
      expect(user.new_phone_confirmation.pending?).to be true
    end
  end
end
