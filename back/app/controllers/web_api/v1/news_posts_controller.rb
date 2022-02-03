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

    SideFxNewsPostService.new.before_create @post, current_user
    if @post.save
      SideFxNewsPostService.new.after_create @post, current_user
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

    SideFxNewsPostService.new.before_update @post, current_user
    if @post.save
      SideFxNewsPostService.new.after_update @post, current_user
      render json: WebApi::V1::NewsPostSerializer.new(@post, params: fastjson_params).serialized_json, status: :ok
    else
      render json: { errors: @post.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    post = @post.destroy

    if post.destroyed?
      SideFxNewsPostService.new.after_destroy post, current_user
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def assign_attributes_for_update
    @post.assign_attributes permitted_attributes(NewsPost)
  end

  def set_post
    @post = NewsPost.find params[:id]
    authorize @post
  end
end