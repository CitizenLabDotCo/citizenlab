# frozen_string_literal: true

module EmailCampaigns
  module Sms
    # Consent across every campaign on an SMS use case, where ConsentService records it
    # for a single campaign.
    class UseCaseConsentService
      # A STOP silences the messaging service, so every campaign on that use case loses consent.
      def withdraw!(user, use_case)
        return if user.nil? || use_case.nil?

        consentable_campaign_classes_for(use_case).each do |campaign_class|
          consent = ConsentService.new.record!(user, campaign_class, consented: false)
          SideFxConsentService.new.after_update(consent, user)
        end
      end

      private

      def consentable_campaign_classes_for(use_case)
        DeliveryService.new.campaign_classes.select do |campaign_class|
          campaign_class < Campaigns::BaseSms &&
            campaign_class.sms_use_case == use_case &&
            campaign_class.include?(Consentable)
        end
      end
    end
  end
end
