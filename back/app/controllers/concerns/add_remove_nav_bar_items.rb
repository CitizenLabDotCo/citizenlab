# frozen_string_literal: true

# This concern captures the logic for adding and
# removing NavBarItems so it can be reused in the
# different controllers that need to implement
# this. The main reason is that we allow adding
# and deleting all NavBarItems when customizable_
# navbar is enabled, while we only allow this
# through specific toggles for the core app.

module AddRemoveNavBarItems
  extend ActiveSupport::Concern

  private

  def add_nav_bar_item
    SideFxNavBarItemService.new.before_create @item, current_user
    if @item.save
      SideFxNavBarItemService.new.after_create @item, current_user
      render json: ::WebApi::V1::NavBarItemSerializer.new(
        @item,
        params: fastjson_params
      ).serializable_hash.to_json, status: :created
    else
      render json: { errors: @item.errors.details }, status: :unprocessable_entity
    end
  end

  def remove_nav_bar_item
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
