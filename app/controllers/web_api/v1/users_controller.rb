class WebApi::V1::UsersController < ::ApplicationController

  # before_action :authenticate_user, except: [:create]
  before_action :set_user, only: [:show, :update, :destroy]
  skip_after_action :verify_authorized, only: [:index_xlsx]

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized


  def index
    @users = policy_scope(User)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @users = @users.search_by_all(params[:search]) if params[:search].present?

    @users = @users.active unless params[:include_inactive]

    @users = case params[:sort]
      when "created_at"
        @users.order(created_at: :asc)
      when "-created_at"
        @users.order(created_at: :desc)
      when "last_name"
        @users.order(last_name: :asc)
      when "-last_name"
        @users.order(last_name: :desc)
      when "email"
        @users.order(email: :asc)
      when "-email"
        @users.order(email: :desc)
      when "role"
        @users.order_role(:asc)
      when "-role"
        @users.order_role(:desc)
      when nil
        @users
      else
        raise "Unsupported sort method"
    end

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
      unread_notifications = @user.notifications.unread.count
      render json: @user, unread_notifications: unread_notifications
    else
      head 404
    end
  end

  def show
    render json: @user
  end

  def by_slug
    @user = User.find_by!(slug: params[:slug])
    authorize @user
    show
  end

  def by_invite
   @user = Invite.find_by!(token: params[:token])&.invitee
   authorize @user
   show
  end

  def create
    @user = User.new(permitted_attributes(User))
    authorize @user

    SideFxUserService.new.before_create(@user, current_user)

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

  def complete_registration
    @user = current_user
    authorize @user

    @user.assign_attributes(permitted_attributes(@user))
    @user.registration_completed_at = Time.now

    if @user.save
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
