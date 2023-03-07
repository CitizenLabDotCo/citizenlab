# frozen_string_literal: true

module Verification
  module Patches
    module PermissionsService
      def denied_when_permitted_by_groups?(user)
        user&.verified? ? super : :not_verified
      end
    end
  end
end
