class WebApi::V1::CommentsController < ApplicationController

  MARK_AS_DELETED_REASON_CODES = %w(wrong_content inappropriate other)

  before_action :set_comment, only: [:show, :update, :mark_as_deleted, :destroy]
  skip_after_action :verify_authorized, only: [:index_xlsx]

  def index
    @comments = policy_scope(Comment)
      .where(idea_id: params[:idea_id])
      .includes(:author)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
      .order(:lft)

    if current_user
      votes = Vote.where(user: current_user, votable: @comments.all)
      votes_by_comment_id = votes.map{|vote| [vote.votable_id, vote]}.to_h
      render json: @comments, include: ['author', 'user_vote'], vbci: votes_by_comment_id
    else
      render json: @comments, include: ['author']
    end
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

    SideFxCommentService.new.before_create(@comment, current_user)

    if @comment.save
      SideFxCommentService.new.after_create(@comment, current_user)
      render json: @comment, status: :created, include: ['author']
    else
      render json: { errors: @comment.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @comment.attributes = comment_params

    SideFxCommentService.new.before_update(@comment, current_user)

    if @comment.save(comment_params)
      SideFxCommentService.new.after_update(@comment, current_user)
      render json: @comment, status: :ok, include: ['author']
    else
      render json: { errors: @comment.errors.details }, status: :unprocessable_entity
    end
  end

  def mark_as_deleted
    mad_params = mark_as_deleted_params
    if ((MARK_AS_DELETED_REASON_CODES.include? mad_params[:reason_code]) &&
      (mad_params[:reason_code] != 'other' || mad_params[:other_reason].present?))
      @comment.publication_status = 'deleted'
      if @comment.save
        SideFxCommentService.new.after_mark_as_deleted(@comment, current_user, mad_params[:reason_code], mad_params[:other_reason])
        head :ok
      else
        render json: { errors: @comment.errors.details }, status: :unprocessable_entity
      end
    else
      raise ClErrors::TransactionError.new(error_key: :invalid_reason)
    end
  end

  def destroy

    SideFxCommentService.new.before_destroy(@comment, current_user)

    comment = @comment.destroy
    if comment.destroyed?
      SideFxCommentService.new.after_destroy(comment, current_user)
      head :ok
    else
      head 500
    end
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
      body_multiloc: I18n.available_locales
    )
  end

  def mark_as_deleted_params
    params.require(:comment).permit(
      :reason_code,
      :other_reason
    )
  end

  def secure_controller?
    false
  end

end
