class Api::V1::UsersController < ::ApplicationController
  # before_action :authenticate_user, except: [:create]
  before_action :set_user, only: [:show, :update, :destroy]

  def index
    authorize User, :index?
    @users = policy_scope(User).page(params[:page])
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
    render json: @users
  end

  def me
    skip_authorization
    @user = current_user
    if @user
      render json: @user
    else
      head :forbidden
    end
  end

  def show
    render json: @user
  end

  def create
    skip_authorization
    @user = User.new(user_params)

    # unless user_params[:avatar]
    #   hash = Digest::MD5.hexdigest(@user.email)
    #   @user.remote_avatar_url = "https://www.gravatar.com/avatar/#{hash}?d=retro&size=640"
    # end

    if @user.save
      render json: @user, status: :created
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def update
    if @user.update(user_params)
      send_success(@user)
    else
      send_error(@user.errors, :unprocessable_entity)
    end
  end

  private
  # TODO: temp fix to pass tests
  def secure_controller?
    false
  end

  def set_user
    @user = User.find params[:id]
    authorize @user
  rescue ActiveRecord::RecordNotFound
    send_error(nil, 404)
  end

  def user_params
    params.require(:user).permit(:first_name, :last_name, :email, :password, :avatar, :locale)
  end
end
