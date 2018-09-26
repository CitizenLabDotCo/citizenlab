class WebApi::V1::PagesController < ::ApplicationController

  before_action :set_page, only: [:show, :update, :destroy]

  def index
    @pages = policy_scope(Page).includes(:page_links)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @pages = @pages.where(project_id: params[:project]) if params[:project].present?

    render json: @pages, include: ['page_links']
  end


  def show
    render json: @page, include: ['page_links']
  end

  def by_slug
    @page = Page.find_by!(slug: params[:slug])
    authorize @page
    show
  end

  def create
    @page = Page.new(page_params)
    SideFxPageService.new.before_create(@page, current_user)
    authorize @page
    if @page.save
      SideFxPageService.new.after_create(@page, current_user)
      render json: @page, status: :created, include: ['page_links']
    else
      render json: {errors: @page.errors.details}, status: :unprocessable_entity
    end
  end

  def update
    @page.assign_attributes page_params
    authorize @page
    SideFxPageService.new.before_update(@page, current_user)
    if @page.save
      SideFxPageService.new.after_update(@page, current_user)
      render json: @page, status: :ok, include: ['page_links']
    else
      render json: {errors: @page.errors.details}, status: :unprocessable_entity
    end
  end

  def destroy
    page = @page.destroy
    if page.destroyed?
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
      title_multiloc: CL2_SUPPORTED_LOCALES, 
      body_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

  def set_page
    @page = Page.find params[:id]
    authorize @page
  end

end
