class WebApi::V1::StaticPagesController < ::ApplicationController
  skip_before_action :authenticate_user, only: %i[index show by_slug]
  before_action :set_page, only: %i[show update destroy]

  def index
    @pages = paginate policy_scope(StaticPage)

    render json: linked_json(@pages, WebApi::V1::StaticPageSerializer, params: fastjson_params)
  end

  def show
    render json: WebApi::V1::StaticPageSerializer.new(@page, params: fastjson_params).serialized_json
  end

  def by_slug
    @page = StaticPage.find_by! slug: params[:slug]
    authorize @page
    show
  end

  def create
    @page = StaticPage.new permitted_attributes(StaticPage)
    authorize @page

    SideFxStaticPageService.new.before_create @page, current_user
    if @page.save
      SideFxStaticPageService.new.after_create @page, current_user
      render(
        json: WebApi::V1::StaticPageSerializer.new(@page, params: fastjson_params).serialized_json,
        status: :created
      )
    else
      render json: { errors: @page.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    assign_attributes_for_update
    authorize @page

    SideFxStaticPageService.new.before_update @page, current_user
    if @page.save
      SideFxStaticPageService.new.after_update @page, current_user
      render json: WebApi::V1::StaticPageSerializer.new(@page, params: fastjson_params).serialized_json, status: :ok
    else
      render json: { errors: @page.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    page = @page.destroy

    if page.destroyed?
      SideFxStaticPageService.new.after_destroy page, current_user
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def assign_attributes_for_update
    @page.assign_attributes permitted_attributes(StaticPage)
  end

  def set_page
    @page = StaticPage.find params[:id]
    authorize @page
  end
end

::WebApi::V1::StaticPagesController.prepend_if_ee 'CustomizableNavbar::WebApi::V1::Patches::StaticPagesController'
