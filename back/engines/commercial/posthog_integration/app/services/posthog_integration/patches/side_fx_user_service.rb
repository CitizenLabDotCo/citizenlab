# frozen_string_literal: true

module PosthogIntegration
  module Patches
    module SideFxUserService
      def after_destroy_all(user_ids)
        super
        RemoveUserFromPosthogJob.perform_later(user_ids)
      end
    end
  end
end
