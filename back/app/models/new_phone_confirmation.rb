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
class NewPhoneConfirmation < Confirmation
  # Promotes new_phone -> phone on the user, stamps it confirmed,
  # and clears this confirmation's code state. Mirrors NewEmailConfirmation.
  def confirm!
    return false if user.new_phone.blank?

    new_phone = user.new_phone
    transaction do
      user.update!(
        phone: new_phone,
        new_phone: nil,
        phone_confirmed_at: Time.zone.now
      )
      clear_code!
      cancel_other_users_pending_phone_change(new_phone)
    end
    true
  end

  def pending?
    user.new_phone.present?
  end

  def reset_code!
    update!(
      code: generate_code,
      code_reset_count: code_reset_count + 1,
      code_retry_count: 0
    )
  end

  def expire_code!
    update!(code: generate_code)
  end

  def generate_code
    return '1234' if AppConfiguration.instance.settings('sms', 'use_dummy_code')

    Rails.env.development? ? '1234' : rand.to_s[2..5]
  end
end
