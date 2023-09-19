# frozen_string_literal: true

module PublicApi
  class V2::InitiativesController < PublicApiController
    include DeletedItemsAction

    def index
      initiatives = Initiative
        .order(created_at: :desc)
        .page(params[:page_number])
        .per(num_per_page)

      initiatives = common_date_filters(initiatives)

      render json: initiatives,
        each_serializer: V2::InitiativeSerializer,
        adapter: :json,
        meta: meta_properties(initiatives)
    end

    def show
      show_item Initiative.find(params[:id]), V2::InitiativeSerializer
    end
  end
end
