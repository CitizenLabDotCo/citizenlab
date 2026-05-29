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
class EmailConfirmation < Confirmation
  def confirm!
    transaction do
      user.update!(email_confirmed_at: Time.zone.now, confirmation_required: false)
      clear_code!
      cancel_other_users_pending_email_change(user.email) if user.email.present?
    end
    true
  end

  def pending?
    user.confirmation_required?
  end
end
