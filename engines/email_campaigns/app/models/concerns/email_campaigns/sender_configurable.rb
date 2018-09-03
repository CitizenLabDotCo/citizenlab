module EmailCampaigns
  module SenderConfigurable
    extend ActiveSupport::Concern

    SENDERS = %w(organization author)

    included do
      validates :sender, presence: true, inclusion: { in: SENDERS}
      validates :reply_to, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i }, allow_nil: true
    end

  end
end