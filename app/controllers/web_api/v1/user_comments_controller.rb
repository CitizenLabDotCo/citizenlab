class WebApi::V1::UserCommentsController < ApplicationController

  def index
    # Get all the user's commented post ids
    idea_comments = policy_scope(Comment, policy_scope_class: IdeaCommentPolicy::Scope)
      .published
      .where(author_id: params[:user_id])
    initiative_comments = policy_scope(Comment, policy_scope_class: InitiativeCommentPolicy::Scope)
      .published
      .where(author_id: params[:user_id])
    ideas = Idea.where(id: idea_comments.pluck(:post_id))
      .select(:id, :published_at)
    initiatives = Initiative.where(id: initiative_comments.pluck(:post_id))
      .select(:id, :published_at)
    post_ids = (ideas + initiatives).sort_by(&:published_at).reverse.map(&:id)

    # Pagination applied on the post ids array
    post_ids = Kaminari.paginate_array(post_ids)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    # Get the comment ids for the requested page in the correct order
    comment_id_to_created_at = Comment.where(post_id: post_ids).collect{|c| [c.id, c.created_at]}.to_h
    comment_id_to_post_id = Comment.where(post_id: post_ids).collect{|c| [c.id, c.post_id]}.to_h
    post_id_to_published_at = (Idea.where(id: post_ids) + Initiative.where(id: post_ids)).collect{|i| [i.id, i.published_at]}.to_h
    comment_ids = Comment.where(post_id: post_ids).ids.sort_by do |id|
      post_id = comment_id_to_post_id[id]
      [post_id_to_published_at[post_id], post_id, comment_id_to_created_at[id]]
    end.reverse

    # Get comments in the same order as comment_ids
    comments_by_id = Comment.where(id: comment_ids).index_by(&:id) # Gives you a hash indexed by ID
    comments = comment_ids.collect {|id| comments_by_id[id] }.flatten

    render json: comments, include: ['post'], meta: { total_count: post_ids.total_count, total_pages: post_ids.total_pages, current_page: post_ids.current_page }
  end


  private

  def secure_controller?
    false
  end

end
