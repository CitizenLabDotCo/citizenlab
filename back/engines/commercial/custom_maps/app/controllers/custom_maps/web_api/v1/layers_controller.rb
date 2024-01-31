# frozen_string_literal: true

module CustomMaps
  module WebApi
    module V1
      class LayersController < ApplicationController
        before_action :set_layer, except: %i[create]

        def create
          authorize @project, :update?
          @map_config = @project.map_config
          @layer = @map_config.layers.build(create_params)

          if @layer.save
            render json: serialized_layer, status: :ok
          else
            render json: layer_errors, status: :unprocessable_entity
          end
        end

        def update
          authorize @project, :update?
          if @layer.update(update_params)
            render json: serialized_layer, status: :ok
          else
            render json: layer_errors, status: :unprocessable_entity
          end
        end

        def destroy
          authorize @project, :update?
          if @layer.destroy
            head :no_content
          else
            render json: layer_errors, status: :unprocessable_entity
          end
        end

        def show
          authorize @project
          render json: serialized_layer
        end

        def reorder
          authorize @project, :update?
          if @layer.insert_at(params.dig(:layer, :ordering))
            render json: serialized_layer, status: :ok
          else
            render json: layer_errors, status: :unprocessable_entity
          end
        end

        private

        def create_params
          layer_params(base_permitted_params << :type)
        end

        def update_params
          layer_params(base_permitted_params)
        end

        def layer_params(permitted_params)
          params.require(:layer)
            .permit(permitted_params).tap do |whitelisted|
            whitelisted[:geojson] = params.dig(:layer, :geojson)
            whitelisted.permit!
          end
        end

        def base_permitted_params
          [
            :layer_url,
            :default_enabled,
            :marker_svg_url,
            { geojson_file: %i[filename base64] },
            { title_multiloc: CL2_SUPPORTED_LOCALES }
          ]
        end

        def serialized_layer
          case @layer.type
          when 'CustomMaps::GeojsonLayer'
            CustomMaps::WebApi::V1::GeojsonLayerSerializer.new(@layer).serializable_hash.to_json
          when 'CustomMaps::EsriFeatureLayer'
            CustomMaps::WebApi::V1::EsriFeatureLayerSerializer.new(@layer).serializable_hash.to_json
          end
        end

        def layer_errors
          { errors: @layer.errors.details }
        end

        def set_layer
          @layer = CustomMaps::Layer.find(params[:id])
        end
      end
    end
  end
end
