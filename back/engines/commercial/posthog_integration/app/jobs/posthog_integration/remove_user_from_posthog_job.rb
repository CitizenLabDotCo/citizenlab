# frozen_string_literal: true

module PosthogIntegration
  class RemoveUserFromPosthogJob < ApplicationJob
    self.priority = 70 # Lower priority than default, but still higher than DeleteUserJob.

    # @param [String,Array<String>] user_ids one id, or a list of ids (one job for a batch of
    #   users, see +SideFxUserService#after_destroy_all+).
    def run(user_ids)
      return unless defined?(POSTHOG_CUSTOM_CLIENT) && POSTHOG_CUSTOM_CLIENT

      Array(user_ids).each do |user_id|
        POSTHOG_CUSTOM_CLIENT.delete_person_by_distinct_id(user_id, retries: 10)
      end
    end
  end
end
