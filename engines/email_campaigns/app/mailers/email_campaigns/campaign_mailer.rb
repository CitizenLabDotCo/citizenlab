module EmailCampaigns
  class CampaignMailer < ActionMailer::Base

    attr_reader :command, :campaign, :recipient, :tenant

    private

    def from_name sender_type, author, recipient
      if sender_type == 'author'
        "#{author.first_name} #{author.last_name}"
      elsif sender_type == 'organization'
        MultilocService.new.t(Tenant.settings('core', 'organization_name'), recipient)
      end
    end

    def liquid_params user
      {
        'first_name' => user.first_name,
        'last_name' => user.last_name,
        'locale' => user.locale,
        'email' => user.email,
        'unsubscription_token' => EmailCampaigns::UnsubscriptionToken.find_by(user_id: user.id)&.token
      }
    end

    def tenant_home_url
      home_url(tenant: tenant, locale: recipient.locale)
    end
  end
end
