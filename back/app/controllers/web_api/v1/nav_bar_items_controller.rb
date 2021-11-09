class WebApi::V1::NavBarItemsController < ApplicationController
  after_action :verify_policy_scoped, only: :index

  def index
    @items = policy_scope(NavBarItem).order(:ordering)
    render json: WebApi::V1::NavBarItemSerializer.new(@items, params: fastjson_params).serialized_json
  end
end
