# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class AutoTaggingsController < ApplicationController
        include FilterParamsExtraction

        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis

        def create
          maybe_filters = if (filter_params = params[:auto_tagging][:filters])
            filters(filter_params)
          end

          @auto_tagging_task = AutoTaggingTask.new(
            analysis: @analysis,
            filters: maybe_filters || {},
            **auto_tagging_params
          )
          if @auto_tagging_task.save
            side_fx_service.after_create(@auto_tagging_task, current_user)
            AutoTaggingJob.perform_later(@auto_tagging_task)
            head :accepted
          else
            render json: { errors: @auto_tagging_task.errors.details }, status: :unprocessable_entity
          end
        end

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def auto_tagging_params
          params.require(:auto_tagging).permit(
            :auto_tagging_method,
            tags_ids: []
          )
        end

        def side_fx_service
          @side_fx_service ||= SideFxBackgroundTaskService.new
        end
      end
    end
  end
end
