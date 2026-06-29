# frozen_string_literal: true

class WebApi::V1::NavBarItemsController < ApplicationController
  include AddRemoveNavBarItems

  before_action :set_item, except: %i[create index removed_default_items]
  skip_before_action :authenticate_user, only: :index
  after_action :verify_policy_scoped, only: :index

  def index
    # Only top-level items; dropdown ('menu') children are nested under their parent.
    @items = policy_scope(NavBarItem)
      .where(parent_id: nil)
      .includes(:static_page, children: %i[static_page project project_folder])
      .order(:ordering)
    @items = @items.only_default if parse_bool(params[:only_default])
    render json: WebApi::V1::NavBarItemSerializer.new(@items, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    attrs = permitted_attributes(NavBarItem).to_h
    children = attrs.delete('children')
    @item = NavBarItem.new attrs
    authorize @item

    if @item.menu?
      create_dropdown(children)
    else
      add_nav_bar_item
    end
  end

  def update
    attrs = permitted_attributes(@item).to_h
    children = attrs.delete('children')
    @item.assign_attributes attrs
    authorize @item

    if @item.menu?
      update_dropdown(children)
    else
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
  end

  def removed_default_items
    authorize NavBarItem
    used_codes = NavBarItem.distinct.pluck(:code)
    @items = NavBarItemService.new.default_items.reject do |item|
      # Not using set difference to have an
      # explicit guarantee of preserving the
      # ordering.
      used_codes.include? item.code
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

  # Atomically creates a dropdown ('menu') parent with its ordered children.
  def create_dropdown(children)
    fx = SideFxNavBarItemService.new
    ActiveRecord::Base.transaction do
      fx.before_create @item, current_user
      @item.save!
      sync_children!(@item, children || [])
      fx.after_create @item, current_user
    end
    render_dropdown :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.details }, status: :unprocessable_entity
  end

  # Atomically updates a dropdown ('menu') parent and reconciles its children.
  def update_dropdown(children)
    fx = SideFxNavBarItemService.new
    ActiveRecord::Base.transaction do
      fx.before_update @item, current_user
      @item.save!
      sync_children!(@item, children) unless children.nil?
      fx.after_update @item, current_user
    end
    render_dropdown :ok
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.details }, status: :unprocessable_entity
  end

  # Replaces the dropdown's children with the given ordered list. Order in the
  # array determines `ordering` (acts_as_list appends each new child at the bottom).
  def sync_children!(parent, children)
    parent.children.destroy_all
    children.each do |child|
      parent.children.create!(
        code: 'custom',
        static_page_id: child['static_page_id'],
        project_id: child['project_id'],
        project_folder_id: child['project_folder_id']
      )
    end
  end

  def render_dropdown(status)
    render json: ::WebApi::V1::NavBarItemSerializer.new(
      @item.reload,
      params: jsonapi_serializer_params
    ).serializable_hash, status: status
  end

  def set_item
    @item = NavBarItem.find params[:id]
    authorize @item
  end
end

WebApi::V1::NavBarItemsController.include(AggressiveCaching::Patches::WebApi::V1::NavBarItemsController)
