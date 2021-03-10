module CustomMaps
  module WebApi
    module V1
      class LayersController < ::Maps::WebApi::V1::LayersController
        skip_before_action :set_layer, only: %i[create]

        def create
          @map_config = @project.map_config
          @layer = @map_config.layers.build(layer_params)

          if @layer.save
            render json: serialized_layer, status: :ok
          else
            render json: layer_errors, status: :unprocessable_entity
          end
        end

        def update
          if @layer.update(layer_params)
            render json: serialized_layer, status: :ok
          else
            render json: layer_errors, status: :unprocessable_entity
          end
        end

        def destroy
          if @layer.destroy
            head :no_content
          else
            render json: layer_errors, status: :unprocessable_entity
          end
        end

        def reorder
          if @layer.insert_at(params.dig(:layer, :ordering))
            render json: serialized_layer, status: :ok
          else
            render json: layer_errors, status: :unprocessable_entity
          end
        end

        private

        def layer_params
          params.require(:layer)
                .permit(
                  :default_enabled,
                  :marker_svg_url,
                  geojson_file: %i[filename base64],
                  title_multiloc: CL2_SUPPORTED_LOCALES
                ).tap do |whitelisted|
                  whitelisted[:geojson] = params.dig(:layer, :geojson)
                  whitelisted.permit!
                end
        end

        def layer_errors
          { errors: @layer.errors.details }
        end
      end
    end
  end
end
