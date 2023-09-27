# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class InsightsController < ApplicationController
        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis
        before_action :set_insight, only: [:destroy]

        def index
          insights = @analysis.insights
            .order(created_at: :desc)
            .includes(insightable: :background_task)
          render json: WebApi::V1::InsightSerializer.new(
            insights,
            params: jsonapi_serializer_params,
            include: %i[insightable insightable.background_task]
          ).serializable_hash
        end

        def toggle_bookmark
          insight = @analysis.insights.find(params[:id])
          # toggle the bookmarked attribute
          insight.bookmarked = !insight.bookmarked
          if insight.save
            head :ok
          else
            render json: { errors: insight.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          insightable = @insight.insightable
          side_fx_service = side_fx_service_for_insightable
          if @insight.destroy
            side_fx_service.after_destroy(insightable, current_user)
            head :ok
          else
            render json: { errors: @insight.errors.details }, status: :unprocessable_entity
          end
        end

        def rate
          insight = @analysis.insights.find(params[:id])
          rating = params[:rating]
          side_fx_service.after_rate(insight, current_user, rating)
          head :created
        end

        private

        def side_fx_service
          @side_fx_service ||= SideFxInsightService.new
        end

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def set_insight
          @insight = @analysis.insights.find(params[:id])
        end

        def side_fx_service_for_insightable
          if @insight.analysis_summary?
            SideFxSummaryService.new
          elsif @insight.analysis_question?
            SideFxQuestionService.new
          else
            raise "Undefined sidefx service for #{@insight.insightable_type}"
          end
        end
      end
    end
  end
end
