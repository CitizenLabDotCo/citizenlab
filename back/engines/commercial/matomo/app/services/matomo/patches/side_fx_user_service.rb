# frozen_string_literal: true

module Matomo
  module Patches
    module SideFxUserService
      def after_destroy_all(user_ids, wait: 0)
        super
        RemoveUserFromMatomoJob.set(wait:).perform_later(user_ids)
      end
    end
  end
end
