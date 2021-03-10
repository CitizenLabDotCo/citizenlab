module Maps
  module WebApi
    module V1
      class MapConfigsController < MapsController
        def show
          @project = Project.includes(map_config: %i[layers legend_items]).find(params[:project_id])
          authorize @project
          @map_config = @project.map_config
          render json: serialized_map_config, status: :ok
        end

        private

        def serialized_map_config
          Maps::WebApi::V1::MapConfigSerializer.new(@map_config, params: fastjson_params)
                                               .serialized_json
        end
      end
    end
  end
end
