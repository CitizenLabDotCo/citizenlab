# frozen_string_literal: true

module Insights
  module WebApi::V1
    class ViewsController < ::ApplicationController
      def show
        render json: serialize(view), status: :ok
      end

      def index
        views = policy_scope(Insights::View.includes(:scope))
        render json: serialize(views)
      end

      def create
        view = authorize(Insights::View.new(create_params))
        if view.save
          topic_import_service.copy_assignments(view, current_user)
          processed_service.set_processed(view.scope.ideas, [view.id])
          render json: serialize(view), status: :created
        else
          render json: { errors: view.errors.details }, status: :unprocessable_entity
        end
      end

      def update
        if view.update(update_params)
          render json: serialize(view), status: :ok
        else
          render json: { errors: view.errors.details }, status: :unprocessable_entity
        end
      end

      def destroy
        status = view.destroy.destroyed? ? :ok : 500
        head status
      end

      private

      def topic_import_service
        @topic_import_service ||= Insights::TopicImportService.new
      end

      def processed_service
        @processed_service ||= Insights::ProcessedFlagsService.new
      end

      def create_params
        @create_params ||= params.require(:view).permit(:name, :scope_id)
      end

      def update_params
        @update_params ||= params.require(:view).permit(:name)
      end

      # @param views One view or a collection of views
      def serialize(views)
        options = {
          include: [:scope],
          params: fastjson_params,
          fields: { project: [:title_multiloc, :slug] }
        }

        Insights::WebApi::V1::ViewSerializer.new(views, options).serialized_json
      end

      def view
        @view ||= authorize(View.includes(:scope).find(params[:id]))
      end
    end
  end
end
