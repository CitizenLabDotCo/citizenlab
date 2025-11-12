# frozen_string_literal: true

module AdminApi
  class UsersController < AdminApiController
    before_action :set_user, only: %i[update show]

    def index
      @users = User.order(:created_at)
      @users = paginate @users

      # Without `adapter: nil` an empty @users scope would render in json API
      # instead of json. As there's no data records to derive the type from,
      # it falls back to json-api.
      render json: @users, adapter: nil
    end

    def by_email
      @user = User.find_by!(email: params[:email])
      render json: @user
    end

    def bulk_delete_by_emails
      AdminApi::BulkDeleteUsersJob.perform_later(params[:emails])
      head :ok
    end

    def show
      # This uses default model serialization
      render json: @user
    end

    def jwt_token
      user = User.find(params[:id])
      json = { jwt_token: JwtTokenService.new.request_token(user) }
      render json:
    end

    def create
      user = UserService.create_in_admin_api(user_params, confirm_user?)

      if user.persisted?
        SideFxUserService.new.after_create user, nil
        # This uses default model serialization
        render json: user, status: :created
      else
        render json: { errors: user.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      updated = UserService.update_in_admin_api(@user, user_params, confirm_user?)

      if updated
        SideFxUserService.new.after_update(@user, nil)
        # This uses default model serialization
        render json: @user, status: :ok
      else
        render json: { errors: @user.errors.details }, status: :unprocessable_entity
      end
    end

    private

    def set_user
      @user = User.find(params[:id])
    end

    def allowed_custom_field_keys
      enabled_fields = CustomField.registration.enabled
      CustomFieldParamsService.new.custom_field_values_params(enabled_fields)
    end

    def user_params
      params
        .require(:user)
        .permit(:first_name, :last_name, :email, :password, :remote_avatar_url, roles: %i[type project_id], custom_field_values: allowed_custom_field_keys)
    end

    def confirm_user?
      params[:confirm_email].to_s.downcase.in?(%w[true 1])
    end
  end
end
