module EmailCampaigns
  class ApplicationMailer < ActionMailer::Base
    add_template_helper CampaignHelper

    def self.sender_email
      ENV.fetch("DEFAULT_FROM_EMAIL", 'hello@citizenlab.co')
    end
    default from: self.sender_email
    default reply_to: ENV.fetch("DEFAULT_FROM_EMAIL", 'hello@citizenlab.co')
    layout 'mailer'

    def campaign_mail campaign, command
      recipient = command[:recipient]
      
      @url_service = Frontend::UrlService.new
      @multiloc_service = MultilocService.new
      @locale = recipient.locale
      @user = recipient
      @tenant = Tenant.current
      @campaign = campaign
      @command = command

      I18n.with_locale(@locale) do
        sender_name = @multiloc_service.t(@tenant.settings.dig('core','organization_name'), @user)
        recipient_name = UserDisplayNameService.new(@tenant, recipient).display_name recipient
        message = mail(
          subject: subject,
          from: %("#{sender_name}" <#{self.class.sender_email}>),
          to: %("#{recipient_name}" <#{recipient.email}>) 
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
      raise NotImplementedError 
    end

  end
end
