# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::SmsConsent do
  describe '.create_all_for_user!' do
    it 'creates a not-consented (opt-in) row for each SMS campaign type' do
      user = create(:user)

      expect { described_class.create_all_for_user!(user) }
        .to change { described_class.where(user: user).count }.from(0).to(EmailCampaigns::DeliveryService.new.sms_campaign_types.size)

      expect(described_class.where(user: user).pluck(:consented)).to all(be false)
    end

    it 'does not duplicate rows on a second call' do
      user = create(:user)
      described_class.create_all_for_user!(user)

      expect { described_class.create_all_for_user!(user) }
        .not_to change { described_class.where(user: user).count }
    end
  end
end
