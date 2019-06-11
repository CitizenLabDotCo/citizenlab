require 'rubyXL'

class TempUserCommentsService
  # TODO find best solution, substitute in controller and delete this service

  def in_ruby_solution user, params={}
    # Get all the user's commented post ids
    idea_comments = IdeaCommentPolicy::Scope.new(user, Comment).resolve  # TODO user policy_scope
      .published
      .where(author_id: params[:user_id])
    initiative_comments = InitiativeCommentPolicy::Scope.new(user, Comment).resolve  # TODO user policy_scope
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

    [comments, post_ids]
  end

  def union_view_solution user, params={}
    comment_allowed_ideas = IdeaCommentPolicy::Scope.new(user, Comment).resolve  # TODO user policy_scope
      .published
      .where(author_id: params[:user_id])
    comment_allowed_initiatives = InitiativeCommentPolicy::Scope.new(user, Comment).resolve  # TODO user policy_scope
      .published
      .where(author_id: params[:user_id])

    joined_paged_posts = UnionPost.joins('INNER JOIN comments ON comments.post_id = union_posts.id')
    paged_posts = joined_paged_posts.where(comments: {id: comment_allowed_ideas})
      .or(joined_paged_posts.where(comments: {id: comment_allowed_initiatives}))
      .order(published_at: :desc)
      .group('union_posts.id, union_posts.published_at')
      .select('union_posts.id')
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
      # .select('union_posts.id')
      # .distinct
      # .page(params.dig(:page, :number))
      # .per(params.dig(:page, :size))

    comments = Comment.where(id: comment_allowed_ideas)
      .or(Comment.where(id: comment_allowed_initiatives))
      .where(post_id: paged_posts)
      .joins('LEFT OUTER JOIN union_posts ON comments.post_id = union_posts.id')
      .order('union_posts.published_at DESC, union_posts.id DESC, comments.created_at DESC')
      # .left_outer_joins(:post)
      # .order('posts.published_at DESC, posts.id DESC, comments.created_at DESC')
      # .includes(:post)
      # .left_outer_joins(:post)
      # .order('posts.published_at DESC, posts.id DESC, comments.created_at DESC')

    [comments, paged_posts]
  end

end