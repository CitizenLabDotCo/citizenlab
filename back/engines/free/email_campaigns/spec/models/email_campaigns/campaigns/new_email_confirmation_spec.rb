# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewEmailConfirmation do
  describe 'NewEmailConfirmation Campaign default factory' do
    it 'is valid' do
      expect(build(:new_email_confirmation_campaign)).to be_valid
    end
  end

  it 'cannot be disabled' do
    expect(build(:new_email_confirmation_campaign).can_be_disabled?).to be(false)
  end

  it 'is excluded from the scheduled/activity send pipeline' do
    # It is only delivered directly via DeliveryService#send_now_to_user.
    expect(create(:new_email_confirmation_campaign).run_filter_hooks).to be(false)
  end
end
