# frozen_string_literal: true

module Matomo
  class RemoveUserFromMatomoJob < ApplicationJob
    self.priority = 70 # Lower priority than default, but still higher than DeleteUserJob.

    # Number of attempts whose 503 errors are not reported. With the default retry
    # intervals, the first reported attempt (the fifth) runs about 1.5 hours after the
    # first one: longer than a burst of deletions should keep Matomo busy.
    QUIET_ATTEMPTS = 4

    # @return [Array<String>] IDs of the Matomo sites that track the current tenant.
    def self.tenant_site_ids
      settings = AppConfiguration.instance.settings('matomo') || {}
      settings.values_at('tenant_site_id', 'product_site_id').compact_blank.uniq
    end

    # @param [String] user_id
    # @param [Array<String>,NilClass] site_ids Sites to search. All sites if blank.
    def run(user_id, site_ids: nil)
      Matomo::Client.new.delete_user_data(user_id, site_ids:)
    rescue Matomo::Client::ServiceUnavailableError => e
      # Matomo answers 503 above its concurrency cap, which is expected under load.
      if quiet_attempt?
        # Retries without raising, but keeps the error on the job row.
        que_target.que_error = e
        retry_in_default_interval
      else
        Sentry.set_tags(attempt: error_count + 1) if que_target
        raise
      end
    rescue Matomo::Client::MissingBaseUriError
      # Ignore, assuming that Matomo was not configured.
    rescue Matomo::Client::MissingAuthorizationTokenError
      # If Matomo is configured, an authorization token should also be provided.
      raise if ENV.key?('MATOMO_HOST')
    end

    private

    # False outside a Que worker (e.g. `perform_now`), where nothing can be rescheduled.
    # Inside another job, `que_target` would be that job: do not use `perform_now` there.
    def quiet_attempt?
      que_target.present? && error_count < QUIET_ATTEMPTS
    end
  end
end
