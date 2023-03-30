# frozen_string_literal: true

class ExpireConfirmationCodeOrDeleteJob < ApplicationJob
  def run(user_id, code_to_expire)
    # First check if the user record still exists.
    user = User.find_by(id: user_id)
    return unless user&.confirmation_required? && user&.email_confirmation_code == code_to_expire

    user.reset_confirmation_code
    user.save!

    return unless user.no_password? && user.registration_completed_at.nil?

    DeleteUserJob.perform_later(user)
  end
end
