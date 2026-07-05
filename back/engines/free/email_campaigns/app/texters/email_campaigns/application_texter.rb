# frozen_string_literal: true

module EmailCampaigns
  # Base class for SMS "texters" — the SMS-channel analog of ApplicationMailer.
  # A texter owns everything about sending one campaign's SMS to one recipient:
  # it renders the #body, resolves the #destination number, and exposes
  # #deliver_now / #deliver_later — the SMS counterpart of a mailer's
  # deliver_now/deliver_later. DeliveryService just builds the texter and picks
  # one, staying transport-agnostic exactly as it does for mailers.
  #
  # Concrete texters implement #body and #destination.
  class ApplicationTexter
    # Mirrors ActionMailer's `Mailer.with(...)`: bind the campaign + command and
    # return an instance ready to render and deliver.
    def self.with(campaign:, command:)
      new(campaign: campaign, command: command)
    end

    def initialize(campaign:, command:)
      @campaign = campaign
      @command = command
      @recipient = command[:recipient]
    end

    attr_reader :campaign, :command, :recipient

    # Renders and sends the SMS synchronously, in-process, to #destination.
    # For transactional messages that must go out right away (e.g. the phone
    # confirmation OTP, which texts the pending number being verified). An
    # invalid/blank destination raises, so the caller learns the send failed.
    # Returns the created EmailCampaigns::Sms::Delivery.
    def deliver_now(campaign_id: campaign.id)
      Sms::SendService.new.send_now(
        to: destination,
        body: body,
        user_id: recipient.id,
        campaign_id: campaign_id
      )
    end

    # Persists a pending EmailCampaigns::Sms::Delivery and hands the provider
    # send to SendJob, which texts the recipient's confirmed phone_number.
    # No-op when there's nothing to send (recipient has no number, or no body).
    # Pass campaign_id: nil to leave the delivery unlinked (previews, so they
    # don't count towards the campaign's deliveries/stats).
    # Returns the created delivery, or nil when skipped.
    def deliver_later(campaign_id: campaign.id)
      return if destination.blank? || body.blank?

      delivery = Sms::SendService.new.create_delivery(
        body: body,
        user_id: recipient.id,
        campaign_id: campaign_id
      )
      Sms::SendJob.perform_later(delivery.id)
      delivery
    end

    # The rendered SMS text, in the recipient's locale.
    def body
      raise NotImplementedError, "#{self.class} must implement #body"
    end

    # The phone number this SMS should be sent to.
    def destination
      raise NotImplementedError, "#{self.class} must implement #destination"
    end
  end
end
