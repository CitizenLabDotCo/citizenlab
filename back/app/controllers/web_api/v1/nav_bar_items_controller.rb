# frozen_string_literal: true

class WebApi::V1::NavBarItemsController < ApplicationController
  include AddRemoveNavBarItems

  skip_before_action :authenticate_user, only: :index
  after_action :verify_policy_scoped, only: :index

  def index
    @items = policy_scope(NavBarItem).includes(:static_page).order(:ordering)
    @items = @items.only_default if parse_bool(params[:only_default])
    render json: WebApi::V1::NavBarItemSerializer.new(@items, params: fastjson_params).serialized_json
  end

  def removed_default_items
    authorize NavBarItem
    used_codes = NavBarItem.distinct.pluck(:code)
    rejected_codes = (used_codes + NavBarItemPolicy.feature_disabled_codes).uniq
    @items = NavBarItemService.new.default_items.reject do |item|
      # Not using set difference to have an
      # explicit guarantee of preserving the
      # ordering.
      rejected_codes.include? item.code
    end
    render json: WebApi::V1::NavBarItemSerializer.new(@items, params: fastjson_params).serialized_json
  end
end
