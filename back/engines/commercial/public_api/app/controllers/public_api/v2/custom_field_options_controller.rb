# frozen_string_literal: true

module PublicApi
  class V2::CustomFieldOptionsController < PublicApiController
    include DeletedItemsAction

    def index
      list_items CustomFieldOption.where(query_filters), V2::CustomFieldOptionSerializer
    end

    def show
      show_item CustomFieldOption.find(params[:id]), V2::CustomFieldOptionSerializer
    end

    private

    def query_filters
      params.permit(:custom_field_id).to_h
    end
  end
end
