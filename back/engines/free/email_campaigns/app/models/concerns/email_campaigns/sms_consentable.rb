# frozen_string_literal: true

module EmailCampaigns
  # SMS counterpart of Consentable. Same filtering mechanism, but opt-IN: only
  # users with an explicit `consented: true` row receive the SMS.
  module SmsConsentable
    extend ActiveSupport::Concern

    def self.consentable_sms_campaign_types(_classes, user, service = nil)
      service ||= DeliveryService.new
      service.sms_campaign_classes
        .select { |claz| claz.respond_to?(:consentable_for?) && claz.consentable_for?(user) }
        .map(&:name)
    end

    included do
      recipient_filter :filter_users_with_sms_consent
    end

    class_methods do
      def consentable_for?(user)
        roles = respond_to?(:consentable_roles) ? consentable_roles : []
        return true if roles.blank?

        roles.any? do |role|
          user.send(:"#{role}?")
        end
      end
    end

    def filter_users_with_sms_consent(users_scope, _options = {})
      users_scope.where(id: SmsConsent.where(campaign_type: type, consented: true).select(:user_id))
    end
  end
end
