class WebApi::V1::UserCommentsController < ApplicationController
  skip_after_action :verify_policy_scoped
  

  def index
    comments, pagination = TempUserCommentsService.new.union_view_solution current_user, params

    render json: comments, include: ['post'], meta: { total_count: pagination.total_count, total_pages: pagination.total_pages, current_page: pagination.current_page }
  end


  private

  def secure_controller?
    false
  end

end
