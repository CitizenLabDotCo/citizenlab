class WebApi::V1::CommentsController < ApplicationController
  before_action :set_post_type_id_and_policy, only: [:index, :index_xlsx, :create]
  before_action :set_comment, only: [:children, :show, :update, :mark_as_deleted, :destroy]
  skip_after_action :verify_authorized, only: [:index_xlsx]

  FULLY_EXPAND_THRESHOLD = 5
  MINIMAL_SUBCOMMENTS = 2

  def index
    root_comments = policy_scope(Comment, policy_scope_class: @policy_class::Scope)
      .where(post_type: @post_type, post_id: @post_id)
      .where(parent: nil)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
      .includes(:author)

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
      .includes(:author)

    # We're doing this merge in ruby, since the combination of a self-join
    # with different sorting criteria per depth became tremendously complex in
    # one SQL query
    @comments = merge_comments(root_comments.to_a, child_comments.to_a)

    total_root_comments_count = policy_scope(Comment, policy_scope_class: @policy_class::Scope)
      .where(post_id: @post_id)
      .where(parent: nil)
      .count

    if current_user
      votes = Vote.where(user: current_user, votable: @comments)
      votes_by_comment_id = votes.map{|vote| [vote.votable_id, vote]}.to_h
      render json: @comments, include: ['author', 'user_vote'], vbci: votes_by_comment_id, meta: { total: total_root_comments_count }
    else
      render json: @comments, include: ['author'], meta: { total: total_root_comments_count }
    end
  end

  def index_xlsx
    I18n.with_locale(current_user&.locale) do
      post_ids = params[@post_type.underscore.pluralize.to_sym]
      @comments = policy_scope(Comment, policy_scope_class: @policy_class::Scope)
        .where(post_type: @post_type)
        .includes(:author, :"#{@post_type.underscore}")
        .order(:lft)
      if (@post_type == 'Idea') && params[:project].present?
        @comments = @comments.where(ideas: {project_id: params[:project]}) 
      end
      @comments = @comments.where(post_id: post_ids) if post_ids.present?

      service = XlsxService.new
      xlsx = case @post_type
        when 'Idea' then service.generate_idea_comments_xlsx @comments
        when 'Initiative' then service.generate_initiative_comments_xlsx @comments
        else raise "#{@post_type} has no functionality for exporting comments"
      end
      raise RuntimeError, "must not be blank" if @post_type.blank?
      
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'comments.xlsx'
    end
  end

  def children
    @comments = policy_scope(Comment, policy_scope_class: @policy_class::Scope)
      .where(parent: params[:id])
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

  def show
    render json: @comment, include: ['author']
  end

  def create
    @comment = Comment.new comment_create_params
    @comment.post_type = @post_type
    @comment.post_id = @post_id
    @comment.author ||= current_user
    authorize @comment, policy_class: @policy_class
    SideFxCommentService.new.before_create @comment, current_user
    if @comment.save
      SideFxCommentService.new.after_create @comment, current_user
      render json: @comment, status: :created, include: ['author']
    else
      render json: { errors: @comment.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @comment.attributes = comment_update_params
    # We cannot pass policy class to permitted_attributes
    # @comment.attributes = pundit_params_for(@comment).permit(@policy_class.new(current_user, @comment).permitted_attributes_for_update)
    authorize @comment, policy_class: @policy_class
    SideFxCommentService.new.before_update @comment, current_user
    if @comment.save
      SideFxCommentService.new.after_update @comment, current_user
      render json: @comment, status: :ok, include: ['author']
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
      when 'Idea' then IdeaCommentPolicy
      when 'Initiative' then InitiativeCommentPolicy
      else raise "#{@post_type} has no comment policy defined"
    end
    raise RuntimeError, "must not be blank" if @post_type.blank?
  end

  def comment_create_params
    # no one is allowed to modify someone else's comment, 
    # so no one is allowed to write a comment in someone
    # else's name
    params.require(:comment).permit(
      :parent_id,
      body_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

  def comment_update_params
    attrs = []
    if @comment.author_id == current_user&.id
      attrs += [body_multiloc: CL2_SUPPORTED_LOCALES]
    end
    params.require(:comment).permit(attrs)
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
