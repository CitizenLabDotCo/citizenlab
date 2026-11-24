# frozen_string_literal: true

module Matomo
  class RemoveUserFromMatomoJob < ApplicationJob
    self.priority = 70 # Lower priority than default, but still higher than DeleteUserJob.

    # @param [String,Array<String>] user_ids one id, or a list of ids (one job for a batch of
    #   users, see +SideFxUserService#after_destroy_all+). The users are removed one after the
    #   other, which also keeps the load on Matomo low.
    def run(user_ids)
      client = Matomo::Client.new
      Array(user_ids).each { |user_id| client.delete_user_data(user_id) }
    rescue Matomo::Client::MissingBaseUriError
      # Ignore, assuming that Matomo was not configured.
    rescue Matomo::Client::MissingAuthorizationTokenError
      # If Matomo is configured, an authorization token should also be provided.
      raise if ENV.key?('MATOMO_HOST')
    end
  end
end
