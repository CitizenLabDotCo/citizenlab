# frozen_string_literal: true

module EmailCampaigns
  class ApplicationMailer < ApplicationMailer
    layout 'campaign_mailer'

    before_action do
      @command, @campaign = params.values_at(:command, :campaign)
      @user = @command[:recipient]
    end

    def campaign_mail
      I18n.with_locale(locale.locale_sym) do
        mail(default_config, &:mjml).tap do |message|
          message.mailgun_headers = mailgun_headers if self.class.delivery_method == :mailgun
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

    # To format a non-editable message, use `format_message`.
    def format_message(key, component: nil, escape_html: true, values: {})
      group = component || @campaign.class.name.demodulize.underscore
      msg = t("email_campaigns.#{group}.#{key}", **values)
      escape_html ? msg : msg.html_safe
    end

    def reply_to_email
      command[:reply_to] || super
    end

    def event
      @event ||= to_deep_struct(command[:event_payload])
    end

    def mailgun_variables
      super.merge!('cl_campaign_id' => campaign.id)
    end
  end
end
