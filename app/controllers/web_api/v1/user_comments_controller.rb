class WebApi::V1::UserCommentsController < ApplicationController

  def index
    @comments = policy_scope(Comment, policy_scope_class: IdeaCommentPolicy::Scope)  # TODO also include comments on initiatives
      .published
      .where(author_id: params[:user_id])

    @ideas = policy_scope(Idea)
      .where(id: @comments.pluck(:post_id))
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @comments = @comments
      .where(post: @ideas)
      .includes(:idea)
      .left_outer_joins(:idea)
    @comments = @comments.order('ideas.published_at DESC, ideas.id DESC, comments.created_at DESC')

    render json: @comments, include: ['post'], meta: { total_count: @ideas.total_count, total_pages: @ideas.total_pages, current_page: @ideas.current_page }
  end


  private

  def secure_controller?
    false
  end

end
