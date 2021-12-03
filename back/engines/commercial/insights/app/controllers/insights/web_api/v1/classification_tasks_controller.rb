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

          render json: ZeroshotClassificationTaskSerializer.new(tasks, params: fastjson_params), status: :ok
        end

        def create
          Insights::CreateClassificationTasksJob.perform_now(
            view,
            categories: categories,
            input_filter: inputs_params
          )

          head :accepted
        end

        def destroy_all
          tasks = ZeroshotClassificationTasksFinder.new(view.categories).execute.destroy_all
          status = tasks.map(&:destroyed?).all? ? :ok : :internal_server_error
          head status
        end

        def destroy
          # We find the task via the finder to make sure it's associated with the right view.
          # [TODO] Actually, nothing prevents a task from being associated to categories from several views.
          task = ZeroshotClassificationTasksFinder.new(view.categories).execute.find(params[:id])
          status = task.destroy.destroyed? ? :ok : :internal_server_error
          head status
        end

        private

        # @return [Insights::View]
        def view
          @view ||= authorize(
            View.includes(:scope).find(params.require(:view_id)),
            :destroy?
          )
        end

        # @return [Idea::ActiveRecord_Relation, nil]
        def inputs
          @inputs ||= Insights::InputsFinder.new(view, inputs_params).execute if inputs_params
        end

        def inputs_params
          @inputs_params ||=
            params.permit(inputs: [:processed, categories: [], keywords: []])
                  .fetch(:inputs, nil)
                  .presence
        end



        # @return [Array<Insights::Category>, nil]
        def categories
          @categories ||= view.categories.find(params[:categories]) if params.key?(:categories)
        end
      end
    end
  end
end
