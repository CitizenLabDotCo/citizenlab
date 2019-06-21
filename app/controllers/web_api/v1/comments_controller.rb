class WebApi::V1::CommentsController < ApplicationController

  before_action :set_comment, only: [:children, :show, :update, :mark_as_deleted, :destroy]
  skip_after_action :verify_authorized, only: [:index_xlsx]

  FULLY_EXPAND_THRESHOLD = 5
  MINIMAL_SUBCOMMENTS = 2

  def index
    include_attrs = [author: [:unread_notifications]]

    root_comments = policy_scope(Comment)
      .where(idea: params[:idea_id])
      .where(parent: nil)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
      .includes(*include_attrs)

    root_comments = case params[:sort]
      when "new"
        root_comments.order(created_at: :desc)
      when "-new"
        root_comments.order(created_at: :asc)
      when "upvotes_count"
        root_comments.order(upvotes_count: :asc, lft: :asc)
      when "-upvotes_count"
        root_comments.order(upvotes_count: :desc, lft: :asc)
      when nil
        root_comments.order(lft: :asc)
      else
        raise "Unsupported sort method"
      end

    fully_expanded_root_comments = Comment.where(id: root_comments)
      .where("children_count <= ?", FULLY_EXPAND_THRESHOLD)

    partially_expanded_root_comments = Comment.where(id: root_comments)
      .where("children_count > ?", FULLY_EXPAND_THRESHOLD)

    partially_expanded_child_comments = Comment
      .where(parent_id: partially_expanded_root_comments)
      .joins(:parent)
      .where("comments.lft >= parents_comments.rgt - ?", MINIMAL_SUBCOMMENTS * 2)

    child_comments = Comment
      .where(parent: fully_expanded_root_comments)
      .or(Comment.where(id: partially_expanded_child_comments))
      .order(:created_at)
      .includes(*include_attrs)

    # We're doing this merge in ruby, since the combination of a self-join
    # with different sorting criteria per depth became tremendously complex in
    # one SQL query
    @comments = merge_comments(root_comments.to_a, child_comments.to_a)

    total_root_comments_count = policy_scope(Comment)
      .where(idea: params[:idea_id])
      .where(parent: nil)
      .count

    if current_user
      votes = Vote.where(user: current_user, votable: @comments)
      votes_by_comment_id = votes.map{|vote| [vote.votable_id, vote]}.to_h
      render json: { 
        **WebApi::V1::Fast::CommentSerializer.new(
          @comments, 
          params: fastjson_params(vbci: votes_by_comment_id), 
          include: [:author, :user_vote]
          ).serializable_hash, 
        meta: { total: total_root_comments_count }
      }
    else
      render json: { 
        **WebApi::V1::Fast::CommentSerializer.new(
          @comments, 
          params: fastjson_params, 
          include: [:author]
          ).serializable_hash, 
        meta: { total: total_root_comments_count }
      }
    end
  end

  def index_xlsx
    I18n.with_locale(current_user&.locale) do
      @comments = policy_scope(Comment)
        .includes(:author, :idea)
        .order(:lft)
      @comments = @comments.where(ideas: {project_id: params[:project]}) if params[:project].present?
      @comments = @comments.where(idea_id: params[:ideas]) if params[:ideas].present?
      xlsx = XlsxService.new.generate_comments_xlsx @comments
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'comments.xlsx'
    end
  end

  def children
    @comments = policy_scope(Comment)
      .where(parent: params[:id])
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
      .order(:lft)

    if current_user
      votes = Vote.where(user: current_user, votable: @comments.all)
      votes_by_comment_id = votes.map{|vote| [vote.votable_id, vote]}.to_h
      render json: WebApi::V1::Fast::CommentSerializer.new(
        @comments, 
        params: fastjson_params(vbci: votes_by_comment_id), 
        include: [:author, :user_vote]
        ).serialized_json
    else
      render json: WebApi::V1::Fast::CommentSerializer.new(
        @comments, 
        params: fastjson_params, 
        include: [:author]
        ).serialized_json
    end
  end

  def show
    render json: WebApi::V1::Fast::CommentSerializer.new(
      @comment, 
      params: fastjson_params, 
      include: [:author]
      ).serialized_json
  end

  def create
    @comment = Comment.new comment_params
    @comment.idea_id = params[:idea_id]
    @comment.author ||= current_user
    authorize @comment
    SideFxCommentService.new.before_create @comment, current_user
    if @comment.save
      SideFxCommentService.new.after_create @comment, current_user
      render json: WebApi::V1::Fast::CommentSerializer.new(
        @comment, 
        params: fastjson_params, 
        include: [:author]
        ).serialized_json, status: :created
    else
      render json: { errors: @comment.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @comment.attributes = permitted_attributes @comment
    authorize @comment
    SideFxCommentService.new.before_update @comment, current_user
    if @comment.save
      SideFxCommentService.new.after_update @comment, current_user
      render json: WebApi::V1::Fast::CommentSerializer.new(
        @comment, 
        params: fastjson_params, 
        include: [:author]
        ).serialized_json, status: :ok
    else
      render json: { errors: @comment.errors.details }, status: :unprocessable_entity
    end
  end

  def mark_as_deleted
    reason_code = params.dig(:comment, :reason_code)
    other_reason = params.dig(:comment, :other_reason)
    if (@comment.author_id == current_user&.id) || 
      ((Notifications::CommentDeletedByAdmin::REASON_CODES.include? reason_code) &&
       (reason_code != 'other' || other_reason.present?))
      @comment.publication_status = 'deleted'
      if @comment.save
        SideFxCommentService.new.after_mark_as_deleted(@comment, current_user, reason_code, other_reason)
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
    # no one is allowed to modify someone else's comment, 
    # so no one is allowed to write a comment in someone
    # else's name
    params.require(:comment).permit(
      :parent_id,
      # :author_id
      body_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

  def secure_controller?
    false
  end

  # Merge both arrays in such a way that the order of both is preserved, but
  # the children are directly following their parent
  def merge_comments root_comments, child_comments
    children_by_parent = child_comments.group_by(&:parent_id)
    root_comments.flat_map do |root_comment|
      [root_comment, *children_by_parent[root_comment.id]]
    end
  end

end
