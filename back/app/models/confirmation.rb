# frozen_string_literal: true

# == Schema Information
#
# Table name: confirmations
#
#  id               :uuid             not null, primary key
#  user_id          :uuid             not null
#  type             :string           not null
#  code             :string
#  code_retry_count :integer          default(0), not null
#  code_reset_count :integer          default(0), not null
#  code_sent_at     :datetime
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_confirmations_on_user_id           (user_id)
#  index_confirmations_on_user_id_and_type  (user_id,type) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id) ON DELETE => cascade
#
class Confirmation < ApplicationRecord
  belongs_to :user

  validates :code, format: { with: USER_CONFIRMATION_CODE_PATTERN }, allow_nil: true
  validates :code_retry_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }
  validates :code_reset_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }
end
