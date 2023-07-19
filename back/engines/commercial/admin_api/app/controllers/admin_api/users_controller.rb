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

    def create
      @user = User.new user_params
      @user.locale ||= AppConfiguration.instance.settings('core', 'locales').first
      SideFxUserService.new.before_create @user, nil

      if @user.save
        SideFxUserService.new.after_create @user, nil

        # The validations and hooks on the user model don't allow us to set
        # confirm before save on creation, they'll get reset. So we're forced to
        # do a 2nd save operation.
        if [true, 'TRUE', 'true', '1', 1].include?(params[:confirm_email])
          @user.confirm
          @user.save
        end

        # This uses default model serialization
        render json: @user, status: :created
      else
        render json: { errors: @user.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      @user.assign_attributes user_params
      SideFxUserService.new.before_update(@user, nil)
      if @user.save
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
      enabled_fields = CustomField
        .with_resource_type('User')
        .enabled
      simple_keys = enabled_fields.support_single_value.pluck(:key).map(&:to_sym)
      array_keys = enabled_fields.support_multiple_values.pluck(:key).map(&:to_sym)

      [*simple_keys, array_keys.index_with { |_k| [] }]
    end

    def user_params
      params
        .require(:user)
        .permit(:first_name, :last_name, :email, :password, :remote_avatar_url, roles: %i[type project_id], custom_field_values: allowed_custom_field_keys)
    end
  end
end
