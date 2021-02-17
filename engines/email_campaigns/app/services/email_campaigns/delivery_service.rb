module EmailCampaigns
  class DeliveryService
    CAMPAIGN_CLASSES = [
      Campaigns::AdminDigest,
      Campaigns::AdminRightsReceived,
      Campaigns::AssigneeDigest,
      Campaigns::CommentDeletedByAdmin,
      Campaigns::CommentMarkedAsSpam,
      Campaigns::CommentOnYourComment,
      Campaigns::CommentOnYourIdea,
      Campaigns::CommentOnYourInitiative,
      Campaigns::FirstIdeaPublished,
      Campaigns::IdeaAssignedToYou,
      Campaigns::IdeaMarkedAsSpam,
      Campaigns::IdeaPublished,
      Campaigns::InitiativeAssignedToYou,
      Campaigns::InitiativeMarkedAsSpam,
      Campaigns::InitiativePublished,
      Campaigns::InviteReceived,
      Campaigns::InviteReminder,
      Campaigns::Manual,
      Campaigns::MentionInOfficialFeedback,
      Campaigns::ModeratorDigest,
      Campaigns::NewCommentForAdmin,
      Campaigns::NewCommentOnCommentedIdea,
      Campaigns::NewCommentOnCommentedInitiative,
      Campaigns::NewCommentOnVotedIdea,
      Campaigns::NewCommentOnVotedInitiative,
      Campaigns::NewIdeaForAdmin,
      Campaigns::NewInitiativeForAdmin,
      Campaigns::OfficialFeedbackOnCommentedIdea,
      Campaigns::OfficialFeedbackOnCommentedInitiative,
      Campaigns::OfficialFeedbackOnVotedIdea,
      Campaigns::OfficialFeedbackOnVotedInitiative,
      Campaigns::OfficialFeedbackOnYourIdea,
      Campaigns::OfficialFeedbackOnYourInitiative,
      Campaigns::PasswordReset,
      Campaigns::ProjectModerationRightsReceived,
      Campaigns::ProjectPhaseStarted,
      Campaigns::ProjectPhaseUpcoming,
      Campaigns::StatusChangeOfCommentedIdea,
      Campaigns::StatusChangeOfCommentedInitiative,
      Campaigns::StatusChangeOfVotedIdea,
      Campaigns::StatusChangeOfVotedInitiative,
      Campaigns::StatusChangeOfYourIdea,
      Campaigns::StatusChangeOfYourInitiative,
      Campaigns::ThresholdReachedForAdmin,
      Campaigns::UserDigest,
      Campaigns::Welcome,
      Campaigns::YourProposedInitiativesDigest
    ].freeze

    class << self
      def campaign_types
        @campaign_types ||= CAMPAIGN_CLASSES.map(&:name).uniq
      end

      def add_campaign_types(*campaign_classes)
        campaign_types.concat(campaign_classes.map(&:name).uniq)
      end
    end

    delegate :campaign_types, to: :class

    def consentable_campaign_types_for(user)
      consentable_types = Consentable.consentable_campaign_types(CAMPAIGN_CLASSES, user)
      disabled_types = Disableable.enabled_campaign_types(Campaign.where(type: campaign_types))
      consentable_types - disabled_types
    end

    # called every hour
    def send_on_schedule(time = Time.zone.now)
      campaign_candidates = Campaign.where(type: campaign_types)
      apply_send_pipeline(campaign_candidates, time: time)
    end

    #  called on every activity
    def send_on_activity(activity)
      campaign_candidates = Campaign.where(type: campaign_types)
      apply_send_pipeline(campaign_candidates, activity: activity)
    end

    #  called when explicit send is requested by human
    def send_now(campaign)
      apply_send_pipeline([campaign])
    end

    def send_preview(campaign, recipient)
      campaign.generate_commands(
        recipient: recipient,
        time: Time.zone.now
      ).each do |command|
        process_command(campaign, command.merge({ recipient: recipient }))
      end
    end

    # This only works for emails that are sent out internally
    def preview_html(campaign, recipient)
      command = campaign.generate_commands(
        recipient: recipient,
        time: Time.zone.now
      ).first&.merge({ recipient: recipient })
      return unless command

      mail = campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
      mail.parts[1].body.to_s
    end

    private

    # Takes options, either
    # * time: Time object when the sending command happened
    # * activity: Activity object which activity happened
    def apply_send_pipeline(campaign_candidates, options = {})
      valid_campaigns           = filter_valid_campaigns_before_send(campaign_candidates, options)
      campaigns_with_recipients = assign_campaigns_recipients(valid_campaigns, options)
      campaigns_with_command    = assign_campaigns_command(campaigns_with_recipients, options)

      process_send_campaigns(campaigns_with_command)
    end

    def filter_valid_campaigns_before_send(campaigns, options)
      campaigns.select { |campaign| campaign.run_before_send_hooks(options) }
    end

    def assign_campaigns_recipients(campaigns, options)
      campaigns.flat_map do |campaign|
        recipients = campaign.apply_recipient_filters(options)
        recipients.zip([campaign].cycle)
      end
    end

    def assign_campaigns_command(campaigns_with_recipients, options)
      campaigns_with_recipients.flat_map do |(recipient, campaign)|
        campaign.generate_commands(recipient: recipient, **options)
                .map { |command| command.merge(recipient: recipient) }
                .zip([campaign].cycle)
      end
    end

    def process_send_campaigns(campaigns_with_command)
      campaigns_with_command.each do |(command, campaign)|
        process_command(campaign, command)
        campaign.run_after_send_hooks(command)
      end
    end

    # A command can have the following structure:
    # {
    #   time: , # Time at which the send_on_schedule was sent, optional
    #   activity: # Activity that triggered the command, optional
    #   recipient: # A user object, required
    #   event_payload: # A hash with the daa that's needed to generate email view, required
    #   delay: # Integer in seconds, optional
    # }
    def process_command(campaign, command)
      send_command_internal(campaign, command) if campaign.respond_to? :mailer_class
    end

    # This method is triggered when the given sending command should be sent
    # out through the interal Rails mailing stack
    def send_command_internal(campaign, command)
      campaign.mailer_class
              .with(campaign: campaign, command: command)
              .campaign_mail
              .deliver_later(wait: command[:delay] || 0)
    end
  end
end
