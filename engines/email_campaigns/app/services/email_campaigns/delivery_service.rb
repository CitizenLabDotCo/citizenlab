module EmailCampaigns
  class DeliveryService

    CAMPAIGN_CLASSES = [
      Campaigns::Manual,
      Campaigns::CommentOnYourComment,
      Campaigns::AdminDigest
    ]

    def campaign_types
      CAMPAIGN_CLASSES.map(&:name).uniq
    end

    def consentable_campaign_types_for user
      consentable_classes = CAMPAIGN_CLASSES
        .select{|claz| claz.respond_to?(:consentable_for?) && claz.consentable_for?(user)}
        .map(&:name)
        .uniq
    end

    # called every hour
    def send_on_schedule time=Time.now
      campaign_candidates = Campaign.where(type: campaign_types)
      apply_send_pipeline(campaign_candidates, time: time)
    end

    #  called on every activity
    def send_on_activity activity
      campaign_candidates = Campaign.where(type: campaign_types)
      apply_send_pipeline(campaign_candidates, activity: activity)
    end

    #  called when explicit send is requested by human
    def send_now campaign
      apply_send_pipeline([campaign])
    end

    private

    # Takes options, either
    # * time: Time object when the sending command happened
    # * activity: Activity object which activity happened
    def apply_send_pipeline campaign_candidates, options={}
      campaign_candidates
        .select{|campaign| campaign.run_before_send_hooks(options)}
        .flat_map do |campaign| 
          recipients = campaign.apply_recipient_filters(options)
          recipients.zip([campaign].cycle)
        end
        .each do |(recipient, campaign)|
          command = campaign.generate_command(
            recipient: recipient,
            **options
          ).merge({
            recipient: recipient,
          })

          if campaign.respond_to? :mailer_class
            send_command_internal(campaign, command)
          else
            send_command_external(campaign, command)
          end

          campaign.run_after_send_hooks(command)
        end
    end

    # This method is triggered when the given sending command should be sent
    # out through the event bus
    def send_command_external campaign, command
      PublishRawEventJob.perform_later(
        command[:event_payload],
        routing_key: "campaigns.command.#{campaign.type.underscore}"
      )
    end

    # This method is triggered when the given sending command should be sent
    # out through the interal Rails mailing stack
    def send_command_internal campaign, command
      campaign.mailer_class.campaign_mail(campaign, command).deliver_later
    end

  end
end