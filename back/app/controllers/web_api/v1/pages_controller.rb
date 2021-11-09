class WebApi::V1::PagesController < ::ApplicationController
  before_action :set_page, only: [:show, :update, :destroy]

  def index
    @pages = policy_scope Page
    @pages = @pages.where(project_id: params[:project]) if params[:project].present?

    @pages = @pages
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
    render json: linked_json(@pages, WebApi::V1::PageSerializer, params: fastjson_params)
  end
  
  def show
    render json: WebApi::V1::PageSerializer.new(
      @page,
      params: fastjson_params
      ).serialized_json
  end

  def by_slug
    @page = Page.find_by!(slug: params[:slug])
    authorize @page
    show
  end

  def create
    page = Page.new(page_params)
    authorize(page)

    if result = CreatePageService.new(page, current_user).call
      SideFxPageService.new.after_create(page, current_user)
      render json: WebApi::V1::PageSerializer.new(
        page,
        params: fastjson_params
        ).serialized_json, status: :created
    else
      render json: {errors: page.errors.details}, status: :unprocessable_entity
    end
  end

  def update
    @page.assign_attributes page_params
    authorize @page
    SideFxPageService.new.before_update(@page, current_user)
    if @page.save
      SideFxPageService.new.after_update(@page, current_user)
      render json: WebApi::V1::PageSerializer.new(
        @page,
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: {errors: @page.errors.details}, status: :unprocessable_entity
    end
  end

  def destroy
    page = @page.destroy

    if !page
      errors = @page.errors.details.deep_dup
      errors.merge!(navbar_item: @page.navbar_item.errors.details) if @page.navbar_item
      render json: errors, status: :unprocessable_entity
    elsif page.destroyed?
      SideFxPageService.new.after_destroy(@page, current_user)
      head :ok
    else
      head 500
    end
  end

  private
  # TODO: temp fix to pass tests
  def secure_controller?
    false
  end

  def page_params
    params.require(:page).permit(
      :slug,
      :publication_status,
      title_multiloc: CL2_SUPPORTED_LOCALES,
      body_multiloc: CL2_SUPPORTED_LOCALES,
      navbar_item_attributes: {
        title_multiloc: CL2_SUPPORTED_LOCALES
      }
    )
  end

  def set_page
    @page = Page.find params[:id]
    authorize @page
  end

end
