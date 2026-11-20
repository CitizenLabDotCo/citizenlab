# frozen_string_literal: true

module Matomo
  module Patches
    module SideFxUserService
      def after_destroy(frozen_user, current_user, **)
        super
        RemoveUserFromMatomoJob.perform_later(frozen_user.id, site_ids: RemoveUserFromMatomoJob.tenant_site_ids)
      end
    end
  end
end
