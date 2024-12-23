# frozen_string_literal: true

module PublicApi
  class V2::AreasController < PublicApiController
    include DeletedItemsAction

    def index
      list_items Area.all, V2::AreaSerializer
    end

    def show
      show_item Area.find(params[:id]), V2::AreaSerializer
    end
  end
end
