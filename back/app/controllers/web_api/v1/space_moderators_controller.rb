class WebApi::V1::SpaceModeratorsController < ApplicationController
  before_action :set_space
  before_action :do_authorize
  before_action :set_moderator, only: %i[show destroy]

  skip_after_action :verify_policy_scoped, only: [:index]

  def index
    @moderators = User.space_moderator(@space.id)
    @moderators = paginate @moderators

    render json: linked_json(@moderators, ::WebApi::V1::UserSerializer, params: jsonapi_serializer_params)
  end

  def show
    render json: ::WebApi::V1::UserSerializer.new(@moderator, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    @user = find_user_by_params
    @user.add_role 'space_moderator', space_id: @space.id

    if @user.save
      ::SideFxUserService.new.after_update(@user, current_user)
      render json: ::WebApi::V1::UserSerializer.new(
        @user,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: @user.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    @moderator.delete_role 'space_moderator', space_id: @space.id

    if @moderator.save
      ::SideFxUserService.new.after_update(@moderator, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def do_authorize
    authorize @space, policy_class: SpaceModeratorPolicy
  end

  def set_moderator
    @moderator = User.find params[:id]
  end

  def set_space
    @space = Space.find(params[:space_id])
  end

  def create_moderator_params
    params.require(:moderator).permit(:user_id,:user_email)
  end

  def find_user_by_params
    if create_moderator_params[:user_id].present?
      User.find(create_moderator_params[:user_id])
    elsif create_moderator_params[:user_email].present?
      User.find_by!(email: create_moderator_params[:user_email])
    else
      raise ActiveRecord::RecordNotFound, 'Must provide either user_id or user_email'
    end
  end
end
