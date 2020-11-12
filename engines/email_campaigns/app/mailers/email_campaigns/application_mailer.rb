module EmailCampaigns
  class ApplicationMailer < ActionMailer::Base
    add_template_helper CampaignHelper

    default from: ENV.fetch("DEFAULT_FROM_EMAIL", 'hello@citizenlab.co')
    default reply_to: ENV.fetch("DEFAULT_FROM_EMAIL", 'hello@citizenlab.co')
    layout 'mailer'

    def campaign_mail campaign, command
      recipient = command[:recipient]
      
      @url_service = Frontend::UrlService.new
      @cta = {}
      @locale = recipient.locale
      @user = recipient
      @tenant = Tenant.current
      @campaign = campaign
      @command = command

      I18n.with_locale(@locale) do
        message = mail(
          subject: subject,
          to: recipient.email
        ) do |format|
          format.mjml
        end
        if (ActionMailer::Base.delivery_method == :mailgun)
          message.mailgun_headers = {
            'X-Mailgun-Variables' => {
              'cl_tenant_id' => @tenant.id,
              'cl_campaign_id' => campaign.id,
              'cl_user_id' => recipient.id,
            }.to_json,
          }
        end
        message
      end
    end


    protected

    def subject
      ''
    end
  end
end
