class WebApi::V1::NavbarItemsController < ApplicationController
  after_action :verify_policy_scoped, only: :index

  def index
    navbar_items = policy_scope(filtered_navbar_items).includes(:page).order(visible: :desc, ordering: :asc)
    serializer = WebApi::V1::NavbarItemSerializer.new(
      navbar_items,
      params: fastjson_params,
      include: %i[page]
    )
    render json: serializer.serialized_json
  end

  private

  def filtered_navbar_items
    navbar_items = NavbarItem.all

    if params[:visible].present?
      visible = ActiveModel::Type::Boolean.new.cast(params.fetch(:visible))
      navbar_items = navbar_items.where(visible: visible)
    end

    navbar_items
  end
end
