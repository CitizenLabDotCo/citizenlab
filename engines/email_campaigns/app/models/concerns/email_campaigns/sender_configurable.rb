module EmailCampaigns
  module SenderConfigurable
    extend ActiveSupport::Concern

    SENDERS = %w(organization author)

    included do
      validates :author, presence: true, if: :sender_is_author?
      validates :sender, presence: true, inclusion: { in: SENDERS}
      validates :reply_to, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i }, allow_nil: true
    end

    def sender_is_author?
      sender == 'author'
    end

  end
end