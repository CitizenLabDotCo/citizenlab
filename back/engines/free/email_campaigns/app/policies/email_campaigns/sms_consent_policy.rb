# frozen_string_literal: true

module EmailCampaigns
  class SmsConsentPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        sms_types = DeliveryService.new.sms_consentable_campaign_types_for(user)
        scope.where(user_id: user.id, campaign_type: sms_types)
      end
    end

    def index?
      user&.active?
    end

    def update?
      user&.active? &&
        user.id == record.user_id &&
        DeliveryService.new.sms_consentable_campaign_types_for(user).include?(record.campaign_type)
    end
  end
end
