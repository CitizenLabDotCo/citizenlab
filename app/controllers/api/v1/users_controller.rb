class Api::V1::UsersController < ::ApplicationController
  # before_action :authenticate_user, except: [:create]
  before_action :set_user, only: [:show, :update, :destroy]

  def index
    @users = policy_scope(User).page(params[:page])
    render json: @users
  end

  def show
    render json: @user
  end

  def create
    skip_authorization
    @user = User.new(user_params)

    if @user.save
      render json: @user, status: :created
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = User.find params[:id]
    authorize @user
  end

  def user_params
    params.require(:user).permit(:name, :email, :password)
  end
end
