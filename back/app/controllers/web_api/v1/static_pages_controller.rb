# frozen_string_literal: true

class WebApi::V1::StaticPagesController < ApplicationController
  skip_before_action :authenticate_user, only: %i[index show by_slug]
  before_action :set_page, only: %i[show update destroy]

  def index
    @pages = paginate policy_scope(StaticPage)

    render json: linked_json(@pages, WebApi::V1::StaticPageSerializer, params: jsonapi_serializer_params)
  end

  def show
    render json: WebApi::V1::StaticPageSerializer.new(@page, params: jsonapi_serializer_params).serializable_hash
  end

  def by_slug
    @page = StaticPage.find_by! slug: params[:slug]
    authorize @page
    show
  end

  def create
    @page = StaticPage.new
    assign_attributes
    authorize @page

    SideFxStaticPageService.new.before_create @page, current_user
    if @page.save
      SideFxStaticPageService.new.after_create @page, current_user
      render(
        json: WebApi::V1::StaticPageSerializer.new(@page, params: jsonapi_serializer_params).serializable_hash,
        status: :created
      )
    else
      render json: { errors: @page.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    assign_attributes
    authorize @page

    if @page.save
      SideFxStaticPageService.new.after_update @page, current_user
      render json: WebApi::V1::StaticPageSerializer.new(@page, params: jsonapi_serializer_params).serializable_hash, status: :ok
    else
      render json: { errors: @page.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    destroyed = @page.destroy

    if destroyed
      SideFxStaticPageService.new.after_destroy destroyed, current_user
      head :ok
    elsif @page.errors
      render json: { errors: @page.errors.details }, status: :unprocessable_entity
    else
      head :internal_server_error
    end
  end

  private

  def assign_attributes
    attributes = permitted_attributes(StaticPage).to_h
    nav_bar_item_title = attributes.delete(:nav_bar_item_title_multiloc)
    if nav_bar_item_title.present? && @page.nav_bar_item_id.present?
      attributes[:nav_bar_item_attributes] ||= {}
      attributes[:nav_bar_item_attributes][:id] = @page.nav_bar_item_id
      attributes[:nav_bar_item_attributes][:title_multiloc] = nav_bar_item_title
    end
    @page.assign_attributes attributes
  end

  def set_page
    @page = StaticPage.find params[:id]
    authorize @page
  end
end

WebApi::V1::StaticPagesController.include(AggressiveCaching::Patches::WebApi::V1::StaticPagesController)
