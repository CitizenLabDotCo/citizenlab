# frozen_string_literal: true

module CustomMaps
  module WebApi
    module V1
      class MapConfigsController < ApplicationController
        before_action :set_map_config, only: %i[show update destroy]
        after_action :verify_authorized
        skip_after_action :verify_policy_scoped

        def create
          authorize @map_config, :create?, policy_class: MapConfigPolicy
          @map_config = MapConfig.new(map_config_params)

          if @map_config.save
            side_fx_service.after_create(@map_config, current_user)
            render json: serialized_map_config, status: :created
          else
            render json: { errors: @map_config.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          authorize @map_config, :update?, policy_class: MapConfigPolicy

          if @map_config.update(map_config_params)
            side_fx_service.after_update(@map_config, current_user)
            render json: serialized_map_config
          else
            render json: { errors: @map_config.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          authorize @map_config, :destroy?, policy_class: MapConfigPolicy

          map_config = @map_config.destroy
          if map_config.destroyed?
            side_fx_service.after_destroy(map_config, current_user)
            head :no_content
          else
            render json: { errors: @map_config.errors.details }, status: :unprocessable_entity
          end
        end

        def show
          authorize @map_config, :show?, policy_class: MapConfigPolicy

          render json: serialized_map_config, status: :ok
        end

        def duplicate_map_config_and_layers
          authorize @map_config, :duplicate_map_config_and_layers?, policy_class: MapConfigPolicy

          original_map_config = MapConfig.find(params[:id])
          new_map_config = original_map_config.dup
          new_map_config.mappable = nil

          ActiveRecord::Base.transaction do
            if new_map_config.save
              new_map_config_layers = original_map_config.layers.map(&:dup)
              new_map_config_layers.each do |layer|
                layer.map_config = new_map_config
                layer.save!
              end
              @map_config = new_map_config
              side_fx_service.after_create(@map_config, current_user)
              render json: serialized_map_config, status: :created
            else
              render json: { errors: @map_config.errors.details }, status: :unprocessable_entity
            end
          end
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
            .permit(
              :mappable_id,
              :mappable_type,
              :zoom_level,
              :tile_provider,
              :esri_web_map_id,
              :esri_base_map_id,
              center_geojson: {}
            )
        end

        def side_fx_service
          @side_fx_service ||= SideFxMapConfigService.new
        end
      end
    end
  end
end
