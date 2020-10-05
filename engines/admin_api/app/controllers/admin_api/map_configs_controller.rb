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
      config = Maps::MapConfig.find_by(project_id: params["project_id"])
      config.destroyed? ? head(:ok) : head(500)
    end

    def index
      options = {include: [:layers]}
      render json: MapConfigSerializer.new(Maps::MapConfig.all, options)
    end

    def show
      map_config = Maps::MapConfig.find_by(project_id: params["project_id"])
      if map_config.present?
        options = {include: [:layers]}
        render json: MapConfigSerializer.new(map_config, options)
      else
        send_not_found
      end
    end

    def update
      config = Maps::MapConfig.find(params["id"])

      all_attributes = params.require(:data).require(:attributes)
      attributes = all_attributes.permit(:zoom_level, :tile_provider)
      config.update(attributes)

      if (center = all_attributes[:center])  # dealt separately bc GeoJSON needs to be parsed
        center = center.permit(:type, coordinates: []).to_h
        config.center_geojson = center
      else
        config.center = nil
      end

      if config.save
        options = {include: [:layers]}
        render json: MapConfigSerializer.new(config, options)
      else
        render json: {errors: config.errors.details}, status: :unprocessable_entity
      end
    end
  end
end
