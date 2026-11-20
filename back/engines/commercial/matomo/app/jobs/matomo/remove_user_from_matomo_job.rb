# frozen_string_literal: true

module Matomo
  class RemoveUserFromMatomoJob < ApplicationJob
    self.priority = 70 # Lower priority than default, but still higher than DeleteUserJob.

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
      # Matomo answers 503 to privacy API calls above its concurrency cap, so this error
      # is expected under load. Retrying without raising keeps it out of the error
      # tracker; only the last attempt is reported.
      raise if final_attempt?

      # Keeps the error on the job row, as for a raised error.
      que_target.que_error = e
      retry_in_default_interval
    rescue Matomo::Client::MissingBaseUriError
      # Ignore, assuming that Matomo was not configured.
    rescue Matomo::Client::MissingAuthorizationTokenError
      # If Matomo is configured, an authorization token should also be provided.
      raise if ENV.key?('MATOMO_HOST')
    end

    private

    # Also true when no Que worker is running a job (e.g. `perform_now` from a request or
    # the console), where there is nothing to reschedule. Do not run this job with
    # `perform_now` inside another job: `que_target` would then be that other job.
    def final_attempt?
      que_target.nil? || error_count >= maximum_retry_count
    end
  end
end
