module Maps
  module WebApi
    module V1
      class LayersController < MapsController
        before_action :set_layer

        def show
          render json: serialized_layer
        end

        private

        def serialized_layer
          Maps::WebApi::V1::LayerSerializer.new(@layer).serialized_json
        end

        def set_layer
          @layer = Maps::Layer.find(params[:id])
        end
      end
    end
  end
end
