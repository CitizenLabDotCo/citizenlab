class Api::V1::UsersController < ::ApplicationController

  def index
    @users = policy_scope(User).page(params[:page])
    render json: @users
  end
end
