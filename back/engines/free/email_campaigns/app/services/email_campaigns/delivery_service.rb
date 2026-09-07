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
      Campaigns::EmailConfirmation,
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
      Campaigns::NewEmailConfirmation,
      Campaigns::NewIdeaForAdminPublished,
      Campaigns::NewIdeaForAdminPrescreening,
      Campaigns::OfficialFeedbackOnIdeaYouFollow,
      Campaigns::PasswordReset,
      Campaigns::ProjectFolderModerationRightsReceived,
      Campaigns::ProjectModerationRightsReceived,
      Campaigns::SpaceModerationRightsReceived,
      Campaigns::ProjectPhaseStarted,
      Campaigns::ProjectPhaseUpcoming,
      Campaigns::ProjectPublished,
      Campaigns::ProjectReviewRequest,
      Campaigns::ProjectReviewStateChange,
      Campaigns::ProposalExpiredForAdmin,
      Campaigns::StatusChangeOnIdeaYouFollow,
      Campaigns::SurveySubmitted,
      Campaigns::ThresholdReachedForAdmin,
      Campaigns::UserBlocked,
      Campaigns::UserDigest,
      Campaigns::VotingBasketNotSubmitted,
      Campaigns::VotingBasketSubmitted,
      Campaigns::VotingLastChance,
      Campaigns::VotingPhaseStarted,
      Campaigns::VotingResults,
      Campaigns::ScreeningDigest,
      Campaigns::Welcome,
      Campaigns::YourInputInScreening
    ].freeze

    # Campaign classes that only join `campaign_classes` when the feature that exposes
    # them is activated. They still exist in the codebase when it isn't, so they are part
    # of `all_campaign_classes`.
    FEATURE_GATED_CAMPAIGN_CLASSES = [
      Campaigns::CommunityMonitorReport,
      Campaigns::SmsManual,
      Campaigns::PhoneConfirmation,
      Campaigns::NewPhoneConfirmation
    ].freeze

    # The campaigns that may act right now: send, be offered for consent, be created.
    def campaign_classes
      @campaign_classes ||= begin
        classes = CAMPAIGN_CLASSES.deep_dup
        classes << Campaigns::CommunityMonitorReport if AppConfiguration.instance.feature_activated?('community_monitor')
        # The sms feature carries the Twilio settings every SMS campaign sends through, so
        # sms_manual_campaigns only takes effect on top of it.
        if AppConfiguration.instance.feature_activated?('sms')
          classes << Campaigns::SmsManual if AppConfiguration.instance.feature_activated?('sms_manual_campaigns')
          classes << Campaigns::PhoneConfirmation
          classes << Campaigns::NewPhoneConfirmation
        end
        classes
      end
    end

    # Every campaign class that exists in the codebase, whether or not the feature that
    # exposes it is currently activated. A campaign whose feature is switched off is
    # dormant, not deprecated: its records must survive (deleting them would destroy
    # admin-authored content that should come back the moment the feature returns).
    # Derived from `campaign_classes` so that engine patches feed both lists.
    def all_campaign_classes
      campaign_classes | FEATURE_GATED_CAMPAIGN_CLASSES
    end

    def campaign_types
      campaign_classes.map(&:name)
    end

    def all_campaign_types
      all_campaign_classes.map(&:name)
    end

    # Whether a campaign is manual is a property of its class, not of the feature flag,
    # so this covers dormant campaigns too. `Campaign.automatic` negates this list: were
    # it feature-dependent, a dormant manual campaign would count as automatic.
    def manual_campaign_types
      all_campaign_classes.select { |campaign| campaign.new.manual? }.map(&:name)
    end

    # Campaign types that should never surface in the admin campaigns UI
    # (e.g. transactional/internal campaigns like the phone-confirmation OTP).
    # Feature-independent for the same reason as `manual_campaign_types`: a dormant
    # OTP campaign must stay hidden rather than appear once its feature is switched off.
    def hidden_from_admin_campaign_types
      all_campaign_classes.select { |campaign| campaign.new.hidden_from_admin? }.map(&:name)
    end

    def consentable_campaign_types_for(user)
      consentable_types = Consentable.consentable_campaign_types(campaign_classes, user, self)
      disabled_types = Disableable.enabled_campaign_types(Campaign.where(type: campaign_types))
      # Transactional campaigns (e.g. the phone-confirmation OTP) record consent for
      # audit but are never user-managed, so they stay out of the consent list.
      consentable_types - disabled_types - hidden_from_admin_campaign_types
    end

    # called every hour
    def send_on_schedule(time = Time.zone.now)
      campaign_candidates = Campaign.where(type: campaign_types)
      apply_send_pipeline(campaign_candidates, time: time)
    end

    #  called on every activity
    def send_on_activity(activity)
      campaign_candidates = Campaign.where(type: campaign_types)
      campaign_candidates = filter_campaigns_on_activity_context(campaign_candidates, activity)

      apply_send_pipeline(campaign_candidates, activity: activity)
    end

    #  called when explicit send is requested by human
    def send_now(campaign)
      apply_send_pipeline([campaign])
    end

    # Sends one campaign to one recipient immediately, bypassing the
    # recipient-filter pipeline. For transactional messages that must go out
    # right away (e.g. confirmation codes).
    def send_now_to_user(campaign, recipient, event_payload = {})
      if campaign.sms?
        send_sms_now_to_user(campaign, recipient, event_payload)
      else
        send_email_now_to_user(campaign, recipient, event_payload)
      end
    end

    def send_email_preview(campaign, recipient)
      commands = if campaign.manual?
        generate_commands(campaign, recipient)
      else
        [campaign.preview_command(recipient, campaign.context)].compact
      end
      return unless commands.any?

      commands.each do |command|
        process_command(campaign, command)
      end
    end

    def send_sms_preview(campaign, recipient)
      command = generate_commands(campaign, recipient).first
      return unless command

      campaign.deliver_preview(command)
    end

    def preview_email(campaign, recipient)
      return {} if campaign.sms?

      command = if campaign.manual?
        generate_commands(campaign, recipient).first
      else
        campaign.preview_command(recipient, campaign.context)
      end
      return {} unless command

      mail = campaign.mailer_class.with(campaign:, command:).campaign_mail
      return {} unless mail

      {
        to: if campaign.class.recipient_segment_multiloc_key
              I18n.t(campaign.class.recipient_segment_multiloc_key, locale: recipient.locale)
            else
              campaign.groups.map { |g| MultilocService.new.t(g.title_multiloc, recipient.locale) }.join(', ')
        end,
        from: mail[:from].value,
        reply_to: mail.reply_to.first,
        subject: mail.subject,
        html: mail.body.to_s
      }
    end

    private

    # Renders and delivers the campaign's email synchronously. Runs Trackable
    # hooks so a Delivery record is saved.
    def send_email_now_to_user(campaign, recipient, event_payload = {})
      command = { recipient: recipient, event_payload: event_payload, time: Time.zone.now }
      campaign.run_before_send_hooks(command)
      campaign.mailer_class
        .with(campaign: campaign, command: command)
        .campaign_mail
        .deliver_now
      campaign.run_after_send_hooks(command)
    end

    # Sends a transactional one-off SMS synchronously, in-process (e.g. the
    # phone-confirmation OTP). The campaign owns rendering, destination and the
    # synchronous send.
    def send_sms_now_to_user(campaign, recipient, event_payload = {})
      command = { recipient: recipient, event_payload: event_payload, time: Time.zone.now }
      campaign.deliver_now(command)
    end

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
      if campaign.sms?
        send_sms_command(campaign, command)
      else
        send_email_command(campaign, command)
      end
    end

    # Sends the command through the internal Rails mailing stack. Campaigns
    # without a mailer (nothing to email) are a no-op.
    def send_email_command(campaign, command)
      return unless campaign.respond_to?(:mailer_class)

      campaign.mailer_class
        .with(campaign: campaign, command: command)
        .campaign_mail
        .deliver_later(wait: command[:delay] || 0)
    end

    def send_sms_command(campaign, command)
      campaign.deliver_later(command)
    end

    def generate_commands(campaign, recipient, options = {})
      campaign.generate_commands(recipient:, **options).map do |command|
        command.merge(
          recipient: recipient,
          time: Time.zone.now
        )
      end
    end

    def filter_campaigns_on_activity_context(campaigns, activity)
      campaigns = campaigns.select do |campaign|
        !campaign.context || (campaign.activity_context(activity) == campaign.context && campaign.class.supports_context?(campaign.context))
      end
      context_types = campaigns.select(&:context).map(&:type)
      campaigns.select do |campaign|
        campaign.context || context_types.exclude?(campaign.type)
      end
    end
  end
end

EmailCampaigns::DeliveryService.prepend(FlagInappropriateContent::Patches::EmailCampaigns::DeliveryService)
EmailCampaigns::DeliveryService.prepend(IdeaAssignment::Patches::EmailCampaigns::DeliveryService)
