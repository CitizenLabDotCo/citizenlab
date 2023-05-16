# frozen_string_literal: true

module Insights
  module WebApi
    module V1
      class ClassificationTasksController < ::ApplicationController
        skip_after_action :verify_policy_scoped, only: [:index]
        after_action :verify_authorized, only: [:index]

        def index
          tasks = ZeroshotClassificationTasksFinder.new(
            categories || view.categories, # use all the categories if the query parameter is not provided
            inputs: inputs
          ).execute

          render json: ZeroshotClassificationTaskSerializer.new(tasks, params: jsonapi_serializer_params), status: :ok
        end

        def count
          count = ZeroshotClassificationTasksFinder.new(
            categories || view.categories, # use all the categories if the query parameter is not provided
            inputs: inputs
          ).execute.count

          render json: { data: { count: count, type: 'categories_suggestions_task_count' } }, status: :ok
        end

        def create
          Insights::CreateClassificationTasksJob.perform_now(
            view,
            categories: categories,
            input_filter: inputs_params
          )

          head :accepted
        end

        def destroy_tasks
          tasks = ZeroshotClassificationTasksFinder.new(
            categories || view.categories, # use all the categories if the query parameter is not provided
            inputs: inputs
          ).execute

          Insights::CategorySuggestionsService.new.cancel(tasks)
          status = tasks.map(&:destroyed?).all? ? :ok : :internal_server_error
          head status
        end

        private

        # @return [Insights::View]
        def view
          @view ||= authorize(
            View.includes(:data_sources).find(params.require(:view_id)),
            :destroy?
          )
        end

        # @return [Idea::ActiveRecord_Relation, nil]
        def inputs
          @inputs ||= Insights::InputsFinder.new(view, inputs_params).execute if inputs_params
        end

        def inputs_params
          @inputs_params ||=
            params.permit(
              inputs: [:processed, { categories: [], keywords: [] }]
            )[:inputs].to_h
        end

        # @return [Array<Insights::Category>, nil]
        def categories
          @categories ||= view.categories.find(params[:categories]) if params.key?(:categories)
        end
      end
    end
  end
end
