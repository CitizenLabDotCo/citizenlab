# frozen_string_literal: true

module EmailCampaigns
  module Trackable
    extend ActiveSupport::Concern

    included do
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

    def save_delivery(command)
      command[:delivery].save!
      # deliveries.create(
      #   delivery_status: 'sent',
      #   user: command[:recipient],
      #   tracked_content: command[:tracked_content]
      # )
    end
  end
end
