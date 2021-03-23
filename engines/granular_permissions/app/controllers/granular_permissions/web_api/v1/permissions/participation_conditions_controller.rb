# frozen_string_literal: true

module GranularPermissions
  class WebApi::V1::Permissions::ParticipationConditionsController < ApplicationController
    before_action :set_permission, only: %i[index]

    def index
      render json: @permission.participation_conditions, status: :ok
    end

    private

    def set_permission
      @permission = authorize Permission.find_by!(action: permission_action, permission_scope_id: permission_scope_id)
    end

    def permission_scope_id
      params[params[:parent_param]]
    end

    def permission_action
      params[:permission_action]
    end

    def secure_controller?
      false
    end
  end
end
