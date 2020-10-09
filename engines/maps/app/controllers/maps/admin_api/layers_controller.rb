module Maps
  module AdminApi
    class LayersController < ::AdminApi::AdminApiController

      def create
        map_config = Maps::MapConfig.find_by(project_id: params[:project_id])
        return head(400) if map_config.blank?

        layer_attributes = params.require(:data).require(:attributes)
                                 .permit(:default_enabled, title_multiloc: {})
        layer_attributes.merge!({
          geojson: params.dig(:data, :attributes, :geojson).try(:permit!),  # allow everything for geojson
          map_config_id: map_config.id,
        })

        new_layer = Maps::Layer.create(layer_attributes)
        if new_layer.save
          render json: LayerSerializer.new(new_layer)
        else
          render json: {errors: new_layer.errors.details}, status: :unprocessable_entity
        end
      end

      def destroy
        layers = Maps::Layer
                     .includes(:map_config)
                     .where(id: params[:id], maps_map_configs: {project_id: params[:project_id]})
                     .destroy_all

        if layers.blank?
          send_not_found
        elsif layers.first.destroyed?
          head(204)
        else
          head(500)
        end
      end

      def index
        map_config = Maps::MapConfig.includes(:layers).find_by(project_id: params["project_id"])
        return send_not_found unless map_config.present?
        render json: LayerSerializer.new(map_config.layers)
      end

      def show
        layer = Maps::Layer.includes(:map_config).find(params[:id])
        if layer.blank?
          head(404)
        elsif layer.map_config.project_id != params[:project_id]
          return head(400)
        else
          render json: LayerSerializer.new(layer)
        end
      end
    end
  end
end
