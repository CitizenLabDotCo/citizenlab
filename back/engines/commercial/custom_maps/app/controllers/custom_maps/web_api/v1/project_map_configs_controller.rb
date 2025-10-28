# frozen_string_literal: true

module CustomMaps
  module WebApi
    module V1
      class ProjectMapConfigsController < ApplicationController
        after_action :verify_authorized
        skip_after_action :verify_policy_scoped
        before_action :set_project
        before_action :set_map_config, only: %i[update destroy]

        def create
          authorize @project, :update?
          @map_config = @project.build_map_config(map_config_params)

          if @map_config.save
            side_fx_service.after_create(@map_config, current_user)
            render json: serialized_map_config, status: :ok
          else
            render json: { errors: @map_config.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          if @map_config.update(map_config_params)
            side_fx_service.after_update(@map_config, current_user)
            render json: serialized_map_config
          else
            render json: { errors: @map_config.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          map_config = @map_config.destroy
          if map_config.destroyed?
            side_fx_service.after_destroy(map_config, current_user)
            head :no_content
          else
            render json: { errors: @map_config.errors.details }, status: :unprocessable_entity
          end
        end

        def show
          @project = Project.includes(map_config: %i[layers]).find(params[:project_id])
          authorize @project
          @map_config = @project.map_config

          if @map_config.nil?
            head :no_content
          else
            render json: serialized_map_config, status: :ok
          end
        end

        private

        def set_map_config
          authorize @project, :update?
          @map_config = CustomMaps::MapConfig.find_by!(mappable_id: params[:project_id])
        end

        def serialized_map_config
          CustomMaps::WebApi::V1::MapConfigSerializer.new(@map_config, params: jsonapi_serializer_params)
            .serializable_hash.to_json
        end

        def map_config_params
          params.require(:map_config).permit(:zoom_level, :tile_provider, :esri_web_map_id, center_geojson: {})
        end

        def side_fx_service
          @side_fx_service ||= SideFxMapConfigService.new
        end
      end
    end
  end
end
