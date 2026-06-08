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
class PhoneConfirmation < Confirmation
  def confirm!
    transaction do
      user.update!(phone_number_verified_at: Time.zone.now)
      clear_code!
    end
    true
  end

  def pending?
    !user.phone_verified?
  end
end
