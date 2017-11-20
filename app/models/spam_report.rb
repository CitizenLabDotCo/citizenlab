class SpamReport < ApplicationRecord
  REASON_CODES = %w(wrong_content inapropriate)

  belongs_to :spam_reportable, polymorphic: true
  belongs_to :user

  validates :spam_reportable, :user, presence: true
  validates :reason_code, inclusion: { in: REASON_CODES }
end
