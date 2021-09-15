# frozen_string_literal: true

module Insights
  module WebApi::V1
    class CategoriesController < ::ApplicationController
      def show
        render json: serialize(category)
      end

      def index
        render json: serialize(categories)
      end

      def create
        category = authorize(::Insights::Category.new(create_params))
        if category.save
          render json: serialize(category), status: :created
        else
          render json: { errors: category.errors.details }, status: :unprocessable_entity
        end
      end

      def update
        if category.update(update_params)
          render json: serialize(category)
        else
          render json: { errors: category.errors.details }, status: :unprocessable_entity
        end
      end

      def destroy
        status = category.destroy.destroyed? ? :ok : 500
        head status
      end

      def destroy_all
        authorize(::Insights::Category)
        categories.destroy_all
        processed_service.resets_flags(view)
        status = categories.count.zero? ? :ok : 500
        head status
      end

      private

      def processed_service
        @processed_service ||= Insights::ProcessedFlagsService.new
      end

      def view
        View.includes(:categories).find(params.require(:view_id))
      end

      def categories
        @categories ||= policy_scope(
          view.categories
        )
      end

      def create_params
        @create_params ||= params.require(:category)
                                 .permit(:name)
                                 .merge(view_id: params.require(:view_id))
      end

      def update_params
        @update_params ||= params.require(:category).permit(:name)
      end

      # @param categories One or a collection of categories
      def serialize(categories)
        Insights::WebApi::V1::CategorySerializer.new(categories).serialized_json
      end

      def category
        @category ||= authorize(
          Category.find_by!(id: params.require(:id), view_id: params.require(:view_id))
        )
      end
    end
  end
end
