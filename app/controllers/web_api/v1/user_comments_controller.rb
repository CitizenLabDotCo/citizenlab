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
      .where(idea: @ideas)
      .includes(:idea)
      .left_outer_joins(:idea)
    @comments = @comments.order('ideas.published_at DESC, ideas.id DESC, comments.created_at DESC')

    render json: { 
      **WebApi::V1::CommentSerializer.new(@comments, params: fastjson_params, include: [:idea]).serializable_hash,
      links: page_links(@ideas)
    }
  end


  private

  def secure_controller?
    false
  end

end
