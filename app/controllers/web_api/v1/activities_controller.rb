class WebApi::V1::ActivitiesController < ApplicationController

  before_action :set_idea
  skip_after_action :verify_policy_scoped

  def index
    @activities = Activity.where(
      item: @idea,
      action: ['published', 'changed_status', 'changed_title', 'changed_body']
    )
      .includes(:user)
      .order(:acted_at)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: @activities, include: :user
  end

  def show
    render json: @area
  end

  private

  def set_idea
    @idea = Idea.find(params[:idea_id])
    authorize @idea, :get_activities?
  end

  def secure_controller?
    false
  end
end
