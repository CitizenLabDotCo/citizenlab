class WebApi::V1::NavBarItemsController < ApplicationController
  skip_before_action :authenticate_user, only: :index
  after_action :verify_policy_scoped, only: :index

  def index
    @items = policy_scope(NavBarItem).order(:ordering)
    render json: WebApi::V1::NavBarItemSerializer.new(@items, params: fastjson_params).serialized_json
  end

  def toggle_item
    code = params[:code]
    authorize NavBarItem, "toggle_#{code}?".to_sym
    @item = NavBarItem.find_by code: code
    if ActiveModel::Type::Boolean.new.cast params[:enabled]
      # Enable
      if @item
        render json: { errors: { base: [{ error: 'already_enabled' }] } }, status: :unprocessable_entity
      else
        @item = NavBarItem.new code: code
        add_item
      end
    else
      # Disable
      if @item
        remove_item
      else
        render json: { errors: { base: [{ error: 'already_idsnabled' }] } }, status: :unprocessable_entity
      end
    end
  end

  private

  def add_item
    SideFxNavBarItemService.new.before_create @item, current_user
    if @item.save
      SideFxNavBarItemService.new.after_create @item, current_user
      render json: ::WebApi::V1::NavBarItemSerializer.new(
        @item,
        params: fastjson_params
      ).serialized_json, status: :created
    else
      render json: { errors: @item.errors.details }, status: :unprocessable_entity
    end
  end

  def remove_item
    SideFxNavBarItemService.new.before_destroy @item, current_user
    item = @item.destroy
    if item.destroyed?
      SideFxNavBarItemService.new.after_destroy item, current_user
      head :ok
    else
      head :internal_server_error
    end
  end
end
