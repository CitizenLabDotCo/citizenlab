module ProjectFolders
  class WebApi::V1::ModeratorsController < ApplicationController
    before_action :do_authorize
    before_action :set_moderator, only: [:show, :destroy]

    skip_after_action :verify_authorized, only: [:users_search]
    skip_after_action :verify_policy_scoped, only: [:index]

    class Moderator < OpenStruct
      def self.policy_class
        ProjectFolders::ModeratorPolicy
      end
    end

    def index
      @moderators = User.project_folder_moderator(params[:project_folder_id])
                        .page(params.dig(:page, :number))
                        .per(params.dig(:page, :size))

      render json: linked_json(@moderators, ::WebApi::V1::UserSerializer, params: fastjson_params)
    end

    def show
      render json: ::WebApi::V1::UserSerializer.new(@moderator, params: fastjson_params).serialized_json
    end

    # insert
    def create
      @user = User.find(create_moderator_params[:user_id])
      @folder = ProjectFolders::Folder.find(params[:project_folder_id])
      SideFxModeratorService.new.before_create(@user, @folder, current_user)
      @user.add_role 'project_folder_moderator', project_folder_id: params[:project_folder_id]
      if @user.save
        serialized_data =  ::WebApi::V1::UserSerializer.new(@user, params: fastjson_params).serialized_json
        SideFxModeratorService.new.after_create(@user, @folder, current_user)
        render json: serialized_data, status: :created
      else
        render json: { errors: @user.errors.details }, status: :unprocessable_entity
      end
    end

    # delete
    def destroy
      @folder = ProjectFolders::Folder.find(params[:project_folder_id])
      SideFxModeratorService.new.before_destroy(@moderator, @folder, current_user)
      @moderator.delete_role 'project_folder_moderator', project_folder_id: params[:project_folder_id]
      if @moderator.save
        SideFxModeratorService.new.after_destroy(@moderator, @folder, current_user)
        head :ok
      else
        head 500
      end
    end

    private

    def set_moderator
      @moderator = User.find params[:id]
    end

    def create_moderator_params
      params.require(:project_folder_moderator).permit(
        :user_id
      )
    end

    def do_authorize
      authorize Moderator.new(project_folder_id: params[:project_folder_id])
    end
  end
end
