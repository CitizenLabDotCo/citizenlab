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
  CODE_DURATION = 24.hours

  belongs_to :user

  validates :code, format: { with: USER_CONFIRMATION_CODE_PATTERN }, allow_nil: true
  validates :code_retry_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }
  validates :code_reset_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }

  def expiration_at
    return nil if code_sent_at.nil?

    code_sent_at + CODE_DURATION
  end

  def reset_code!
    transaction do
      update!(
        code: self.class.generate_code,
        code_reset_count: code_reset_count + 1,
        code_retry_count: 0
      )
      after_reset
    end
  end

  def expire_code!
    update!(code: self.class.generate_code)
  end

  def clear_code!
    update!(code: nil, code_retry_count: 0, code_reset_count: 0)
  end

  def self.generate_code
    Rails.env.development? ? '1234' : rand.to_s[2..5]
  end

  protected

  # Hook for subclasses to react to a code reset (e.g. flip a flag on the user).
  def after_reset; end

  # Cancel pending email-change requests on OTHER users that target `email`,
  # so they don't end up with an invalid (now-taken) new_email.
  def cancel_other_users_pending_email_change(email)
    other_user_ids = User.where(new_email: email).where.not(id: user_id).pluck(:id)
    return if other_user_ids.empty?

    User.where(id: other_user_ids).update_all(new_email: nil, updated_at: Time.zone.now)
    NewEmailConfirmation.where(user_id: other_user_ids).update_all(code: nil, updated_at: Time.zone.now)
  end
end
