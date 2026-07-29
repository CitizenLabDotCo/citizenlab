# frozen_string_literal: true

module EmailCampaigns
  class SmsBalancePolicy < ApplicationPolicy
    def show?
      return false unless AppConfiguration.instance.feature_activated?('sms')

      active_admin_or_moderator?
    end
  end
end
