# frozen_string_literal: true

module PublicApi
  class V2::BasketsController < PublicApiController
    include DeletedItemsAction

    def index
      list_items Basket.all.includes(:participation_context), V2::BasketSerializer
    end

    def show
      show_item Basket.find(params[:id]), V2::BasketSerializer
    end
  end
end
