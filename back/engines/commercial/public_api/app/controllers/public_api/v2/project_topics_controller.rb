# frozen_string_literal: true

module PublicApi
  class V2::ProjectTopicsController < PublicApiController
    def index
      list_items(ProjectsTopic.all, V2::ProjectTopicSerializer)
    end
  end
end
