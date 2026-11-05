# frozen_string_literal: true

module PublicApi
  class V2::InputTopicsController < PublicApiController
    include DeletedItemsAction

    def index
      list_items InputTopic.all, V2::InputTopicSerializer
    end

    def show
      show_item InputTopic.find(params[:id]), V2::InputTopicSerializer
    end
  end
end
