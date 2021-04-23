module EmailCampaigns
  class ApplicationMailer < ApplicationMailer
    layout 'mailer'

    before_action do
      @command, @campaign = params.values_at(:command, :campaign)
    end

    def campaign_mail
      I18n.with_locale(locale) do
        mail(default_config, &:mjml).tap do |message|
          message.mailgun_headers = mailgun_headers if self.class.delivery_method == :mailgun
        end
      end
    end

    attr_reader :command, :campaign

    helper_method :command, :campaign, :event

    private

    def format_message(key, component: nil, escape_html: true, values: {})
      group = component || @campaign.class.name.demodulize.underscore
      msg = t("email_campaigns.#{group}.#{key}", values)
      escape_html ? msg : msg.html_safe
    end

    def reply_to_email
      command[:reply_to] || super
    end

    def event
      @event ||= to_deep_struct(command[:event_payload])
    end

    def mailgun_headers
      super.tap do |headers|
        headers['X-Mailgun-Variables'].merge!('cl_campaign_id' => campaign.id)
      end
    end
  end
end
