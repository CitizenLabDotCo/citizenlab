# frozen_string_literal: true

class WebApi::V1::ProjectModeratorsController < ApplicationController
  before_action :do_authorize, except: :index
  before_action :set_moderator, only: %i[show destroy]
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized, only: :users_search
  skip_after_action :verify_policy_scoped, only: :index

  Moderator = Struct.new(:user_id, :project_id) do
    def self.policy_class
      ProjectModeratorPolicy
    end
  end

  def index
    # TODO: something about authorize index (e.g. user_id nastiness)
    authorize Moderator.new(nil, params[:project_id])
    @moderators = User.project_moderator(params[:project_id])
    @moderators = paginate @moderators

    render json: linked_json(@moderators, ::WebApi::V1::UserSerializer, params: jsonapi_serializer_params)
  end

  def show
    render json: ::WebApi::V1::UserSerializer.new(@moderator, params: jsonapi_serializer_params).serializable_hash
  end

  # insert
  def create
    @user = ::User.find create_moderator_params[:user_id]
    @user.add_role 'project_moderator', project_id: params[:project_id]
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

  # delete
  def destroy
    @moderator.delete_role 'project_moderator', project_id: params[:project_id]
    if @moderator.save
      ::SideFxUserService.new.after_update(@moderator, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  def users_search
    authorize Moderator.new(nil, params[:project_id])
    @users = ::User.search_by_all(params[:search])
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: linked_json(
      @users,
      ::WebApi::V1::ProjectModeratorSerializer,
      params: jsonapi_serializer_params(project_id: params[:project_id])
    )
  end

  def set_moderator
    @moderator = User.find params[:id]
  end

  def create_moderator_params
    params.require(:moderator).permit(:user_id)
  end

  def do_authorize
    authorize Moderator.new(params[:id], params[:project_id])
  end
end
