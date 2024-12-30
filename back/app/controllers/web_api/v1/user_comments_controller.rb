# frozen_string_literal: true

class WebApi::V1::UserCommentsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_policy_scoped

  def index
    # Get the posts the user is allowed to see
    comment_allowed_ideas = policy_scope(Comment)
      .published
      .where(author_id: params[:user_id])

    # Apply pagination to the posts, ordering by publication date.
    joined_posts = Idea.joins('INNER JOIN comments ON comments.idea_id = ideas.id')
    paged_posts = joined_posts.where(comments: { id: comment_allowed_ideas })
      .order(published_at: :desc)
      .group('ideas.id, ideas.published_at')
      .select('ideas.id')
    paged_posts = paginate paged_posts

    # Get the comments, grouped by the corresponding posts page.
    comments = Comment.where(idea_id: paged_posts)
      .where(author_id: params[:user_id])
      .includes(:idea)
      .joins('LEFT OUTER JOIN ideas ON comments.idea_id = ideas.id')
      .order('ideas.published_at DESC, ideas.id DESC, comments.created_at DESC')

    render json: {
      **WebApi::V1::CommentSerializer.new(comments, params: jsonapi_serializer_params, include: [:idea]).serializable_hash,
      links: page_links(paged_posts)
    }
  end
end
