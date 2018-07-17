module EmailCampaigns
  class Campaign < ApplicationRecord

    SENDERS = %w(organization author)
    REPLY_TOS = %w(organization author)
    MAX_SUBJECT_LEN = 80

    belongs_to :author, class_name: 'User'
    
    validates :sender, presence: true, inclusion: { in: SENDERS}
    validates :reply_to, presence: true, inclusion: {in: REPLY_TOS }

    validates :subject_multiloc, presence: true, multiloc: {presence: true, length: {maximum: MAX_SUBJECT_LEN}}
    validates :body_multiloc, presence: true, multiloc: {presence: true}

    def sent?
      self.sent_at
    end

    def recipients
      User.all
    end
  end
end