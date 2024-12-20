# frozen_string_literal: true

class WebApi::V1::UserCommentsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_policy_scoped

  def index
    # Get the posts the user is allowed to see
    comment_allowed_ideas = policy_scope(Comment, policy_scope_class: IdeaCommentPolicy::Scope)
      .published
      .where(author_id: params[:user_id])

    # Apply pagination to the posts, using the union_posts
    # view and ordering by publication date.
    joined_posts = UnionPost.joins('INNER JOIN comments ON comments.post_id = union_posts.id')
    paged_posts = joined_posts.where(comments: { id: comment_allowed_ideas })
      .order(published_at: :desc)
      .group('union_posts.id, union_posts.published_at') # Remove union_post duplicates
      .select('union_posts.id')
    paged_posts = paginate paged_posts

    # Get the comments, grouped by the corresponding posts page.
    comments = Comment.where(post_id: paged_posts)
      .where(author_id: params[:user_id])
      .includes(:post)
      .joins('LEFT OUTER JOIN union_posts ON comments.post_id = union_posts.id')
      .order('union_posts.published_at DESC, union_posts.id DESC, comments.created_at DESC')

    render json: {
      **WebApi::V1::CommentSerializer.new(comments, params: jsonapi_serializer_params, include: [:post]).serializable_hash,
      links: page_links(paged_posts)
    }
  end
end
