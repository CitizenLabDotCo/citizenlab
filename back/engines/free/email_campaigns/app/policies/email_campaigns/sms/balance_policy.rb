# frozen_string_literal: true

module EmailCampaigns
  class Sms::BalancePolicy < ApplicationPolicy
    def show?
      config = AppConfiguration.instance
      return false unless config.feature_activated?('sms') && config.feature_activated?('sms_manual_campaigns')

      active_admin_or_moderator?
    end
  end
end
