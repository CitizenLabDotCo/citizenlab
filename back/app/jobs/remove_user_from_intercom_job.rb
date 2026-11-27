# frozen_string_literal: true

class RemoveUserFromIntercomJob < ApplicationJob
  queue_as :default
  # Deleting a platform waits for this job (+MultiTenancy::Tenants::DeleteJob+), so it can't keep
  # retrying for days.
  self.max_retry_count = 3

  # @param [String,Array<String>] user_ids one id, or a list of ids (one job for a batch of
  #   users, see +SideFxUserService#after_destroy_all+).
  def run(user_ids)
    return unless INTERCOM_CLIENT

    TrackIntercomService.new(INTERCOM_CLIENT).forget_users(Array(user_ids))
  end
end
