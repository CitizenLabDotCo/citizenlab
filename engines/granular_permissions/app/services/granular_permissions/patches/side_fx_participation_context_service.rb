# frozen_string_literal: true

module GranularPermissions
  module Patches
    module SideFxParticipationContextService
      def self.prepended(base)
        base.class_eval do
          attr_writer :permissions_service
        end
      end
      
      def after_create(pc, _user)
        permissions_service.update_permissions_for_scope(pc)
        super
      end

      def after_update(pc, _user)
        permissions_service.update_permissions_for_scope(pc)
        super
      end

      def permissions_service
        @permissions_service ||= PermissionsService.new
      end
    end
  end
end
