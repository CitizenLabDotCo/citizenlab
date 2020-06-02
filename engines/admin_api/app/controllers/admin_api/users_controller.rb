module AdminApi
  class UsersController < AdminApiController

    before_action :set_user, only: [:update, :show]

    def by_email
      @user = User.find_by!(email: params[:email])
      render json: @user
    end

    def show
      # This uses default model serialization
      render json: @user
    end

    def create
      @user = User.new user_params
      @user.locale ||= Tenant.current.settings.dig('core', 'locales').first
      SideFxUserService.new.before_create @user, nil
      if @user.save
        SideFxUserService.new.after_create @user, nil
        # This uses default model serialization
        render json: @user, status: :created
      else
        render json: {errors: @user.errors.details}, status: :unprocessable_entity
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
        render json: {errors: @user.errors.details}, status: :unprocessable_entity
      end
    end

    private

    def secure_controller?
      false
    end

    def set_user
      @user = User.find(params[:id])
    end

    def user_params
      params
        .require(:user)
        .permit(:first_name, :last_name, :email, :password, :remote_avatar_url, roles: [:type, :project_id])
    end

  end
end
