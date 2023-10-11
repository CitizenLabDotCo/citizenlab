# frozen_string_literal: true

# Controller to allow users to be created by project moderators and admins
# in the bulk importer - but without sending the usual emails

module BulkImportIdeas
  class WebApi::V1::ProjectUsersController < ApplicationController
    before_action :authorize_project, only: %i[create_user]

    def create_user
      user = User.new
      user.assign_attributes(permitted_attributes(user))
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
      project = Project.find(params[:id])
      authorize project
    end
  end
end
