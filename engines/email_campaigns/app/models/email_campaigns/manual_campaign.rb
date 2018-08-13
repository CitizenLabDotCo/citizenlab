module EmailCampaigns
  class ManualCampaign < ApplicationRecord

    SENDERS = %w(organization author)
    REPLY_TOS = %w(organization author)
    MAX_SUBJECT_LEN = 80

    belongs_to :author, class_name: 'User'
    has_many :manual_campaigns_groups, dependent: :destroy
    has_many :groups, through: :manual_campaigns_groups

    has_many :manual_campaigns_recipients, dependent: :destroy
    has_many :recipients, source: :user, through: :manual_campaigns_recipients

    validates :sender, presence: true, inclusion: { in: SENDERS}
    validates :reply_to, presence: true, inclusion: {in: REPLY_TOS }

    validates :subject_multiloc, presence: true, multiloc: {presence: true, length: {maximum: MAX_SUBJECT_LEN}}
    validates :body_multiloc, presence: true, multiloc: {presence: true}

    def sent?
      self.sent_at
    end

    def calculated_recipients
      groups.map(&:members).inject(:+).uniq
    end
  end
end