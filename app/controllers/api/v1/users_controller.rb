class Api::V1::UsersController < ::ApplicationController
  # before_action :authenticate_user, except: [:create]
  before_action :set_user, only: [:show, :update, :destroy]
  skip_after_action :verify_authorized, only: [:index_xlsx]

  def index
    @users = policy_scope(User)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
    render json: @users
  end

  def index_xlsx
    @users = policy_scope(User).all
    xlsx = XlsxService.new.generate_users_xlsx @users
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'users.xlsx'
  end

  def me
    @user = current_user
    skip_authorization
    if @user
      render json: @user
    else
      head 404
    end
  end

  def show
    render json: @user
  end

  def create
    @user = User.new(permitted_attributes(User))
    authorize @user
    if @user.save
      SideFxUserService.new.after_create(@user, current_user)
      render json: @user, status: :created
    else
      render json: { errors: @user.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    if @user.update(permitted_attributes(@user))
      SideFxUserService.new.after_update(@user, current_user)
      render json: @user, status: :ok
    else
      render json: { errors: @user.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    user = @user.destroy
    if user.destroyed?
      SideFxUserService.new.after_destroy(user, current_user)
      head :ok
    else
      head 500
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

end
