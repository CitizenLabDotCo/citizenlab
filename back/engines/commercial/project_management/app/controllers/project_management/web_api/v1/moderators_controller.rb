module ProjectManagement
  module WebApi
    module V1
      class ModeratorsController < ApplicationController
        before_action :do_authorize, except: :index
        before_action :set_moderator, only: %i[show destroy]
        skip_before_action :authenticate_user
        skip_after_action :verify_authorized, only: :users_search
        skip_after_action :verify_policy_scoped, only: :index

        class Moderator < OpenStruct
          def self.policy_class
            ProjectManagement::ModeratorPolicy
          end
        end

        def index
          # TODO something about authorize index (e.g. user_id nastiness)
          authorize Moderator.new({ user_id: nil, project_id: params[:project_id] })
          @moderators = User.project_moderator(params[:project_id])
          @moderators = paginate @moderators

          render json: linked_json(@moderators, ::WebApi::V1::UserSerializer, params: fastjson_params)
        end

        def show
          render json: ::WebApi::V1::UserSerializer.new(@moderator, params: fastjson_params).serialized_json
        end

        # insert
        def create
          @user = ::User.find create_moderator_params[:user_id]
          @user.add_role 'project_moderator', project_id: params[:project_id]
          if @user.save
            ::SideFxUserService.new.after_update(@user, current_user)
            render json: ::WebApi::V1::UserSerializer.new(
              @user,
              params: fastjson_params
            ).serialized_json, status: :created
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
            head 500
          end
        end

        def users_search
          authorize Moderator.new({ user_id: nil, project_id: params[:project_id] })
          @users = ::User.search_by_all(params[:search])
                         .page(params.dig(:page, :number))
                         .per(params.dig(:page, :size))

          render json: linked_json(
            @users,
            ProjectManagement::WebApi::V1::ModeratorSerializer,
            params: fastjson_params(project_id: params[:project_id])
          )
        end

        def set_moderator
          @moderator = User.find params[:id]
        end

        def create_moderator_params
          params.require(:moderator).permit(:user_id)
        end

        def do_authorize
          authorize Moderator.new({ user_id: params[:id], project_id: params[:project_id] })
        end
      end
    end
  end
end
