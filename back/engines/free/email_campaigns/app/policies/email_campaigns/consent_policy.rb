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
      user&.active? && update_by_campaign_id?
    end

    def update_by_campaign_id?
      # NOTE: User does not need to be active for this endpoint so they can always click unsubscribe from emails
      user.id == record.user_id &&
        DeliveryService.new.consentable_campaign_types_for(user).include?(record.campaign_type)
    end
  end
end
