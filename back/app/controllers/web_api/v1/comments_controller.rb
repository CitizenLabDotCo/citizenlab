# frozen_string_literal: true

class WebApi::V1::CommentsController < ApplicationController
  include BlockingProfanity

  before_action :set_comment, only: %i[children show update mark_as_deleted destroy]
  skip_after_action :verify_authorized, only: :index_xlsx
  skip_before_action :authenticate_user

  FULLY_EXPAND_THRESHOLD = 5
  MINIMAL_SUBCOMMENTS = 2

  def index
    include_attrs = [author: [:unread_notifications]]
    root_comments = policy_scope(Comment, policy_scope_class: CommentPolicy::Scope)
      .where(idea_id: params[:idea_id])
      .where(parent: nil)
      .includes(*include_attrs)

    root_comments = case params[:sort]
    when 'new'
      root_comments.order(created_at: :desc)
    when '-new'
      root_comments.order(created_at: :asc)
    when 'likes_count'
      root_comments.order(likes_count: :asc, lft: :asc)
    when '-likes_count'
      root_comments.order(likes_count: :desc, lft: :asc)
    when nil
      root_comments.order(lft: :asc)
    else
      raise 'Unsupported sort method'
    end
    root_comments = paginate root_comments

    fully_expanded_root_comments = Comment.where(id: root_comments)
      .where('children_count <= ?', FULLY_EXPAND_THRESHOLD)

    partially_expanded_root_comments = Comment.where(id: root_comments)
      .where('children_count > ?', FULLY_EXPAND_THRESHOLD)

    partially_expanded_child_comments = Comment
      .where(parent_id: partially_expanded_root_comments)
      .joins(:parent)
      .where('comments.lft >= parents_comments.rgt - ?', MINIMAL_SUBCOMMENTS * 2)

    child_comments = Comment
      .where(parent: fully_expanded_root_comments)
      .or(Comment.where(id: partially_expanded_child_comments))
      .order(:created_at)
      .includes(*include_attrs)

    # We're doing this merge in ruby, since the combination of a self-join
    # with different sorting criteria per depth became tremendously complex in
    # one SQL query
    @comments = merge_comments(root_comments.to_a, child_comments.to_a)

    serialization_options = if current_user
      reactions = Reaction.where(user: current_user, reactable: @comments)
      reactions_by_comment_id = reactions.index_by(&:reactable_id)
      {
        params: jsonapi_serializer_params(vbci: reactions_by_comment_id),
        include: %i[author user_reaction]
      }
    else
      { params: jsonapi_serializer_params, include: [:author] }
    end

    render json: {
      **WebApi::V1::CommentSerializer.new(@comments, serialization_options).serializable_hash,
      links: page_links(root_comments)
    }
  end

  def index_xlsx
    if params[:project].present?
      authorize Project.find(params[:project]), :index_xlsx?
    else
      authorize :comment, :index_xlsx?
    end

    @comments = policy_scope(Comment, policy_scope_class: CommentPolicy::Scope)
      .includes(:author, :idea)
      .order(:lft)
    @comments = @comments.where(ideas: { project_id: UserRoleService.new.moderatable_projects(current_user) })
    if params[:project].present?
      @comments = @comments.where(ideas: { project_id: params[:project] })
    end
    @comments = @comments.where(idea_id: params[:ideas]) if params[:ideas].present?

    I18n.with_locale(current_user&.locale) do
      service = XlsxService.new
      xlsx = service.generate_comments_xlsx @comments, view_private_attributes: true
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'comments.xlsx'
    end
  end

  def children
    @comments = policy_scope(Comment, policy_scope_class: CommentPolicy::Scope)
      .where(parent: params[:id])
      .order(:lft)
    @comments = paginate @comments

    serialization_options = if current_user
      reactions = Reaction.where(user: current_user, reactable: @comments.all)
      reactions_by_comment_id = reactions.index_by(&:reactable_id)
      {
        params: jsonapi_serializer_params(vbci: reactions_by_comment_id),
        include: %i[author user_reaction]
      }
    else
      { params: jsonapi_serializer_params, include: [:author] }
    end

    render json: linked_json(@comments, WebApi::V1::CommentSerializer, serialization_options)
  end

  def show
    render json: WebApi::V1::CommentSerializer.new(
      @comment,
      params: jsonapi_serializer_params,
      include: [:author]
    ).serializable_hash
  end

  def create
    @comment = Comment.new comment_create_params
    @comment.idea_id = params[:idea_id]
    @comment.author ||= current_user
    authorize @comment
    if anonymous_not_allowed?
      render json: { errors: { base: [{ error: :anonymous_participation_not_allowed }] } }, status: :unprocessable_entity
      return
    end
    verify_profanity @comment
    SideFxCommentService.new.before_create @comment, current_user
    if @comment.save
      SideFxCommentService.new.after_create @comment, current_user
      render json: WebApi::V1::CommentSerializer.new(
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
    authorize @comment
    if anonymous_not_allowed?
      render json: { errors: { base: [{ error: :anonymous_participation_not_allowed }] } }, status: :unprocessable_entity
      return
    end
    verify_profanity @comment
    SideFxCommentService.new.before_update @comment, current_user
    if @comment.save
      SideFxCommentService.new.after_update @comment, current_user
      render json: WebApi::V1::CommentSerializer.new(
        @comment,
        params: jsonapi_serializer_params,
        include: [:author]
      ).serializable_hash, status: :ok
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
        head :accepted
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
      head :internal_server_error
    end
  end

  private

  def set_comment
    @comment = Comment.find params[:id]
    authorize @comment
  end

  def comment_create_params
    # no one is allowed to modify someone else's comment,
    # so no one is allowed to write a comment in someone
    # else's name
    params.require(:comment).permit(
      :parent_id,
      :anonymous,
      body_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

  def comment_update_params
    attrs = []
    if @comment.author_id == current_user&.id
      attrs += [:anonymous, { body_multiloc: CL2_SUPPORTED_LOCALES }]
    end
    params.require(:comment).permit(attrs)
  end

  # Merge both arrays in such a way that the order of both is preserved, but
  # the children are directly following their parent
  def merge_comments(root_comments, child_comments)
    children_by_parent = child_comments.group_by(&:parent_id)
    root_comments.flat_map do |root_comment|
      [root_comment, *children_by_parent[root_comment.id]]
    end
  end

  def anonymous_not_allowed?
    return false if !params.dig('comment', 'anonymous')

    !TimelineService.new.current_phase_not_archived(@comment.idea.project).allow_anonymous_participation
  end
end

WebApi::V1::CommentsController.include(AggressiveCaching::Patches::WebApi::V1::CommentsController)
