# frozen_string_literal: true

module Matomo
  module Patches
    module SideFxUserService
      def after_destroy(frozen_user, current_user, **)
        super
        RemoveUserFromMatomoJob.perform_later(frozen_user.id)
      end
    end
  end
end
