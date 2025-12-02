# frozen_string_literal: true

class ExpireConfirmationCodeOrDeleteJob < ApplicationJob
  def run(user_id, code_to_expire)
    user = User.find_by(id: user_id)
    return if !user&.expire_confirmation_code!(code_to_expire)

    DeleteUserJob.perform_later(user) if user.no_password? && !user.registration_completed_at
  end
end
