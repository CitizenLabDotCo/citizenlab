# frozen_string_literal: true

module EmailCampaigns
  # Record-less policy for the tenant-wide SMS message balance. Mirrors who can
  # see the SMS campaigns themselves (CampaignPolicy#show?), so the balance never
  # 401s for someone who can already open the SMS messaging tab.
  class SmsBalancePolicy < ApplicationPolicy
    def show?
      return false unless AppConfiguration.instance.feature_activated?('sms')

      active_admin_or_moderator?
    end
  end
end
