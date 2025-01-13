# frozen_string_literal: true

class WebApi::V1::UsersController < ApplicationController
  include BlockingProfanity

  before_action :set_user, only: %i[show update destroy ideas_count comments_count block unblock]
  skip_before_action :authenticate_user, only: %i[create show check by_slug by_invite ideas_count comments_count]

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def index
    authorize :user, :index?

    @users = policy_scope User

    @users = @users.in_group(Group.find(params[:group])) if params[:group]
    @users = @users.registered unless params[:include_inactive]
    @users = @users.blocked if params[:only_blocked]
    @users = @users.search_by_all(params[:search]) if params[:search].present?

    @users = @users.admin.or(@users.project_moderator(params[:can_moderate_project])) if params[:can_moderate_project].present?
    @users = @users.not_project_moderator(params[:is_not_project_moderator]) if params[:is_not_project_moderator].present?
    @users = @users.admin.or(@users.project_moderator).or(@users.project_folder_moderator) if params[:can_moderate].present?
    @users = @users.not_project_folder_moderator(params[:is_not_folder_moderator]) if params[:is_not_folder_moderator].present?
    @users = @users.not_citizenlab_member if params[:not_citizenlab_member].present?

    @users = @users.project_reviewers(Utils.to_bool(params[:project_reviewer])) if params.key?(:project_reviewer)

    case params[:can_admin]&.downcase
    when 'true' then @users = @users.admin
    when 'false' then @users = @users.not_admin
    end

    sort_by_sort_param if params[:search].blank?

    @users = paginate @users

    LogActivityJob.perform_later(current_user, 'searched_users', current_user, Time.now.to_i, payload: { search_query: params[:search] }) if params[:search].present?

    render json: linked_json(@users, WebApi::V1::UserSerializer, params: jsonapi_serializer_params)
  end

  def seats
    authorize :user, :seats?

    attributes = {
      admins_number: User.billed_admins.count,
      moderators_number: User.billed_moderators.count
    }
    render json: raw_json(attributes)
  end

  def index_xlsx
    authorize :user, :index_xlsx?

    @users = policy_scope User
    @users = @users.registered unless params[:include_inactive]

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
      params = jsonapi_serializer_params unread_notifications: @user.notifications.unread.size
      render json: WebApi::V1::UserSerializer.new(@user, params: params).serializable_hash
    else
      head :not_found
    end
  end

  def show
    render json: WebApi::V1::UserSerializer.new(@user, params: jsonapi_serializer_params).serializable_hash
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

  # To validate an email without creating a user and return which action to go to next
  def check
    skip_authorization
    if User::EMAIL_REGEX.match?(params[:email])
      @user = User.find_by email: params[:email]
      if @user&.invite_pending?
        render json: { errors: { email: [{ error: 'taken_by_invite', value: params[:email], inviter_email: @user.invitee_invite&.inviter&.email }] } }, status: :unprocessable_entity
      elsif @user && !@user&.no_password?
        render json: raw_json({ action: 'password' })
      elsif @user&.registration_completed_at.present?
        render json: raw_json({ action: 'confirm' })
      else
        render json: raw_json({ action: 'terms' })
      end
    else
      render json: { errors: { email: [{ error: 'invalid', value: params[:email] }] } }, status: :unprocessable_entity
    end
  end

  def create
    @user = User.new
    saved = UserService.upsert_in_web_api(@user, permitted_attributes(@user)) do
      verify_profanity @user
      authorize @user
    end
    if saved
      SideFxUserService.new.after_create(@user, current_user)
      render json: WebApi::V1::UserSerializer.new(
        @user,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    elsif reset_confirm_on_existing_no_password_user?
      SideFxUserService.new.after_update(@user, current_user)
      render json: WebApi::V1::UserSerializer.new(
        @user,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @user.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    saved = UserService.upsert_in_web_api(@user, update_params) do
      verify_profanity @user
      remove_image_if_requested!(@user, update_params, :avatar)
      authorize(@user)
    end

    if saved
      SideFxUserService.new.after_update(@user, current_user)
      render json: WebApi::V1::UserSerializer.new(
        @user,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @user.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    DeleteUserJob.perform_now(@user.id, current_user)
    head :ok
  end

  def block
    block_end_at = Time.zone.now + app_configuration.settings('user_blocking', 'duration').days

    authorize @user, :block?
    if @user.update(
      block_start_at: Time.zone.now,
      block_end_at: block_end_at,
      block_reason: params.dig(:user, :block_reason)
    )
      SideFxUserService.new.after_block(@user, current_user)

      render json: WebApi::V1::UserSerializer.new(@user, params: jsonapi_serializer_params).serializable_hash
    else
      render json: { errors: @user.errors.details }, status: :unprocessable_entity
    end
  end

  def unblock
    authorize @user, :unblock?
    if @user.update(block_start_at: nil, block_end_at: nil, block_reason: nil)
      SideFxUserService.new.after_unblock(@user, current_user)

      render json: WebApi::V1::UserSerializer.new(@user, params: jsonapi_serializer_params).serializable_hash
    else
      render json: { errors: @user.errors.details }, status: :unprocessable_entity
    end
  end

  def ideas_count
    ideas = policy_scope(IdeasFinder.new({}, scope: @user.ideas.published, current_user: current_user).find_records)
    render json: raw_json({ count: ideas.count }), status: :ok
  end

  def blocked_count
    authorize :user, :blocked_count?
    render json: raw_json({ count: User.all.blocked.count }, type: 'blocked_users_count'), status: :ok
  end

  def comments_count
    count = policy_scope(@user.comments.published).count
    render json: raw_json({ count: count }), status: :ok
  end

  def update_password
    @user = current_user
    authorize @user
    if @user.no_password? || @user.authenticate(params[:user][:current_password])
      if @user.update(password: params[:user][:password])
        render json: WebApi::V1::UserSerializer.new(
          @user,
          params: jsonapi_serializer_params
        ).serializable_hash
      else
        render json: { errors: @user.errors.details }, status: :unprocessable_entity
      end
    else
      render json: { errors: { current_password: [{ error: 'invalid' }] } }, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = User.find params[:id]
    authorize @user
  rescue ActiveRecord::RecordNotFound
    send_error(nil, 404)
  end

  def reset_confirm_on_existing_no_password_user?
    return false unless app_configuration.feature_activated?('user_confirmation')

    original_user = @user
    errors = original_user.errors.details[:email]
    return false unless errors.any? { |hash| hash[:error] == :taken }

    existing_user = User.find_by(email: @user.email)
    return false unless existing_user
    return false unless existing_user.no_password?

    # If any attributes try to change then ignore this found user
    existing_user.assign_attributes(permitted_attributes(existing_user))
    return false if existing_user.changed?

    @user = existing_user
    @user.reset_confirmation_and_counts
    return false unless @user.save

    true
  end

  def sort_by_sort_param
    @users = case params[:sort]
    when 'created_at'
      @users.order(created_at: :asc)
    when '-created_at'
      @users.order(created_at: :desc)
    when 'last_active_at'
      @users.order(Arel.sql('last_active_at IS NOT NULL, last_active_at ASC'))
    when '-last_active_at'
      @users.order(Arel.sql('last_active_at IS NULL, last_active_at DESC'))
    when 'last_name'
      @users.order(last_name: :asc)
    when '-last_name'
      @users.order(last_name: :desc)
    when 'email'
      @users.order(email: :asc) if view_private_attributes?
    when '-email'
      @users.order(email: :desc) if view_private_attributes?
    when 'role'
      @users.order_role(:asc)
    when '-role'
      @users.order_role(:desc)
    when nil
      @users
    else
      raise 'Unsupported sort method'
    end
  end

  def view_private_attributes?
    policy(@user || User).view_private_attributes?
  end

  def update_params
    @update_params ||= permitted_attributes(@user).tap do |attrs|
      attrs[:onboarding] = @user.onboarding.merge(attrs[:onboarding].to_h)
      attrs[:custom_field_values] = params_service.updated_custom_field_values(@user.custom_field_values, attrs[:custom_field_values].to_h)
      CustomFieldService.new.compact_custom_field_values!(attrs[:custom_field_values])

      # Even if the feature is not activated, we still want to allow the user to remove
      # their avatar.
      if !app_configuration.feature_activated?('user_avatars') && !attrs[:avatar].nil?
        attrs.delete(:avatar)
      end
    end.permit!
  end

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end

  def params_service
    @params_service ||= CustomFieldParamsService.new
  end
end
