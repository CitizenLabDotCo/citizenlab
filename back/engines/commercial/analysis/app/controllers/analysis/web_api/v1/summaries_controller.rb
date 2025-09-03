# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class SummariesController < ApplicationController
        include FilterParamsExtraction
        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis
        before_action :set_summary, only: %i[show regenerate]

        def show
          render json: SummarySerializer.new(@summary, params: jsonapi_serializer_params).serializable_hash
        end

        # Used to check whether a summary is possible with the given filters,
        # front-end should call this before initiating the summary
        def pre_check
          @summary = Summary.new(
            background_task: SummarizationTask.new(analysis: @analysis),
            insight_attributes: insight_attributes
          )
          plan = SummarizationMethod::Base.plan(@summary)
          render json: SummaryPreCheckSerializer.new(
            plan,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        def create
          @summary = Summary.new(insight_attributes: insight_attributes)
          plan = plan_task
          if !plan.possible?
            render json: { errors: { base: [{ error: plan.impossible_reason }] } }, status: :unprocessable_entity
            return
          end

          if @summary.save
            side_fx_service.after_create(@summary, current_user)
            SideFxBackgroundTaskService.new.after_create(@summary.background_task, current_user)
            SummarizationJob.perform_later(@summary)
            render json: SummarySerializer.new(
              @summary,
              params: jsonapi_serializer_params,
              include: [:background_task]
            ).serializable_hash, status: :created
          else
            render json: { errors: @summary.errors.details }, status: :unprocessable_entity
          end
        end

        def regenerate
          if !@summary.background_task.finished?
            render json: { errors: { base: [{ error: :previous_task_not_yet_finished }] } }, status: :unprocessable_entity
            return
          end
          plan = plan_task
          if !plan.possible?
            render json: { errors: { base: [{ error: plan.impossible_reason }] } }, status: :unprocessable_entity
            return
          end

          if @summary.save
            side_fx_service.after_regenerate(@summary, current_user)
            SummarizationJob.perform_later(@summary)
            render json: SummarySerializer.new(
              @summary,
              params: jsonapi_serializer_params,
              include: [:background_task]
            ).serializable_hash, status: :created
          else
            render json: { errors: @summary.errors.details }, status: :unprocessable_entity
          end
        end

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def set_summary
          @summary = Summary
            .joins(:insight)
            .where(insight: { analysis: @analysis })
            .find(params[:id])
        end

        def insight_attributes
          {
            analysis: @analysis,
            filters: filters(params[:summary][:filters]),
            custom_field_ids: {
              main_custom_field_id: @analysis.main_custom_field_id,
              additional_custom_field_ids: @analysis.additional_custom_field_ids
            }
          }
        end

        def side_fx_service
          @side_fx_service ||= SideFxSummaryService.new
        end

        def plan_task
          @summary.background_task = SummarizationTask.new(analysis: @analysis)
          plan = SummarizationMethod::Base.plan(@summary)
          if plan.possible?
            @summary.summarization_method = plan.summarization_method_class::SUMMARIZATION_METHOD
            @summary.accuracy = plan.accuracy
          end
          plan
        end
      end
    end
  end
end
