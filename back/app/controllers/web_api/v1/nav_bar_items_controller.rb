# frozen_string_literal: true

class WebApi::V1::NavBarItemsController < ApplicationController
  include AddRemoveNavBarItems

  before_action :set_item, except: %i[create index removed_default_items]
  skip_before_action :authenticate_user, only: :index
  after_action :verify_policy_scoped, only: :index

  def index
    @items = policy_scope(NavBarItem).includes(:static_page).order(:ordering)
    @items = @items.only_default if parse_bool(params[:only_default])
    render json: WebApi::V1::NavBarItemSerializer.new(@items, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    @item = NavBarItem.new permitted_attributes NavBarItem
    authorize @item
    add_nav_bar_item
  end

  def update
    @item.assign_attributes permitted_attributes @item
    authorize @item
    SideFxNavBarItemService.new.before_update @item, current_user
    if @item.save
      SideFxNavBarItemService.new.after_update @item, current_user
      render json: ::WebApi::V1::NavBarItemSerializer.new(
        @item,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @item.errors.details }, status: :unprocessable_entity
    end
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
    render json: WebApi::V1::NavBarItemSerializer.new(@items, params: jsonapi_serializer_params).serializable_hash
  end

  def reorder
    SideFxNavBarItemService.new.before_update @item, current_user
    ordering = permitted_attributes(@item)[:ordering]
    if ordering && @item.insert_at(ordering)
      SideFxNavBarItemService.new.after_update @item, current_user
      render json: ::WebApi::V1::NavBarItemSerializer.new(
        @item.reload,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @item.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    remove_nav_bar_item
  end

  private

  def set_item
    @item = NavBarItem.find params[:id]
    authorize @item
  end
end

WebApi::V1::NavBarItemsController.include(AggressiveCaching::Patches::WebApi::V1::NavBarItemsController)
