# frozen_string_literal: true

module PublicApi
  class V2::GlobalTopicsController < PublicApiController
    include DeletedItemsAction

    def index
      list_items GlobalTopic.all, V2::GlobalTopicSerializer
    end

    def show
      show_item GlobalTopic.find(params[:id]), V2::GlobalTopicSerializer
    end
  end
end
