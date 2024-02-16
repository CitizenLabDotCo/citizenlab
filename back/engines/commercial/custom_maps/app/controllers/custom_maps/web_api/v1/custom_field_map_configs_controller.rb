# frozen_string_literal: true

module CustomMaps
  module WebApi
    module V1
      class CustomFieldMapConfigsController < ApplicationController
        before_action :set_custom_field
        before_action :set_map_config, only: %i[update destroy]

        def create
          @map_config = @custom_field.build_map_config(map_config_params)

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
          @custom_field = CustomField.includes(map_config: %i[layers legend_items]).find(params[:custom_field_id])
          @map_config = @custom_field.map_config
          render json: serialized_map_config, status: :ok
        end

        private

        def set_map_config
          authorize @custom_field, policy_class: MapConfigCustomFieldPolicy

          @map_config = CustomMaps::MapConfig.find_by!(mappable_id: params[:custom_field_id])
        end

        def serialized_map_config
          CustomMaps::WebApi::V1::MapConfigSerializer.new(@map_config, params: jsonapi_serializer_params)
            .serializable_hash.to_json
        end

        def map_config_params
          params.require(:map_config).permit(:zoom_level, :tile_provider, :esri_web_map_id, center_geojson: {})
        end
      end
    end
  end
end
