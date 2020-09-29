module AdminApi
  class LayersController < AdminApiController

    def create
      layer_attributes = params.require(:data).require(:attributes)
                               .permit(:default_enabled, title_multiloc: {})
      layer_attributes.merge!({
        geojson: params.dig(:data, :attributes, :geojson).try(:permit!),  # allow everything for geojson
        map_config_id: params[:map_config_id],
      })

      new_layer = Maps::Layer.create(layer_attributes)
      if new_layer.save
        render json: LayerSerializer.new(new_layer)
      else
        render json: {errors: new_layer.errors.details}, status: :unprocessable_entity
      end
    end

    def destroy
      layer = Maps::Layer.destroy(params[:id])
      layer.destroyed? ? head(:ok) : head(500)
    end

    def index
      layers = Maps::Layer.where(map_config_id: params["map_config_id"])
      render json: LayerSerializer.new(layers)
    end

    def show
      layer = Maps::Layer.where(map_config_id: params["map_config_id"], id: params["id"]).first
      render json: LayerSerializer.new(layer)
    end

    # Not exposed in route.rb at the moment
    def update
      layer_attributes = params.require(:data).require(:attributes)
                             .permit(:default_enabled, title_multiloc: {})
      layer_attributes.merge!({
                                  geojson: params.dig(:data, :attributes, :geojson).try(:permit!),  # allow everything for geojson
                                  map_config_id: params[:map_config_id],
                              })

      layer = Maps::Layer.find(params["id"])
      if layer.update(layer_attributes)
        render json: LayerSerializer.new(layer)
      else
        render json: {errors: layer.errors.details}, status: :unprocessable_entity
      end
    end
  end
end