class SpamReport < ApplicationRecord
  REASON_CODES = %w(wrong_content inapropriate)

  belongs_to :user
end
