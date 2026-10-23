# frozen_string_literal: true

module EmailCampaigns
  class ConsentPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        consentable_campaign_types = DeliveryService.new.consentable_campaign_types_for(user)
        scope.where(user_id: user.id, campaign_type: consentable_campaign_types)
      end
    end

    # Only active users manage all their email preferences. Inactive users (e.g. pending invitees)
    # can still unsubscribe from the email they got, through update_by_campaign_id?.
    def index?
      user&.active?
    end

    def update?
      user&.active? && update_by_campaign_id?
    end

    def update_by_campaign_id?
      user.present? &&
        user.id == record.user_id &&
        DeliveryService.new.consentable_campaign_types_for(user).include?(record.campaign_type)
    end
  end
end
