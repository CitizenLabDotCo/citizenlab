module AdminApi
  class MapConfigsController < AdminApiController

    def create
      all_attributes = params.require(:data).require(:attributes)
      attributes = all_attributes.permit(:zoom_level, :tile_provider, :project_id)
      config = Maps::MapConfig.create(attributes)

      center = all_attributes.require(:center).permit(:type, coordinates: []).to_h  # dealt separately bc GeoJSON needs to be parsed
      config.center_geojson = center

      if config.save
        options = {include: [:layers]}
        render json: MapConfigSerializer.new(config, options)
      else
        render json: {errors: config.errors.details}, status: :unprocessable_entity
      end
    end

    def destroy
      config = Maps::MapConfig.destroy(params["id"])
      config.destroyed? ? head(:ok) : head(500)
    end

    def index
      options = {include: [:layers]}
      render json: MapConfigSerializer.new(Maps::MapConfig.all, options)
    end

    def show
      map_config = Maps::MapConfig.find(params["id"])
      options = {include: [:layers]}
      render json: MapConfigSerializer.new(map_config, options)
    end

    def update
      config = Maps::MapConfig.find(params["id"])

      all_attributes = params.require(:data).require(:attributes)
      attributes = all_attributes.permit(:zoom_level, :tile_provider)
      config.update(attributes)

      center = all_attributes.require(:center).permit(:type, coordinates: []).to_h  # dealt separately bc GeoJSON needs to be parsed
      config.center_geojson = center

      if config.save
        options = {include: [:layers]}
        render json: MapConfigSerializer.new(config, options)
      else
        render json: {errors: config.errors.details}, status: :unprocessable_entity
      end
    end
  end
end
