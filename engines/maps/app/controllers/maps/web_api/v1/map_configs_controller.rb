module Maps
  module WebApi
    module V1
      class MapConfigsController < MapsController

        def show
          @map_config = MapConfig
            .includes(layers: [:legend_items])
            .find_by!(project_id: params[:project_id])

          authorize(@map_config.project, :show?)

          render json: MapConfigSerializer.new(
            @map_config,
            params: fastjson_params
          ).serialized_json
        end

        private

        def secure_controller?
          false
        end

      end
    end
  end
end