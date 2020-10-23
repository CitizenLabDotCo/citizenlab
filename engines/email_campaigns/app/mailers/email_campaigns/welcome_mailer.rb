module EmailCampaigns
  class WelcomeMailer < ActionMailer::Base
    default from: ENV.fetch("DEFAULT_FROM_EMAIL", 'hello@citizenlab.co')
    default reply_to: ENV.fetch("DEFAULT_FROM_EMAIL", 'hello@citizenlab.co')

    def campaign_mail campaign, command
      recipient = command[:recipient]
      tenant = Tenant.current

      @first_name = recipient.first_name

      I18n.with_locale(recipient.locale) do
        message = mail(
          subject: "Greetingz!",
          to: recipient.email
        )
        if (ActionMailer::Base.delivery_method == :mailgun)
          message.mailgun_headers = {
            'X-Mailgun-Variables' => {
              'cl_tenant_id' => tenant.id,
              'cl_campaign_id' => campaign.id,
              'cl_user_id' => recipient.id,
            }.to_json,
          }
        end
        message
      end
    end


    private

    def prrt
      puts 'prrt'
    end

  end
end
