# frozen_string_literal: true

module EmailCampaigns
  class ApplicationMailer < ApplicationMailer
    layout 'campaign_mailer'

    # Provider-neutral tracking headers, set on every campaign mail. `MetadataInterceptor`
    # adapts them to the delivery provider right before sending.
    TENANT_ID_HEADER = 'X-GoVocal-Tenant-Id'
    DELIVERY_ID_HEADER = 'X-GoVocal-Delivery-Id'

    before_action do
      @command, @campaign = params.values_at(:command, :campaign)
      @user = @command[:recipient]
      # Set by DeliveryService#send_email_preview. Only changed in memory, never saved.
      @user.locale = @command[:locale] if @user && @command[:locale]
    end

    # The bounce belongs to the user's current email. Mailers that send to
    # another address override this.
    def self.undeliverable_to?(recipient)
      !!recipient&.email_bounced?
    end

    def campaign_mail
      I18n.with_locale(locale.locale_sym) do
        mail(default_config, &:mjml).tap do |message|
          message[TENANT_ID_HEADER] = app_configuration.id
          # Absent when no before_send hook ran (admin previews, stored examples).
          message[DELIVERY_ID_HEADER] = command[:delivery_id] if command[:delivery_id]
          # Still rendered, so previews work, but never sent. Also stops queued
          # emails for users whose address bounced after the email was queued.
          message.perform_deliveries = false if self.class.undeliverable_to?(recipient)
        end
      end
    end

    attr_reader :command, :campaign

    helper_method :command, :campaign, :event, :show_unsubscribe_link?, :cta_button_text

    private

    def show_unsubscribe_link?
      user && campaign.class.try(:consentable_for?, user)
    end

    def show_terms_link?
      true
    end

    def show_privacy_policy_link?
      true
    end

    # Format a non-editable message - use `EditableWithPreview.format_editable_region` when editable.
    def format_message(key, component: nil, escape_html: true, values: {})
      group = component || @campaign.class.name.demodulize.underscore
      msg = t("email_campaigns.#{group}.#{key}", **values)
      escape_html ? msg : msg.html_safe
    end

    def reply_to_email
      command[:reply_to] || @campaign.reply_to.presence || super
    end

    def event
      @event ||= to_deep_struct(command&.dig(:event_payload))
    end
  end
end
