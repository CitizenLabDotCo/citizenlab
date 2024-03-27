# frozen_string_literal: true

# Controller to allow users to be created by project moderators and admins
# in the bulk importer - but without sending the usual emails

module BulkImportIdeas
  class WebApi::V1::PhaseUsersController < ApplicationController
    before_action :authorize_project, only: %i[create_user]

    def create_user
      user = User.new
      user.assign_attributes user_params(user)
      if user.email.blank?
        user.unique_code = SecureRandom.uuid
      end

      if user.save
        render json: ::WebApi::V1::UserSerializer.new(
          user,
          params: jsonapi_serializer_params
        ).serializable_hash, status: :created
      else
        render json: { errors: user.errors.details }, status: :unprocessable_entity
      end
    end

    def authorize_project
      project = Phase.find(params[:id]).project
      authorize project
    end

    private

    def user_params(user)
      params.require(:user).permit(UserPolicy.new(current_user, user).permitted_attributes_for_create)
    end
  end
end
