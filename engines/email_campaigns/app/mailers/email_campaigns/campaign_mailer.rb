module EmailCampaigns
  class CampaignMailer < ActionMailer::Base
    default from: ENV.fetch("DEFAULT_FROM_EMAIL", 'hello@citizenlab.co')
    layout 'mailer'

    def campaign_mail campaign, recipient
      multiloc_service = MultilocService.new

      message = mail(
        from: "#{from_name(campaign.sender, campaign.author, recipient)} <#{ENV.fetch("DEFAULT_FROM_EMAIL", 'hello@citizenlab.co')}>",
        to: recipient.email,
        reply_to: "#{from_name(campaign.sender, campaign.author, recipient)} <#{ENV.fetch("DEFAULT_FROM_EMAIL", 'hello@citizenlab.co')}>",
        subject: multiloc_service.t(campaign.subject_multiloc, recipient),
        body: multiloc_service.t(campaign.body_multiloc, recipient)
      )
      # message.mailgun_headers = {
      #   'cl_campaign_id' => campaign.id
      # }
    end

    
    private

    def from_name sender_type, author, recipient
      if sender_type == 'author'
        "#{author.first_name} #{author.last_name}"
      elsif sender_type == 'organization'
        MultilocService.new.t(Tenant.settings(:core, :organization_name), recipient)
      end
    end

  end
end
