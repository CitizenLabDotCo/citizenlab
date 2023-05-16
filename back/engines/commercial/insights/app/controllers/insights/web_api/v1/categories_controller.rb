# frozen_string_literal: true

module Insights
  module WebApi::V1
    class CategoriesController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: :index # The view is authorized instead.
      after_action :verify_authorized, only: %i[index destroy_all]

      def show
        render json: serialize(category)
      end

      def index
        render json: serialize(view.categories)
      end

      def create
        category = Insights::Category.new(create_params)
        authorize(category.view, :update?)

        ActiveRecord::Base.transaction do
          category.save!
          assign_to_inputs(category, input_filter_params)
        rescue ActiveRecord::RecordInvalid => e
          render json: { errors: e.record.errors.details }, status: :unprocessable_entity
        else
          SideFxCategoryService.new.after_create(category, current_user)
          render json: serialize(category), status: :created
        end
      end

      def update
        if category.update(update_params)
          SideFxCategoryService.new.after_update(category, current_user)
          render json: serialize(category)
        else
          render json: { errors: category.errors.details }, status: :unprocessable_entity
        end
      end

      def destroy
        if category.destroy.destroyed?
          SideFxCategoryService.new.after_destroy(category, current_user)
          head :ok
        else
          head :internal_server_error
        end
      end

      def destroy_all
        view.categories.destroy_all
        processed_service.resets_flags(view)
        status = view.categories.count.zero? ? :ok : 500
        head status
      end

      private

      # Assigns the category to the set of inputs corresponding the filter parameters.
      # The filter parameters are those supported by +Insights::InputsFinder+.
      #
      # @param [Insights::Category] category
      # @param [Hash] input_filter_params
      def assign_to_inputs(category, input_filter_params)
        return if input_filter_params.blank?

        inputs = Insights::InputsFinder.new(view, input_filter_params).execute
        Insights::CategoryAssignmentsService.new.add_assignments_batch(inputs, [category])
      end

      def view
        @view ||= authorize(
          View.includes(:categories).find(params.require(:view_id)),
          :update?
        )
      end

      def category
        @category ||= view.categories.find(params.require(:id))
      end

      def create_params
        @create_params ||= params.require(:category)
          .permit(:name)
          .merge(view_id: params.require(:view_id))
      end

      def input_filter_params
        @input_filter_params ||= params.require(:category)
          .permit(inputs: [:search, { keywords: [], categories: [] }])
          .fetch(:inputs, nil)
      end

      def update_params
        @update_params ||= params.require(:category).permit(:name)
      end

      def processed_service
        @processed_service ||= Insights::ProcessedFlagsService.new
      end

      # @param categories One or a collection of categories
      def serialize(categories)
        Insights::WebApi::V1::CategorySerializer.new(categories).serializable_hash.to_json
      end
    end
  end
end
