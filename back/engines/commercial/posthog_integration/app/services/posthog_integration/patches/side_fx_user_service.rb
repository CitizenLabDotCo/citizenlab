# frozen_string_literal: true

module PosthogIntegration
  module Patches
    module SideFxUserService
      def after_destroy(frozen_user, current_user, **)
        super
        RemoveUserFromPosthogJob.perform_later(frozen_user.id)
      end
    end
  end
end
