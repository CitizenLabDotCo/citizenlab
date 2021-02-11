module Maps
  module WebApi
    module V1
      class LayersController < MapsController
        before_action :set_layer, except: %i[create]

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

        def show
          render json: serialized_layer
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

        def serialized_layer
          Maps::WebApi::V1::LayerSerializer.new(@layer).serialized_json
        end

        def layer_errors
          { errors: @layer.errors.details }
        end

        def set_layer
          @layer = Maps::Layer.find(params[:id])
        end
      end
    end
  end
end
