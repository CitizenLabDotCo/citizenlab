# frozen_string_literal: true

module CustomMaps
  module WebApi
    module V1
      class MapConfigsController < ApplicationController
        before_action :set_map_config, only: %i[show update destroy]

        def create
          authorize @map_config, :create?, policy_class: MapConfigPolicy
          @map_config = MapConfig.new(map_config_params)

          if @map_config.save
            render json: serialized_map_config, status: :ok
          else
            render json: { errors: @map_config.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          authorize @map_config, :update?, policy_class: MapConfigPolicy

          if @map_config.update(map_config_params)
            render json: serialized_map_config
          else
            render json: { errors: @map_config.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          authorize @map_config, :destroy?, policy_class: MapConfigPolicy

          if @map_config.destroy
            head :no_content
          else
            render json: { errors: @map_config.errors.details }, status: :unprocessable_entity
          end
        end

        def show
          authorize @map_config, :show?, policy_class: MapConfigPolicy

          render json: serialized_map_config, status: :ok
        end

        private

        def set_map_config
          @map_config = MapConfig.find(params[:id])
        end

        def serialized_map_config
          CustomMaps::WebApi::V1::MapConfigSerializer.new(@map_config, params: jsonapi_serializer_params) # Need to include layers, when implemented
            .serializable_hash.to_json
        end

        def map_config_params
          params.require(:map_config)
            .permit(:mappable_id, :mappable_type, :zoom_level, :tile_provider, :esri_web_map_id, center_geojson: {})
        end
      end
    end
  end
end
