# frozen_string_literal: true

module EmailCampaigns
  class ConsentPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        consentable_campaign_types = DeliveryService.new.consentable_campaign_types_for(user)
        scope.where(user_id: user.id, campaign_type: consentable_campaign_types)
      end
    end

    def index?
      user&.active?
    end

    def update?
      user&.active? &&
        user.id == record.user_id &&
        DeliveryService.new.consentable_campaign_types_for(user).include?(record.campaign_type)
    end

    def update_by_campaign_id?
      update?
    end
  end
end
