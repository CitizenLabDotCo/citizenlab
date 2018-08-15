module EmailCampaigns
  module Trackable
    extend ActiveSupport::Concern

    included do
      has_many :deliveries, dependent: :destroy
      has_many :recipients, source: :user, through: :deliveries
    end

    def sent?
      deliveries.exists?
    end

    def last_delivery_for_recipient user
      deliveries
        .where(user: user)
        .order(sent_at: :desc)
        .first
        &.sent_at
    end
  end
end