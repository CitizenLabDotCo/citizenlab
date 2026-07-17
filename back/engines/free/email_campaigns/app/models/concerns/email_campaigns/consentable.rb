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

      # Whether a user counts as consented when they have no consent row yet.
      # Opt-out campaigns (the default, e.g. email) treat a missing row as
      # consented; opt-in campaigns (e.g. marketing SMS) override this to false.
      def consented_by_default?
        true
      end
    end

    def filter_users_with_consent(users_scope, _options = {})
      if self.class.consented_by_default?
        # Opt-out: everyone except users who explicitly opted out.
        opted_out = Consent.where(campaign_type: type, consented: false).pluck(:user_id)
        users_scope.where.not(id: opted_out)
      else
        # Opt-in: only users who explicitly opted in.
        opted_in = Consent.where(campaign_type: type, consented: true).pluck(:user_id)
        users_scope.where(id: opted_in)
      end
    end
  end
end
