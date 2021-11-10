# frozen_string_literal: true

module Matomo
  class RemoveUserFromMatomoJob < ApplicationJob
    self.priority = 70 # lower priority than default, but still higher than DeleteUserJob

    def run(user_id)
      Matomo::Client.new.delete_user_data(user_id)
    rescue Matomo::Client::MissingBaseUriError
      # Ignore, assuming that matomo was not configured.
    rescue Matomo::Client::MissingAuthorizationTokenError
      # If Matomo is configured, an authorization token should also be provided.
      raise if ENV.key?('MATOMO_HOST')
    end
  end
end
