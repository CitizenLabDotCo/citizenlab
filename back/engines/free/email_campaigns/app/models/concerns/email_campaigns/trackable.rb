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

    def extra_mailgun_variables
      if !@command
        ErrorReporter.report_msg('No command in extra_mailgun_variables!')
        @command = {}
      end
      if !@command[:delivery_id]
        ErrorReporter.report_msg('No delivery ID in extra_mailgun_variables!')
      end
      { 'cl_delivery_id' => @command[:delivery_id] }
    end

    private

    def generate_delivery_id(command)
      @command = command
      command[:delivery_id] ||= SecureRandom.uuid
    end

    def save_delivery(command)
      ErrorReporter.report_msg('No delivery ID in save_delivery!') if !command[:delivery_id]
      deliveries.create(
        id: command[:delivery_id],
        delivery_status: 'sent',
        user: command[:recipient],
        tracked_content: command[:tracked_content]
      )
    end
  end
end
