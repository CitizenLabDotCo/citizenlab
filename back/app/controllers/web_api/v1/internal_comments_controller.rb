# frozen_string_literal: true

class WebApi::V1::InternalCommentsController < ApplicationController
  before_action :set_comment, only: %i[children show update mark_as_deleted]

  FULLY_EXPAND_THRESHOLD = 5
  MINIMAL_SUBCOMMENTS = 2

  def index
    include_attrs = [author: [:unread_notifications]]
    root_comments = policy_scope(InternalComment)
      .where(idea_id: params[:idea_id])
      .where(parent: nil)

    root_comments = sort_comments root_comments
    root_comments = paginate root_comments
    root_comments = root_comments.includes(*include_attrs)

    fully_expanded_root_comments = InternalComment.where(id: root_comments)
      .where('children_count <= ?', FULLY_EXPAND_THRESHOLD)

    partially_expanded_root_comments = InternalComment.where(id: root_comments)
      .where('children_count > ?', FULLY_EXPAND_THRESHOLD)

    partially_expanded_child_comments = InternalComment
      .where(parent_id: partially_expanded_root_comments)
      .joins(:parent)
      .where('internal_comments.lft >= parents_internal_comments.rgt - ?', MINIMAL_SUBCOMMENTS * 2)

    child_comments = InternalComment
      .where(parent: fully_expanded_root_comments)
      .or(InternalComment.where(id: partially_expanded_child_comments))
      .order(:created_at)
      .includes(*include_attrs)

    # We're doing this merge in ruby, since the combination of a self-join
    # with different sorting criteria per depth became tremendously complex in
    # one SQL query
    @comments = merge_comments(root_comments.to_a, child_comments.to_a)

    serialization_options = { params: jsonapi_serializer_params, include: [:author] }

    render json: {
      **WebApi::V1::InternalCommentSerializer.new(@comments, serialization_options).serializable_hash,
      links: page_links(root_comments)
    }
  end

  def children
    @comments = policy_scope(InternalComment)
      .where(parent: params[:id])
      .order(:lft)
    @comments = paginate @comments

    serialization_options = { params: jsonapi_serializer_params, include: [:author] }

    render json: linked_json(@comments, WebApi::V1::InternalCommentSerializer, serialization_options)
  end

  def show
    render json: WebApi::V1::InternalCommentSerializer.new(
      @comment,
      params: jsonapi_serializer_params,
      include: [:author]
    ).serializable_hash
  end

  def create
    @comment = InternalComment.new permitted_attributes(InternalComment)
    @comment.idea_id = params[:idea_id]
    @comment.author ||= current_user
    authorize @comment

    SideFxInternalCommentService.new.before_create @comment, current_user
    if @comment.save
      SideFxInternalCommentService.new.after_create @comment, current_user
      render json: WebApi::V1::InternalCommentSerializer.new(
        @comment,
        params: jsonapi_serializer_params,
        include: [:author]
      ).serializable_hash, status: :created
    else
      render json: { errors: @comment.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @comment.assign_attributes permitted_attributes(@comment)
    authorize @comment

    SideFxInternalCommentService.new.before_update @comment, current_user
    if @comment.save
      SideFxInternalCommentService.new.after_update @comment, current_user
      render json: WebApi::V1::InternalCommentSerializer.new(
        @comment,
        params: jsonapi_serializer_params,
        include: [:author]
      ).serializable_hash, status: :ok
    else
      render json: { errors: @comment.errors.details }, status: :unprocessable_entity
    end
  end

  def mark_as_deleted
    if @comment.update(publication_status: 'deleted')
      SideFxInternalCommentService.new.after_mark_as_deleted(@comment, current_user)
      head :no_content
    else
      render json: { errors: @comment.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def sort_comments(comments)
    case params[:sort]
    when 'new'
      comments.order(created_at: :desc)
    when '-new', nil
      comments.order(created_at: :asc)
    else
      raise 'Unsupported sort method'
    end
  end

  def set_comment
    @comment = InternalComment.find params[:id]
    authorize @comment
  end

  # Merge both arrays in such a way that the order of both is preserved, but
  # the children are directly following their parent
  def merge_comments(root_comments, child_comments)
    children_by_parent = child_comments.group_by(&:parent_id)
    root_comments.flat_map do |root_comment|
      [root_comment, *children_by_parent[root_comment.id]]
    end
  end
end
