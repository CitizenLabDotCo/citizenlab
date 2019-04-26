class WebApi::V1::UserCommentsController < ApplicationController

  def index
    @comments = policy_scope(Comment)
      .where(author_id: params[:user_id])
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
      .includes(:idea)
      .left_outer_joins(:idea)
    @comments = @comments.order('ideas.published_at DESC, comments.created_at DESC')

    render json: @comments, include: ['idea']
  end


  private

  def secure_controller?
    false
  end

end
