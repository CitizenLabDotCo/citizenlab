module SmartGroups
  class WebApi::V1::Permissions::ParticipationConditionsController < ApplicationController
    before_action :set_permission, only: %i[participation_conditions]
    skip_after_action :verify_policy_scoped, only: %i[index]
    skip_before_action :authenticate_user, only: %i[index]

    def index
      render json: @permission.participation_conditions, status: :ok
    end

    private

    def set_permission
      @permission = Permission.find_by!(action: params[:permission_action],
                                        permission_scope_id: params[params[:parent_param]])
    end
  end
end
