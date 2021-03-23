# frozen_string_literal: true

module GranularPermissions
  class WebApi::V1::PermissionsController < ApplicationController
    before_action :set_permission, only: %i[participation_conditions]

    def participation_conditions
      render json: @permission.participation_conditions, status: :ok
    end

    private

    def set_permission
      @permission = authorize Permission.find_by!(action: permission_action, permission_scope_id: permission_scope_id)
    end

    def secure_controller?
      false
    end
  end
end
