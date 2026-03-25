# frozen_string_literal: true

class WebApi::V1::FolderModeratorsController < ApplicationController
  before_action :do_authorize
  before_action :set_moderator, only: %i[show destroy]

  skip_after_action :verify_policy_scoped, only: [:index]

  Moderator = Struct.new(:project_folder_id) do
    def self.policy_class
      FolderModeratorPolicy
    end
  end

  def index
    @moderators = User.project_folder_moderator(params[:project_folder_id])
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: linked_json(@moderators, ::WebApi::V1::UserSerializer, params: jsonapi_serializer_params)
  end

  def show
    render json: ::WebApi::V1::UserSerializer.new(@moderator, params: jsonapi_serializer_params).serializable_hash
  end

  # insert
  def create
    @user = find_user_by_params
    @folder = ProjectFolders::Folder.find(params[:project_folder_id])
    @user.add_role 'project_folder_moderator', project_folder_id: params[:project_folder_id]
    if @user.save
      serialized_data = ::WebApi::V1::UserSerializer.new(@user, params: jsonapi_serializer_params).serializable_hash
      SideFxFolderModeratorService.new.after_create(@user, @folder, current_user)
      render json: serialized_data, status: :created
    else
      render json: { errors: @user.errors.details }, status: :unprocessable_entity
    end
  end

  # delete
  def destroy
    @folder = ProjectFolders::Folder.find(params[:project_folder_id])
    @moderator.delete_role 'project_folder_moderator', project_folder_id: params[:project_folder_id]
    if @moderator.save
      SideFxFolderModeratorService.new.after_destroy(@moderator, @folder, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_moderator
    @moderator = User.find params[:id]
  end

  def create_moderator_params
    params.require(:project_folder_moderator).permit(
      :user_id,
      :user_email
    )
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

  def do_authorize
    authorize Moderator.new(params[:project_folder_id])
  end
end
