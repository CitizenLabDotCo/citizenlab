class Api::V1::CommentsController < ApplicationController

  before_action :set_comment, only: [:show, :update, :destroy]
  skip_after_action :verify_authorized, only: [:index_xlsx]

  def index
    @comments = policy_scope(Comment)
      .where(idea_id: params[:idea_id])
      .includes(:author)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
      .order(:lft)
    render json: @comments, include: ['author']
  end

  def index_xlsx
    I18n.with_locale(current_user&.locale) do
      @comments = policy_scope(Comment)
        .includes(:author, :idea)
        .order(:lft)
      @comments = @comments.where(idea: {project_id: params[:project]}) if params[:project].present?
      xlsx = XlsxService.new.generate_comments_xlsx @comments
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'comments.xlsx'
    end
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
