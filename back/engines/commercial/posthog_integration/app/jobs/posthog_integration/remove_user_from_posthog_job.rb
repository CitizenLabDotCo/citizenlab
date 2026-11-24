# frozen_string_literal: true

module PosthogIntegration
  class RemoveUserFromPosthogJob < ApplicationJob
    self.priority = 70 # Lower priority than default, but still higher than DeleteUserJob.

    # @param [String,Array<String>] user_ids one id, or a list of ids (one job for a batch of
    #   users, see +SideFxUserService#after_destroy_all+). They are deleted with one request.
    def run(user_ids)
      return unless defined?(POSTHOG_CUSTOM_CLIENT) && POSTHOG_CUSTOM_CLIENT

      POSTHOG_CUSTOM_CLIENT.delete_persons_by_distinct_ids(Array(user_ids), retries: 10)
    end
  end
end
