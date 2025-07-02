# frozen_string_literal: true

module EmailCampaigns
  class DeliveryService
    CAMPAIGN_CLASSES = [
      Campaigns::AdminDigest,
      Campaigns::AdminRightsReceived,
      Campaigns::AssigneeDigest,
      Campaigns::CommentDeletedByAdmin,
      Campaigns::CommentMarkedAsSpam,
      Campaigns::CommentOnIdeaYouFollow,
      Campaigns::CommentOnYourComment,
      Campaigns::CosponsorOfYourIdea,
      Campaigns::EventRegistrationConfirmation,
      Campaigns::IdeaMarkedAsSpam,
      Campaigns::IdeaPublished,
      Campaigns::InternalCommentOnIdeaAssignedToYou,
      Campaigns::InternalCommentOnIdeaYouCommentedInternallyOn,
      Campaigns::InternalCommentOnIdeaYouModerate,
      Campaigns::InternalCommentOnUnassignedUnmoderatedIdea,
      Campaigns::InternalCommentOnYourInternalComment,
      Campaigns::InvitationToCosponsorIdea,
      Campaigns::InviteReceived,
      Campaigns::InviteReminder,
      Campaigns::Manual,
      Campaigns::ManualProjectParticipants,
      Campaigns::MentionInInternalComment,
      Campaigns::MentionInOfficialFeedback,
      Campaigns::ModeratorDigest,
      Campaigns::NativeSurveyNotSubmitted,
      Campaigns::NewCommentForAdmin,
      Campaigns::NewIdeaForAdmin,
      Campaigns::OfficialFeedbackOnIdeaYouFollow,
      Campaigns::ProjectFolderModerationRightsReceived,
      Campaigns::ProjectModerationRightsReceived,
      Campaigns::ProjectPhaseStarted,
      Campaigns::ProjectPhaseUpcoming,
      Campaigns::ProjectPublished,
      Campaigns::ProjectReviewRequest,
      Campaigns::ProjectReviewStateChange,
      Campaigns::StatusChangeOnIdeaYouFollow,
      Campaigns::SurveySubmitted,
      Campaigns::ThresholdReachedForAdmin,
      Campaigns::UserDigest,
      Campaigns::VotingBasketNotSubmitted,
      Campaigns::VotingBasketSubmitted,
      Campaigns::VotingLastChance,
      Campaigns::VotingPhaseStarted,
      Campaigns::VotingResults,
      Campaigns::Welcome,
      Campaigns::YourInputInScreening
    ].freeze

    def campaign_classes
      @campaign_classes ||= begin
        classes = CAMPAIGN_CLASSES.deep_dup
        classes << Campaigns::CommunityMonitorReport if AppConfiguration.instance.feature_activated?('community_monitor')
        classes
      end
    end

    def campaign_types
      campaign_classes.map(&:name)
    end

    def manual_campaign_types
      campaign_classes.select { |campaign| campaign.new.manual? }.map(&:name)
    end

    def consentable_campaign_types_for(user)
      consentable_types = Consentable.consentable_campaign_types(campaign_classes, user, self)
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
      commands = if campaign.manual?
        generate_commands(campaign, recipient)
      else
        [campaign.mailer_class.preview_command(recipient:)].compact
      end
      return unless commands.any?

      commands.each do |command|
        process_command(campaign, command.merge({ recipient: recipient }))
      end
    end

    def preview_email(campaign, recipient)
      command = if campaign.manual?
        generate_commands(campaign, recipient).first&.merge(recipient: recipient)
      else
        campaign.mailer_class.preview_command(recipient:)
      end
      return {} unless command

      mail = campaign.mailer_class.with(campaign:, command:).campaign_mail
      return {} unless mail

      {
        to: campaign.class.recipient_segment_multiloc_key ? I18n.t(campaign.class.recipient_segment_multiloc_key, locale: recipient.locale) : '',
        from: mail[:from].value,
        reply_to: mail.reply_to.first,
        subject: mail.subject,
        html: mail.body.to_s
      }
    end

    private

    # Takes options, either
    # * time: Time object when the sending command happened
    # * activity: Activity object which activity happened
    def apply_send_pipeline(campaign_candidates, options = {})
      valid_campaigns           = filter_campaigns(campaign_candidates, options)
      campaigns_with_recipients = assign_campaigns_recipients(valid_campaigns, options)
      campaigns_with_command    = assign_campaigns_command(campaigns_with_recipients, options)

      ExamplesService.new.save_examples(campaigns_with_command)
      process_send_campaigns(campaigns_with_command)
    end

    def filter_campaigns(campaigns, options)
      campaigns.select { |campaign| campaign.run_filter_hooks(**options) }
    end

    def assign_campaigns_recipients(campaigns, options)
      campaigns.flat_map do |campaign|
        recipients = campaign.apply_recipient_filters(**options)
        recipients.zip([campaign].cycle)
      end
    end

    def assign_campaigns_command(campaigns_with_recipients, options)
      campaigns_with_recipients.flat_map do |(recipient, campaign)|
        generate_commands(campaign, recipient, options)
          .map { |command| command.merge(recipient: recipient) }
          .zip([campaign].cycle)
      end
    end

    def process_send_campaigns(campaigns_with_command)
      campaigns_with_command.each do |(command, campaign)|
        campaign.run_before_send_hooks(command)
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

    def generate_commands(campaign, recipient, options = {})
      campaign.generate_commands(recipient:, **options).map do |command|
        command.merge(
          recipient: recipient,
          time: Time.zone.now,
          delivery_id: SecureRandom.uuid
        )
      end
    end
  end
end

EmailCampaigns::DeliveryService.prepend(FlagInappropriateContent::Patches::EmailCampaigns::DeliveryService)
EmailCampaigns::DeliveryService.prepend(IdeaAssignment::Patches::EmailCampaigns::DeliveryService)
