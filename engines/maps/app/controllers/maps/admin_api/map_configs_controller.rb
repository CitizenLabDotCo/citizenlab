module Maps
  module AdminApi
    class MapConfigsController < ::AdminApi::AdminApiController

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
        config = Maps::MapConfig.destroy_by(project_id: params["project_id"])
        config.first.destroyed? ? head(204) : head(500)
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
        config = Maps::MapConfig.find_by(project_id: params[:project_id])
        all_attributes = params.require(:data).require(:attributes)

        attributes = all_attributes.permit(:zoom_level, :tile_provider, :project_id)
        attributes[:project_id] = params[:project_id]

        if request.put?
          config.destroy if config
          config = Maps::MapConfig.create(attributes)
        else # request.patch?
          return send_not_found if config.blank?
          config.update(attributes)
        end

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
end
