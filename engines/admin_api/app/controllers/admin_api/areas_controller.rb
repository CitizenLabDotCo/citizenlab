module AdminApi
  class AreasController < AdminApiController

    def index
      @areas = Area.all
      render json: @areas
    end

  end
end
