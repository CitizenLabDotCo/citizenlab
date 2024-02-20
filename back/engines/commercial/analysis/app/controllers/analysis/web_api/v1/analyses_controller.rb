# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class AnalysesController < ApplicationController
        before_action :set_analysis, except: %i[index create]

        def index
          authorize ::Analysis::Analysis
          @analyses = policy_scope(::Analysis::Analysis).order(created_at: :asc)
          @analyses = paginate(@analyses)
          @analyses = @analyses.includes(:main_custom_field, :additional_custom_fields)

          if params[:project_id]
            @analyses = @analyses.where(project_id: params[:project_id])
          elsif params[:phase_id]
            @analyses = @analyses.where(phase_id: params[:phase_id])
          end

          render json: linked_json(
            @analyses,
            WebApi::V1::AnalysisSerializer,
            params: jsonapi_serializer_params,
            include: serializer_includes
          )
        end

        def show
          render json: WebApi::V1::AnalysisSerializer.new(
            @analysis,
            params: jsonapi_serializer_params,
            include: serializer_includes
          ).serializable_hash
        end

        def create
          @analysis = ::Analysis::Analysis.new(analysis_params_for_create)
          authorize @analysis

          side_fx_service.before_create(@analysis, current_user)
          if @analysis.save
            side_fx_service.after_create(@analysis, current_user)
            render json: WebApi::V1::AnalysisSerializer.new(
              @analysis,
              params: jsonapi_serializer_params,
              include: serializer_includes
            ).serializable_hash, status: :created
          else
            render json: { errors: @analysis.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          @analysis.assign_attributes analysis_params_for_update
          authorize @analysis

          if @analysis.save
            side_fx_service.after_update(@analysis, current_user)
            render json: WebApi::V1::AnalysisSerializer.new(
              @analysis,
              params: jsonapi_serializer_params,
              include: serializer_includes
            ).serializable_hash, status: :ok
          else
            render json: { errors: @analysis.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          if @analysis.destroy
            side_fx_service.after_destroy(@analysis, current_user)
            head :ok
          else
            render json: { errors: @analysis.errors.details }, status: :unprocessable_entity
          end
        end

        private

        def set_analysis
          @analysis = ::Analysis::Analysis.find(params[:id])
          authorize @analysis
        end

        def analysis_params_for_create
          params.require(:analysis).permit(:project_id, :phase_id, :show_insights, :main_custom_field_id, additional_custom_field_ids: [])
        end

        def analysis_params_for_update
          params.require(:analysis).permit(:show_insights, additional_custom_field_ids: [])
        end

        def side_fx_service
          @side_fx_service ||= SideFxAnalysisService.new
        end

        def serializer_includes
          %i[main_custom_field additional_custom_fields all_custom_fields]
        end
      end
    end
  end
end
