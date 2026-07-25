# frozen_string_literal: true

module EmailCampaigns
  class ApplicationMailer < ApplicationMailer
    layout 'campaign_mailer'

    before_action do
      @command, @campaign = params.values_at(:command, :campaign)
      @user = @command[:recipient]
    end

    def campaign_mail
      if context_deleted?
        Rails.logger.info("#{self.class.name}: skipping delivery, context #{command.dig(:event_payload, :context_gid)} no longer exists")
        return
      end

      I18n.with_locale(locale.locale_sym) do
        mail(default_config, &:mjml).tap do |message|
          message.mailgun_headers = mailgun_headers if self.class.delivery_method == :mailgun
        end
      end
    end

    attr_reader :command, :campaign

    helper_method :command, :campaign, :event, :show_unsubscribe_link?, :cta_button_text

    private

    def mailgun_variables
      super.merge(campaign&.extra_mailgun_variables(command) || {})
    end

    def show_unsubscribe_link?
      user && campaign.class.try(:consentable_for?, user)
    end

    def show_terms_link?
      true
    end

    def show_privacy_policy_link?
      true
    end

    # Format a non-editable message - use `EditableWithPreview.format_editable_region` when editable.
    def format_message(key, component: nil, escape_html: true, values: {})
      group = component || @campaign.class.name.demodulize.underscore
      msg = t("email_campaigns.#{group}.#{key}", **values)
      escape_html ? msg : msg.html_safe
    end

    def reply_to_email
      command[:reply_to] || @campaign.reply_to.presence || super
    end

    def event
      @event ||= to_deep_struct(command&.dig(:event_payload))
    end

    # The delivery job can sit in the queue (campaign delay, transient send failures +
    # retries) while the record the email is about — its context, e.g. a phase — is
    # destroyed. Queued jobs are purged on destroy (see PurgesRelatedQueJobs), but a job
    # already picked up by a worker, or enqueued concurrently with the deletion, escapes
    # the purge; this guard covers that race. Returning early from `campaign_mail` yields
    # a NullMail, so nothing is delivered.
    def context_deleted?
      gid = command&.dig(:event_payload, :context_gid)
      return false if gid.blank?

      GlobalID::Locator.locate(gid).nil?
    rescue ActiveRecord::RecordNotFound
      true
    end
  end
end
