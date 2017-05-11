class Api::V1::CommentsController < ApplicationController

  before_action :set_comment, only: [:show, :update, :destroy]

  def index
    @comments = policy_scope(Comment)
      .where(idea_id: params[:idea_id])
      .includes(:author)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
      .order(:lft)
    render json: @comments, include: ['author']
  end

  def show
    render json: @comment, include: ['author']
  end

  def create
    @comment = Comment.new(comment_params)
    @comment.idea_id = params[:idea_id]
    @comment.author ||= current_user
    authorize @comment

    if @comment.save
      render json: @comment, status: :created, include: ['author']
    else
      render json: { errors: @comment.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    if @comment.update(comment_params)
      render json: @comment, status: :ok, include: ['author']
    else
      render json: { errors: @comment.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    @comment.destroy
    head :ok
  end

  private

  def set_comment
    @comment = Comment.find_by(id: params[:id])
    authorize @comment
  end

  def comment_params
    params.require(:comment).permit(
      :parent_id,
      :author_id,
      body_multiloc: [:en, :nl, :fr]
    )
  end

  def secure_controller?
    false
  end

end
