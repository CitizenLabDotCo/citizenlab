# frozen_string_literal: true

module CustomMaps
  module WebApi
    module V1
      class MapConfigsController < ApplicationController
        before_action :set_map_config, only: %i[update destroy]

        def create
          authorize @project, :update?
          @map_config = @project.build_map_config(map_config_params)

          if @map_config.save
            render json: serialized_map_config, status: :ok
          else
            render json: { errors: @map_config.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          if @map_config.update(map_config_params)
            render json: serialized_map_config
          else
            render json: { errors: @map_config.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          if @map_config.destroy
            head :no_content
          else
            render json: { errors: @map_config.errors.details }, status: :unprocessable_entity
          end
        end

        def show
          @project = Project.includes(map_config: %i[layers legend_items]).find(params[:project_id])
          authorize @project
          @map_config = @project.map_config
          render json: serialized_map_config, status: :ok
        end

        private

        def set_map_config
          authorize @project, :update?
          @map_config = CustomMaps::MapConfig.find_by!(project_id: params[:project_id])
        end

        def serialized_map_config
          CustomMaps::WebApi::V1::MapConfigSerializer.new(@map_config, params: fastjson_params)
            .serializable_hash.to_json
        end

        def map_config_params
          params.require(:map_config).permit(:zoom_level, :tile_provider, center_geojson: {})
        end
      end
    end
  end
end
