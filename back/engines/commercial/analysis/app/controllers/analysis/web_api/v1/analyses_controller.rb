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
          @analyses = @analyses.includes(:custom_fields)

          if params[:project_id]
            @analyses = @analyses.where(project_id: params[:project_id])
          elsif params[:phase_id]
            @analyses = @analyses.where(phase_id: params[:phase_id])
          end

          render json: linked_json(
            @analyses,
            WebApi::V1::AnalysisSerializer,
            params: jsonapi_serializer_params,
            include: [:custom_fields]
          )
        end

        def show
          render json: WebApi::V1::AnalysisSerializer.new(
            @analysis,
            params: jsonapi_serializer_params,
            include: [:custom_fields]
          ).serializable_hash
        end

        def create
          @analysis = ::Analysis::Analysis.new(analysis_params)
          authorize @analysis

          @analysis.custom_field_ids = detect_custom_fields unless analysis_params[:custom_field_ids]

          if @analysis.save
            side_fx_service.after_create(@analysis, current_user)
            render json: WebApi::V1::AnalysisSerializer.new(
              @analysis,
              params: jsonapi_serializer_params,
              include: [:custom_fields]
            ).serializable_hash, status: :created
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

        def analysis_params
          params.require(:analysis).permit(:project_id, :phase_id, custom_field_ids: [])
        end

        def side_fx_service
          @side_fx_service ||= SideFxAnalysisService.new
        end

        def detect_custom_fields
          container = @analysis.phase || @analysis.project
          participation_method = Factory.instance.participation_method_for(container)
          custom_form = container.custom_form || participation_method.create_default_form!

          custom_fields = IdeaCustomFieldsService.new(custom_form).all_fields
          # custom fields can be an array or a scope
          custom_fields.filter(&:support_free_text_value?).map(&:id)
        end
      end
    end
  end
end
