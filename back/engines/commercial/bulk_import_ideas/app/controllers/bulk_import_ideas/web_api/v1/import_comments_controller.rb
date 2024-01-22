# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::ImportCommentsController < ApplicationController
    before_action :authorize_bulk_import_comments, only: %i[bulk_create example_xlsx]

    def bulk_create
      file = import_comments_params[:xlsx]
      comments = import_comments_service.import file
      # users = import_comments_service.imported_users

      render json: ::WebApi::V1::CommentSerializer.new(
        comments,
        params: jsonapi_serializer_params,
        include: %i[author]
      ).serializable_hash, status: :created
    rescue BulkImportIdeas::Error => e
      # sidefx.after_failure current_user, @project
      render json: { errors: { file: [{ error: e.key, **e.params }] } }, status: :unprocessable_entity
    end

    def example_xlsx
      xlsx = import_comments_service.generate_example_xlsx
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'comments.xlsx'
    end

    private

    def import_comments_params
      params
        .require(:import_comments)
        .permit(%i[xlsx locale])
    end

    def authorize_bulk_import_comments
      @project = Project.find(params[:id])
      authorize @project
    end

    def import_comments_service
      # locale = params[:import_comments] ? import_comments_params[:locale] : current_user.locale
      @import_comments_service ||= ImportCommentsService.new(current_user)
    end
  end
end
