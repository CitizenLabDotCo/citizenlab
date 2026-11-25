# frozen_string_literal: true

module Matomo
  class RemoveUserFromMatomoJob < ApplicationJob
    self.priority = 70 # Lower priority than default, but still higher than DeleteUserJob.
    # Deleting a platform waits for this job (+MultiTenancy::Tenants::DeleteJob+), so it can't keep
    # retrying for days.
    self.max_retry_count = 3

    # @param [String,Array<String>] user_ids one id, or a list of ids (one job for a batch of
    #   users, see +SideFxUserService#after_destroy_all+). They are looked up and deleted
    #   together, +Matomo::Client::USERS_PER_REQUEST+ at a time.
    def run(user_ids)
      Matomo::Client.new.delete_user_data(user_ids, site_ids: tenant_site_ids)
    rescue Matomo::Client::MissingBaseUriError
      # Ignore, assuming that Matomo was not configured.
    rescue Matomo::Client::MissingAuthorizationTokenError
      # If Matomo is configured, an authorization token should also be provided.
      raise if ENV.key?('MATOMO_HOST')
    end

    private

    # The sites that track the tenant: its users can't have visits in other sites.
    def tenant_site_ids
      settings = AppConfiguration.instance.settings('matomo') || {}
      settings.values_at('tenant_site_id', 'product_site_id').compact_blank.uniq
    end
  end
end
