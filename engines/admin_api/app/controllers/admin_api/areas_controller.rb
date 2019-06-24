module AdminApi
  class AreasController < AdminApiController

    def index
      @areas = Area.all
      render json: WebApi::V1::Fast::AreaSerializer.new(@areas).serialized_json
    end

  end
end
