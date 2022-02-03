class WebApi::V1::NewsPostsController < ::ApplicationController
  skip_before_action :authenticate_user, only: %i[index show by_slug]
  before_action :set_post, only: %i[show update destroy]

  def index
    @posts = paginate policy_scope(NewsPost)
    render json: WebApi::V1::NewsPostSerializer.new(@posts, params: fastjson_params).serialized_json
  end

  def show
    render json: WebApi::V1::NewsPostSerializer.new(@post, params: fastjson_params).serialized_json
  end

  def by_slug
    @post = NewsPost.find_by! slug: params[:slug]
    authorize @post
    show
  end

  def create
    @post = NewsPost.new permitted_attributes(NewsPost)
    authorize @post

    # SideFxStaticPageService.new.before_create @page, current_user
    if @post.save
      # SideFxStaticPageService.new.after_create @page, current_user
      render(
        json: WebApi::V1::NewsPostSerializer.new(@post, params: fastjson_params).serialized_json,
        status: :created
      )
    else
      render json: { errors: @post.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    assign_attributes_for_update
    authorize @post

    # SideFxStaticPageService.new.before_update @page, current_user
    if @post.save
      # SideFxStaticPageService.new.after_update @page, current_user
      render json: WebApi::V1::NewsPostSerializer.new(@post, params: fastjson_params).serialized_json, status: :ok
    else
      render json: { errors: @post.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    post = @post.destroy

    if post.destroyed?
      # SideFxStaticPageService.new.after_destroy page, current_user
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_post
    @post = NewsPost.find params[:id]
    authorize @post
  end
end