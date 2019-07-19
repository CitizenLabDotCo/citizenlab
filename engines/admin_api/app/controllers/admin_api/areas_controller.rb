module AdminApi
  class AreasController < AdminApiController

    def index
      @areas = Area.all
      # This uses default model serialization
      render json: @areas
    end

  end
end
