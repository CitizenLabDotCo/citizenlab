# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class SummariesController < ApplicationController
        include FilterParamsExtraction
        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis
        before_action :set_summary, only: [:destroy]

        def index
          summaries = @analysis.summaries
            .order(created_at: :asc)
            .includes(:background_task)
          render json: WebApi::V1::SummarySerializer.new(
            summaries,
            params: jsonapi_serializer_params,
            include: [:background_task]
          ).serializable_hash
        end

        # Used to check whether a summary is possible with the given filters,
        # front-end should call this before initiating the summary
        def pre_check
          @summary = Summary.new(
            analysis: @analysis,
            background_task: SummarizationTask.new(analysis: @analysis),
            filters: filters(params[:summary][:filters])
          )
          plan = SummarizationMethod::Base.plan(@summary)
          render json: WebApi::V1::SummaryPreCheckSerializer.new(
            plan,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        def create
          @summary = Summary.new(
            analysis: @analysis,
            background_task: SummarizationTask.new(analysis: @analysis),
            filters: filters(params[:summary][:filters])
          )
          plan = SummarizationMethod::Base.plan(@summary)
          @summary.summarization_method = plan.summarization_method_class::SUMMARIZATION_METHOD
          @summary.accuracy = plan.accuracy

          if @summary.save && plan.possible?
            side_fx_service.after_create(@summary, current_user)
            SummarizationJob.perform_later(@summary)
            render json: WebApi::V1::SummarySerializer.new(
              @summary,
              params: jsonapi_serializer_params,
              include: [:background_task]
            ).serializable_hash, status: :created
          else
            render json: { errors: @summary.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          if @summary.destroy
            side_fx_service.after_destroy(@summary, current_user)
            head :ok
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
          @summary = @analysis.summaries.find(params[:id])
        end

        def side_fx_service
          @side_fx_service ||= SideFxSummaryService.new
        end
      end
    end
  end
end
