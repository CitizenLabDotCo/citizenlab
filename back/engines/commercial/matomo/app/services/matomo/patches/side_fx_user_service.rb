# frozen_string_literal: true

module Matomo
  module Patches
    module SideFxUserService
      def after_destroy_all(user_ids)
        super
        RemoveUserFromMatomoJob.perform_later(user_ids)
      end
    end
  end
end
