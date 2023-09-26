# frozen_string_literal: true

module PublicApi
  class V2::EventsController < PublicApiController
    include DeletedItemsAction

    def index
      list_items Event.all, V2::EventSerializer
    end

    def show
      show_item Event.find(params[:id]), V2::EventSerializer
    end
  end
end
