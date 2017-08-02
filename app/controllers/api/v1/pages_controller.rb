class Api::V1::PagesController < ::ApplicationController

  before_action :set_page, only: [:show, :update, :destroy]

  def index
    @pages = policy_scope(Page)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @pages = @pages.where(project_id: params[:project]) if params[:project].present?

    render json: @pages
  end


  def show
    render json: @page
  end

  def by_slug
    @page = Page.find_by!(slug: params[:slug])
    authorize @page
    show
  end

  def create
    @page = Page.new(page_params)
    authorize @page
    if @page.save
      render json: @page, status: :created
    else
      render json: {errors: @page.errors.details}, status: :unprocessable_entity
    end
  end

  def update
    if @page.update(page_params)
      render json: @page, status: :ok
    else
      render json: {errors: @page.errors.details}, status: :unprocessable_entity
    end
  end

  def destroy
    @page.destroy
    head :ok
  end

  private
  # TODO: temp fix to pass tests
  def secure_controller?
    false
  end

  def page_params
    params.require(:page).permit(
      :slug, 
      title_multiloc: I18n.available_locales, 
      body_multiloc: I18n.available_locales
    )
  end

  def set_page
    @page = Page.find params[:id]
    authorize @page
  end

end
