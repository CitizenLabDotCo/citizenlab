module EmailCampaigns
  class TasksService
    def schedule_email_campaigns
      time = Time.zone.now
      EmailCampaigns::TriggerOnScheduleJob.perform_later(time.to_i)
    end

    def assure_campaign_records
      EmailCampaigns::AssureCampaignsService.new.assure_campaigns
    end

    def remove_deprecated
      EmailCampaigns::AssureCampaignsService.new.remove_deprecated_campaigns
    end

    def remove_consents(emails_url)
      emails = open(emails_url).readlines.map(&:strip).map(&:downcase)
      Rails.logger.info "Found #{emails.size} emails"

      users = User.where(email: emails).all
      Rails.logger.info "Found #{users.size} users in #{tenant.name}"

      users.each do |user|
        consentable_campaign_types = EmailCampaigns::DeliveryService.new.consentable_campaign_types_for(user)
        consentable_campaign_types.each do |campaign_type|
          EmailCampaigns::Consent
            .find_or_initialize_by(user_id: user.id, campaign_type: campaign_type)
            .update_attributes!(consented: false)
        end
      end
    end

    def ensure_unsubscription_tokens
      User
        .left_joins(:email_campaigns_unsubscription_token)
        .where(email_campaigns_unsubscription_tokens: {token: nil}).ids.each do |user_id|
        EmailCampaigns::UnsubscriptionToken.create!(user_id: user_id)
      end
    end

    def update_user_digest_schedules
      camp = EmailCampaigns::Campaigns::UserDigest.first
      camp.update(ic_schedule: camp.class.default_schedule) if camp
    end
  end
end

EmailCampaigns::TasksService.prepend_if_ee('MultiTenancy::Patches::EmailCampaigns::TasksService')
