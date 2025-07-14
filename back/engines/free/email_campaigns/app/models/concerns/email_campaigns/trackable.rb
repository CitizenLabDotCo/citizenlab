# frozen_string_literal: true

module EmailCampaigns
  module Trackable
    extend ActiveSupport::Concern

    included do
      before_send :generate_delivery_id
      after_send :save_delivery

      has_many :deliveries, class_name: 'EmailCampaigns::Delivery', foreign_key: :campaign_id, dependent: :destroy
      has_many :recipients, source: :user, through: :deliveries
    end

    def sent?
      deliveries.exists?
    end

    def last_delivery_for_recipient(user)
      deliveries
        .where(user: user)
        .order(sent_at: :desc)
        .first
        &.sent_at
    end

    def extra_mailgun_variables(command)
      if !command[:delivery_id]
        # This can be removed in August 2025. It seems like the delivery_id is always included now,
        # but somehow the Mailgun header is also called when the delivery_id is not set yet. But if
        # the error in MailgunEventsController is not raised, then all should be fine.
        ErrorReporter.report_msg(
          'No delivery ID in Mailgun variables!',
          extra: { command: command, campaign: self }
        )
      end
      { 'cl_delivery_id' => command[:delivery_id] }
    end

    private

    def generate_delivery_id(command)
      command[:delivery_id] = SecureRandom.uuid
    end

    def save_delivery(command)
      deliveries.create(
        id: command[:delivery_id],
        delivery_status: 'sent',
        user: command[:recipient],
        tracked_content: command[:tracked_content]
      )
    end
  end
end
