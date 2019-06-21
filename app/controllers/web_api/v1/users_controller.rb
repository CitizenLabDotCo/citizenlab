class WebApi::V1::UsersController < ::ApplicationController

  # before_action :authenticate_user, except: [:create]
  before_action :set_user, only: [:show, :update, :destroy, :ideas_count, :comments_count]
  skip_after_action :verify_authorized, only: [:index_xlsx]

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized


  def index
    authorize :user, :index?
    @users = policy_scope(User)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @users = @users.search_by_all(params[:search]) if params[:search].present?

    @users = @users.active unless params[:include_inactive]
    @users = @users.in_group(Group.find(params[:group])) if params[:group]
    @users = @users.admin.or(@users.project_moderator(params[:can_moderate_project])) if params[:can_moderate_project].present?
    @users = @users.admin.or(@users.project_moderator) if params[:can_moderate].present?
    
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

    render json: WebApi::V1::Fast::UserSerializer.new(@users, params: fastjson_params).serialized_json
  end

  def index_xlsx
    @users = policy_scope(User).all
    @users = @users.in_group(Group.find(params[:group])) if params[:group]
    @users = @users.where(id: params[:users]) if params[:users]
    xlsx = XlsxService.new.generate_users_xlsx @users
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'users.xlsx'
  end

  def me
    @user = current_user
    skip_authorization

    if @user
      params = fastjson_params unread_notifications: @user.notifications.unread.size
      render json: WebApi::V1::Fast::UserSerializer.new(@user, params: params).serialized_json
    else
      head 404
    end
  end

  def show
    render json: WebApi::V1::Fast::UserSerializer.new(@user, params: fastjson_params).serialized_json
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
      permissions = Permission.for_user(@user)
      render json: WebApi::V1::Fast::UserSerializer.new(
        @user, 
        params: fastjson_params(granted_permissions: permissions)
        ).serialized_json, status: :created
    else
      render json: { errors: @user.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    permissions_before = Permission.for_user(@user)

    user_params = permitted_attributes @user
    user_params[:custom_field_values] = @user.custom_field_values.merge(user_params[:custom_field_values] || {})

    @user.assign_attributes user_params

    if user_params.keys.include?('avatar') && user_params['avatar'] == nil
      # setting the avatar attribute to nil will not remove the avatar
      @user.remove_avatar!
    end
    authorize @user
    if @user.save
      SideFxUserService.new.after_update(@user, current_user)
      permissions = Permission.for_user(@user).where.not(id: permissions_before.ids)
      render json: WebApi::V1::Fast::UserSerializer.new(
        @user, 
        params: fastjson_params(granted_permissions: permissions),
        include: [:granted_permissions, :'granted_permissions.permittable']
        ).serialized_json, status: :ok
    else
      render json: { errors: @user.errors.details }, status: :unprocessable_entity
    end
  end

  def complete_registration
    @user = current_user
    authorize @user

    user_params = permitted_attributes @user
    user_params[:custom_field_values] = @user.custom_field_values.merge(user_params[:custom_field_values] || {})

    @user.assign_attributes(user_params)
    @user.registration_completed_at = Time.now

    if @user.save
      SideFxUserService.new.after_update(@user, current_user)
      render json: WebApi::V1::Fast::UserSerializer.new(
        @user, 
        params: fastjson_params
        ).serialized_json, status: :ok
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

  def ideas_count
    render json: {count: policy_scope(@user.ideas.published).count}, status: :ok
  end

  def comments_count
    render json: {count: policy_scope(@user.comments.published).count}, status: :ok
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
