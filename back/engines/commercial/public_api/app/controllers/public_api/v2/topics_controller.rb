# frozen_string_literal: true

module PublicApi
  class V2::TopicsController < PublicApiController
    include DeletedItemsAction

    def index
      list_items Topic.all, V2::TopicSerializer
    end

    def show
      show_item Topic.find(params[:id]), V2::TopicSerializer
    end
  end
end
