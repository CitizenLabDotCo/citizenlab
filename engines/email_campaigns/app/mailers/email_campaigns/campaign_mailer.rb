module EmailCampaigns
  class CampaignMailer < ActionMailer::Base
    default from: ENV.fetch("DEFAULT_FROM_EMAIL", 'hello@citizenlab.co')

    def campaign_mail campaign, command
      recipient = command[:recipient]
      multiloc_service = MultilocService.new

      body_html_with_liquid = multiloc_service.t(command[:body_multiloc], recipient)
      template = Liquid::Template.parse(body_html_with_liquid)
      @body_html = template.render(liquid_params(recipient))
      @body_text = ActionView::Base.full_sanitizer.sanitize(@body_html)

      @tenant_logo_url = Tenant.current.logo.versions[:medium].url

      message = mail(
        from: "#{from_name(command[:sender], command[:author], recipient)} <#{ENV.fetch("DEFAULT_FROM_EMAIL", 'hello@citizenlab.co')}>",
        to: recipient.email,
        reply_to: command[:reply_to],
        subject: multiloc_service.t(command[:subject_multiloc], recipient),
      )

      if (ActionMailer::Base.delivery_method == :mailgun)    
        message.mailgun_headers = {
          'X-Mailgun-Variables' => {
            'cl_campaign_id' => campaign.id,
            'cl_user_id' => recipient.id,     
          }.to_json,
        }
      end
    end
    
    private

    def from_name sender_type, author, recipient
      if sender_type == 'author'
        "#{author.first_name} #{author.last_name}"
      elsif sender_type == 'organization'
        MultilocService.new.t(Tenant.settings(:core, :organization_name), recipient)
      end
    end

    def liquid_params user
      {
        'first_name' => user.first_name,
        'last_name' => user.last_name,
        'locale' => user.locale,
        'email' => user.email,
      }
    end

  end
end
