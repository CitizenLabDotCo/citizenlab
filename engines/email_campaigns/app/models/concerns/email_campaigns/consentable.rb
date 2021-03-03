module EmailCampaigns
  module Consentable
    extend ActiveSupport::Concern

    def self.consentable_campaign_types classes, user
      DeliveryService.campaign_classes
        .select{|claz| claz.respond_to?(:consentable_for?) && claz.consentable_for?(user)}
        .map(&:name)
    end

    included do
      recipient_filter :filter_users_with_consent
    end

    class_methods do
      def consentable_for? user
        roles = respond_to?(:consentable_roles) ? consentable_roles : []
        return true if roles.blank?

        roles.any? do |role|
          user.send("#{role}?")
        end
      end
    end

    def filter_users_with_consent users_scope, options={}
      users_scope
      .where.not(id: Consent.where(campaign_type: type, consented: false).pluck(:user_id))
    end
  end
end
