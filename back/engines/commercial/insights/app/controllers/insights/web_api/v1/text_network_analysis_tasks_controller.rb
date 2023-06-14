# frozen_string_literal: true

module Insights
  module WebApi
    module V1
      class TextNetworkAnalysisTasksController < ::ApplicationController
        skip_after_action :verify_policy_scoped, only: [:index]
        after_action :verify_authorized, only: [:index]

        def index
          render json: TextNetworkAnalysisTaskViewSerializer.new(task_views, params: jsonapi_serializer_params)
        end

        def task_views
          @task_views ||= view.tna_tasks_views
        end

        # @return [Insights::View]
        def view
          @view ||= authorize(
            View.includes(:data_sources).find(params.require(:view_id)),
            :destroy?
          )
        end
      end
    end
  end
end
