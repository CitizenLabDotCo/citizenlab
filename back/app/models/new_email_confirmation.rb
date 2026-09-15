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
class NewEmailConfirmation < Confirmation
  # Promotes new_email -> email on the user, marks the email confirmed,
  # and clears this confirmation's code state.
  def confirm!
    return false if user.new_email.blank?

    new_email = user.new_email
    transaction do
      user.update!(
        email: new_email,
        new_email: nil,
        email_confirmed_at: Time.zone.now,
        confirmation_required: false
      )
      clear_code!
      cancel_other_users_pending_email_change(new_email)
    end
    true
  end
end
