module EmailCampaigns
  class DeliveryService

    CAMPAIGN_CLASSES = [
      Campaigns::Manual,
      Campaigns::CommentOnYourComment,
      Campaigns::CommentOnYourIdea,
      Campaigns::CommentMarkedAsSpam,
      Campaigns::IdeaMarkedAsSpam,
      # Campaigns::StatusChangeOfYourIdea,
      Campaigns::MentionInComment,
      # Campaigns::CommentDeletedByAdmin,
      Campaigns::AdminRightsReceived,
      Campaigns::ProjectModerationRightsReceived,
      Campaigns::InviteReceived,
      Campaigns::InviteAccepted,
      Campaigns::Welcome,
      Campaigns::PasswordReset,
      Campaigns::FirstIdeaPublished,
      # Campaigns::IdeaPublished,
      Campaigns::AdminDigest,
      Campaigns::ModeratorDigest,
      Campaigns::UserDigest
    ]

    def campaign_types
      CAMPAIGN_CLASSES.map(&:name).uniq
    end

    def consentable_campaign_types_for user
      consentable_types = Consentable.consentable_campaign_types(CAMPAIGN_CLASSES, user)
      disabled_types = Disableable.enabled_campaign_types(Campaign.where(type: campaign_types))

      consentable_types - disabled_types
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
        .flat_map do |(recipient, campaign)|
          campaign.generate_commands(
            recipient: recipient,
            **options
          ).map do |command|
            command.merge({
              recipient: recipient,
            })
          end
          .zip([campaign].cycle)
        end
        .each do |(command, campaign)|
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
      segment_event = {
        event: "#{campaign.class.campaign_name} email command",
        user_id: command[:recipient].id,
        timestamp: Time.now.iso8601,
        properties: {
          source: 'cl2-back',
          payload: command[:event_payload]
        }
      }
      rabbit_event = {
        event: "#{campaign.class.campaign_name} email command",
        timestamp: Time.now.iso8601,
        user_id: command[:recipient].id,
        payload: command[:event_payload]
      }

      PublishRawEventToSegmentJob.perform_later segment_event
      PublishRawEventToRabbitJob.perform_later rabbit_event, "campaigns.command.#{campaign.class.campaign_name}"
    end

    # This method is triggered when the given sending command should be sent
    # out through the interal Rails mailing stack
    def send_command_internal campaign, command
      campaign.mailer_class.campaign_mail(campaign, command).deliver_later
    end

  end
end