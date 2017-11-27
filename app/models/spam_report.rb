class SpamReport < ApplicationRecord
  REASON_CODES = %w(wrong_content inapropriate)

  belongs_to :spam_reportable, polymorphic: true
  belongs_to :user

  validates :spam_reportable, presence: true
  validates :reason_code, inclusion: { in: REASON_CODES }

  after_validation :set_reported_at


  def set_reported_at
    self.reported_at ||= Time.now
  end
end
