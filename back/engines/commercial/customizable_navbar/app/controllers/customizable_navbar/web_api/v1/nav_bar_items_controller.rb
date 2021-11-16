module CustomizableNavbar
  module WebApi
    module V1
      class NavBarItemsController < ApplicationController
        before_action :set_item, except: %i[create]

        def create
          @item = NavBarItem.new permitted_attributes NavBarItem
          authorize @item

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

        def update
          @item.assign_attributes permitted_attributes @item
          authorize @item
          SideFxNavBarItemService.new.before_update @item, current_user
          if @item.save
            SideFxNavBarItemService.new.after_update @item, current_user
            render json: ::WebApi::V1::NavBarItemSerializer.new(
              @item,
              params: fastjson_params
            ).serialized_json, status: :ok
          else
            render json: { errors: @item.errors.details }, status: :unprocessable_entity
          end
        end

        def reorder
          SideFxNavBarItemService.new.before_update @item, current_user
          ordering = permitted_attributes(@item)[:ordering]
          if ordering && @item.insert_at(ordering)
            SideFxNavBarItemService.new.after_update @item, current_user
            render json: ::WebApi::V1::NavBarItemSerializer.new(
              @item.reload,
              params: fastjson_params
            ).serialized_json, status: :ok
          else
            render json: { errors: @item.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          SideFxNavBarItemService.new.before_destroy @item, current_user
          item = @item.destroy
          if item.destroyed?
            SideFxNavBarItemService.new.after_destroy item, current_user
            head :ok
          else
            head :internal_server_error
          end
        end

        private

        def set_item
          @item = NavBarItem.find params[:id]
          authorize @item
        end
      end
    end
  end
end
