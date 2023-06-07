# frozen_string_literal: true

class WebApi::V1::InternalCommentsController < ApplicationController
  before_action :set_post_type_id_and_policy, only: %i[index create]
  before_action :set_comment, only: %i[children show update mark_as_deleted destroy]
  # skip_before_action :authenticate_user # Not sure if this is needed, or even a good idea. TBD

  FULLY_EXPAND_THRESHOLD = 5
  MINIMAL_SUBCOMMENTS = 2

  def index
    include_attrs = [author: [:unread_notifications]]
    root_comments = policy_scope(InternalComment, policy_scope_class: @policy_class::Scope)
      .where(post_type: @post_type, post_id: @post_id)
      .where(parent: nil)
      .includes(*include_attrs)

    root_comments = case params[:sort]
    when 'new'
      root_comments.order(created_at: :desc)
    when '-new'
      root_comments.order(created_at: :asc)
    when nil
      root_comments.order(lft: :asc)
    else
      raise 'Unsupported sort method'
    end
    root_comments = paginate root_comments

    fully_expanded_root_comments = InternalComment.where(id: root_comments)
      .where('children_count <= ?', FULLY_EXPAND_THRESHOLD)

    partially_expanded_root_comments = InternalComment.where(id: root_comments)
      .where('children_count > ?', FULLY_EXPAND_THRESHOLD)

    partially_expanded_child_comments = InternalComment
      .where(parent_id: partially_expanded_root_comments)
      .joins(:parent)
      .where('internal_comments.lft >= parents_internal_comments.rgt - ?', MINIMAL_SUBCOMMENTS * 2) # Dow we need internal_... here?

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
    @comments = policy_scope(InternalComment, policy_scope_class: @policy_class::Scope)
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
    @comment = InternalComment.new comment_create_params
    @comment.post_type = @post_type
    @comment.post_id = @post_id
    @comment.author ||= current_user
    authorize @comment, policy_class: @policy_class

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
    @comment.attributes = comment_update_params
    # We cannot pass policy class to permitted_attributes
    # @comment.attributes = pundit_params_for(@comment).permit(@policy_class.new(current_user, @comment).permitted_attributes_for_update)
    authorize @comment, policy_class: @policy_class

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
    return unless @comment.author_id == current_user&.id

    @comment.publication_status = 'deleted'
    if @comment.save
      SideFxInternalCommentService.new.after_mark_as_deleted(@comment, current_user)
      head :accepted
    else
      render json: { errors: @comment.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxInternalCommentService.new.before_destroy(@comment, current_user)
    comment = @comment.destroy
    if comment.destroyed?
      SideFxInternalCommentService.new.after_destroy(comment, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_comment
    @comment = InternalComment.find params[:id]
    @post_type = @comment.post_type
    set_policy_class
    authorize @comment, policy_class: @policy_class
  end

  def set_post_type_id_and_policy
    @post_type = params[:post]
    @post_id = params[:"#{@post_type.underscore}_id"]
    set_policy_class
  end

  def set_policy_class
    @policy_class = case @post_type
    when 'Idea' then IdeaInternalCommentPolicy
    when 'Initiative' then InitiativeInternalCommentPolicy
    else raise "#{@post_type} has no comment policy defined"
    end
    raise 'must not be blank' if @post_type.blank?
  end

  def comment_create_params
    # no one is allowed to modify someone else's comment,
    # so no one is allowed to write a comment in someone
    # else's name
    params.require(:internal_comment).permit(
      :parent_id,
      body_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

  def comment_update_params
    attrs = []
    attrs = [{ body_multiloc: CL2_SUPPORTED_LOCALES }] if @comment.author_id == current_user&.id
    params.require(:internal_comment).permit(attrs)
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
