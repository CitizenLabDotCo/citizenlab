# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class BackgroundTasksController < ApplicationController
        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis
        before_action :set_background_task, only: [:show]

        def index
          background_tasks = @analysis.background_tasks

          background_tasks = background_tasks
            .where(state: %w[queued in_progress])
            .or(background_tasks.where('ended_at >= ?', 24.hours.ago))

          background_tasks = background_tasks.order(created_at: :desc)

          render json: WebApi::V1::BackgroundTaskSerializer.new(background_tasks, params: jsonapi_serializer_params).serializable_hash
        end

        def show
          render json: WebApi::V1::BackgroundTaskSerializer.new(@background_task, params: jsonapi_serializer_params).serializable_hash
        end

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def set_background_task
          @background_task = @analysis.background_tasks.find(params[:id])
        end
      end
    end
  end
end
