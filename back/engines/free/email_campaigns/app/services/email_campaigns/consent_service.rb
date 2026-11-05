# frozen_string_literal: true

module EmailCampaigns
  class ConsentService
    def record!(user, campaign_class, consented:, always_log: false)
      consent = Consent.find_or_initialize_by(user_id: user.id, campaign_type: campaign_class.name)
      consent.update!(consented: consented)
      SideFxConsentService.new.after_update(consent, user, always_log: always_log)
      consent
    end

    # Each SMS use case has its own messaging service at the provider, so its campaigns opt in and out together.
    def record_for_sms_use_case!(user, use_case, consented:)
      return if user.nil? || use_case.nil?

      consentable_campaign_classes_for(use_case).each do |campaign_class|
        record!(user, campaign_class, consented: consented)
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
