# frozen_string_literal: true

# Controller to allow users to be created by project moderators and admins
# in the bulk importer - but without sending the usual emails

module BulkImportIdeas
  class WebApi::V1::PhaseUsersController < ApplicationController
    before_action :authorize_project, only: %i[create_user]

    # called when approving individual inputs
    def create_user
      user = User.new
      UserService.build_in_input_importer(user_params(user), user)

      if user.save
        render json: ::WebApi::V1::UserSerializer.new(
          user,
          params: jsonapi_serializer_params
        ).serializable_hash, status: :created
      else
        render json: { errors: user.errors.details }, status: :unprocessable_entity
      end
    end

    private

    def authorize_project
      project = Phase.find(params[:id]).project
      authorize project
    end

    def user_params(user)
      params.require(:user).permit(policy(user).permitted_attributes_for_update + [:email])
    end
  end
end
