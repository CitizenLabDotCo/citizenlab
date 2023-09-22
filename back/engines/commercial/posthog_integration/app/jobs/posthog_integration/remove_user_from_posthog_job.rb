# frozen_string_literal: true

module PosthogIntegration
  class RemoveUserFromPosthogJob < ApplicationJob
    self.priority = 70 # Lower priority than default, but still higher than DeleteUserJob.

    def run(user_id)
      return unless defined?(POSTHOG_CUSTOM_CLIENT) && POSTHOG_CUSTOM_CLIENT

      POSTHOG_CUSTOM_CLIENT.delete_person_by_distinct_id(user_id)
    end
  end
end
