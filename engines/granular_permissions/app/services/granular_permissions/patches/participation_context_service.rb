# frozen_string_literal: true

module GranularPermissions
  module Patches
    module ParticipationContextService
      def permission_denied?(user, action, context)
        permissions_service.denied?(user, action, context)
      end
      
      def permissions_service
        @permissions_service ||= ::PermissionsService.new
      end
    end
  end
end
