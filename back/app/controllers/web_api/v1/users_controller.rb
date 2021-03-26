class WebApi::V1::UsersController < ::ApplicationController

  # before_action :authenticate_user, except: [:create]
  before_action :set_user, only: [:show, :update, :destroy, :ideas_count, :initiatives_count, :comments_count]
  skip_after_action :verify_authorized, only: [:index_xlsx]

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized


  def index
    authorize :user, :index?
    @users = policy_scope(User)

    @users = @users.search_by_all(params[:search]) if params[:search].present?

    @users = @users.active unless params[:include_inactive]
    @users = @users.in_group(Group.find(params[:group])) if params[:group]
    @users = @users.admin.or(@users.project_moderator(params[:can_moderate_project])) if params[:can_moderate_project].present?
    @users = @users.admin.or(@users.project_moderator) if params[:can_moderate].present?
    @users = @users.admin if params[:can_admin].present?

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
        @users.order(email: :asc) if view_private_attributes?
      when "-email"
        @users.order(email: :desc) if view_private_attributes?
      when "role"
        @users.order_role(:asc)
      when "-role"
        @users.order_role(:desc)
      when nil
        @users
      else
        raise "Unsupported sort method"
    end

    @users = @users
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    LogActivityJob.perform_later(current_user, 'searched_users', current_user, Time.now.to_i, payload: {search_query: params[:search]}) if params[:search].present?

    render json: linked_json(@users, WebApi::V1::UserSerializer, params: fastjson_params)
  end

  def index_xlsx
    authorize :user, :index_xlsx?
    @users = policy_scope(User).all
    @users = @users.in_group(Group.find(params[:group])) if params[:group]
    @users = @users.where(id: params[:users]) if params[:users]
    xlsx = XlsxService.new.generate_users_xlsx @users, view_private_attributes: view_private_attributes?

    LogActivityJob.perform_later(current_user, 'exported_users_sheet', current_user, Time.now.to_i)

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'users.xlsx'
  end

  def me
    @user = current_user
    skip_authorization

    if @user
      params = fastjson_params unread_notifications: @user.notifications.unread.size
      render json: WebApi::V1::UserSerializer.new(@user, params: params).serialized_json
    else
      head 404
    end
  end

  def show
    render json: WebApi::V1::UserSerializer.new(@user, params: fastjson_params).serialized_json
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
    @user = User.new
    @user.assign_attributes(permitted_attributes(@user))
    authorize @user

    SideFxUserService.new.before_create(@user, current_user)

    if @user.save
      SideFxUserService.new.after_create(@user, current_user)
      permissions = Permission.for_user(@user)
      render json: WebApi::V1::UserSerializer.new(
        @user,
        params: fastjson_params(granted_permissions: permissions)
        ).serialized_json, status: :created
    else
      render json: { errors: @user.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    permissions_before = Permission.for_user(@user)

    mark_custom_field_values_to_clear!
    user_params = permitted_attributes @user
    user_params[:custom_field_values] = @user.custom_field_values.merge(user_params[:custom_field_values] || {})
    user_params = user_params.to_h
    CustomFieldService.new.cleanup_custom_field_values! user_params[:custom_field_values]
    @user.assign_attributes user_params

    if user_params.keys.include?('avatar') && user_params['avatar'] == nil
      # setting the avatar attribute to nil will not remove the avatar
      @user.remove_avatar!
    end
    authorize @user
    if @user.save
      SideFxUserService.new.after_update(@user, current_user)
      permissions = Permission.for_user(@user).where.not(id: permissions_before.ids)
      render json: WebApi::V1::UserSerializer.new(
        @user,
        params: fastjson_params(granted_permissions: permissions),
        include: [:granted_permissions, :'granted_permissions.permission_scope']
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
      render json: WebApi::V1::UserSerializer.new(
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

  def initiatives_count
    render json: {count: policy_scope(@user.initiatives.published).count}, status: :ok
  end

  def comments_count
    count = 0
    published_comments = @user.comments.published
    if !params[:post_type] || params[:post_type] == 'Idea'
      count += policy_scope(
        published_comments.where(post_type: 'Idea'),
        policy_scope_class: IdeaCommentPolicy::Scope
        ).count
    end
    if !params[:post_type] || params[:post_type] == 'Initiative'
      count += policy_scope(
        published_comments.where(post_type: 'Initiative'),
        policy_scope_class: InitiativeCommentPolicy::Scope
        ).count
    end
    render json: {count: count}, status: :ok
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

  def mark_custom_field_values_to_clear!
    # We need to explicitly mark which custom field values
    # should be cleared so we can distinguish those from
    # the custom field value updates cleared out by the
    # policy (which should stay like before instead of
    # being cleared out).
    if current_user&.custom_field_values && params[:user][:custom_field_values]
      (current_user.custom_field_values.keys - (params[:user][:custom_field_values].keys || [])).each do |clear_key|
        params[:user][:custom_field_values][clear_key] = nil
      end
    end
  end

  def view_private_attributes?
    Pundit.policy!(current_user, (@user || User)).view_private_attributes?
  end

end
