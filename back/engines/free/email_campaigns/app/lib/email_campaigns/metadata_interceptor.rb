# frozen_string_literal: true

module EmailCampaigns
  # Runs right before a message is handed to its delivery method and prepares the message
  # for the delivery provider's specific requirements.
  #
  # In practice, this is mainly (but not only) about mapping the provider-neutral tracking
  # headers set by `ApplicationMailer#campaign_mail` onto whatever the provider needs in
  # order to echo them back in its webhooks.
  class MetadataInterceptor
    def self.delivering_email(message)
      case message.delivery_method
      when Railgun::Mailer then prepare_for_mailgun(message)
      end
    end

    def self.prepare_for_mailgun(message)
      # Mailgun echoes 'mailgun_variables' on every webhook event.
      message.mailgun_variables = {
        'cl_tenant_id' => message[ApplicationMailer::TENANT_ID_HEADER]&.value,
        'cl_delivery_id' => message[ApplicationMailer::DELIVERY_ID_HEADER]&.value
      }.compact

      # `Railgun::Mailer#deliver!` reads the sending domain from `mail[:domain]` (and strips it).
      from_address = message.from&.first
      message[:domain] = from_address.split('@').last if from_address
    end
    private_class_method :prepare_for_mailgun
  end
end
