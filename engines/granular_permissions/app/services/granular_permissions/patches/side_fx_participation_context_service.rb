# frozen_string_literal: true

module GranularPermissions
  module Patches
    module SideFxParticipationContextService
      def after_create(pc, _user)
        permissions_service.update_permissions_for_context(pc)
        super
      end

      def after_update(pc, _user)
        permissions_service.update_permissions_for_context(pc)
        super
      end

      private

      def permissions_service
        @permissions_service ||= PermissionsService.new
      end
    end
  end
end
