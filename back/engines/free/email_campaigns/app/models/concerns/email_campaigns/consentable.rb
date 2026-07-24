# frozen_string_literal: true

module EmailCampaigns
  module Consentable
    extend ActiveSupport::Concern

    def self.consentable_campaign_types(_classes, user, service = nil)
      service ||= DeliveryService.new
      service.campaign_classes
        .select { |claz| claz.respond_to?(:consentable_for?) && claz.consentable_for?(user) }
        .map(&:name)
    end

    included do
      recipient_filter :filter_users_with_consent
    end

    class_methods do
      def consentable_for?(user)
        roles = respond_to?(:consentable_roles) ? consentable_roles : []
        return true if roles.blank?

        roles.any? do |role|
          user.send(:"#{role}?")
        end
      end

      # Opt-in campaigns override this to false, so a missing row means "not consented".
      def consented_by_default?
        true
      end
    end

    def filter_users_with_consent(users_scope, _options = {})
      if self.class.consented_by_default?
        opted_out = Consent.where(campaign_type: type, consented: false).pluck(:user_id)
        users_scope.where.not(id: opted_out)
      else
        opted_in = Consent.where(campaign_type: type, consented: true).pluck(:user_id)
        users_scope.where(id: opted_in)
      end
    end
  end
end
