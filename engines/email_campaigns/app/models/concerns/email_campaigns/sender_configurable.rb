module EmailCampaigns
  module SenderConfigurable
    extend ActiveSupport::Concern

    SENDERS = %w(organization author)
    REPLY_TOS = %w(organization author)

    included do
      validates :sender, presence: true, inclusion: { in: SENDERS}
      validates :reply_to, presence: true, inclusion: {in: REPLY_TOS }
    end

  end
end