class WebApi::V1::UserCommentsController < ApplicationController

  def index
    @comments = policy_scope(Comment)
      .published
      .where(author_id: params[:user_id])

    @ideas = policy_scope(Idea)
      .where(id: @comments.pluck(:idea_id))
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @comments = @comments
      .where(idea_id: @ideas.ids)
      .includes(:idea)
      .left_outer_joins(:idea)
    @comments = @comments.order('ideas.published_at DESC, ideas.id DESC, comments.created_at DESC')

    render json: @comments, include: ['idea'], meta: { total_count: @ideas.total_count, total_pages: @ideas.total_pages, current_page: @ideas.current_page }
  end


  private

  def secure_controller?
    false
  end

end
