# frozen_string_literal: true

module PublicApi
  class V1::UsersController < PublicApiController
    before_action :set_user, only: [:show]

    def index
      # TODO: User policy and permission stuff
      # @users = PublicApi::UserPolicy::Scope.new(current_publicapi_apiclient, User).resolve
      @users = User.all
      @users = @users.order(created_at: :desc)
        .page(params[:page_number])
        .per([params[:page_size]&.to_i || 12, 24].min)

      render json: @users,
        each_serializer: V1::UserSerializer,
        adapter: :json,
        meta: meta_properties(@users)
    end

    def show
      render json: @user,
        serializer: V1::UserSerializer,
        adapter: :json
    end

    private

    def set_user
      @user = User.find(params[:id])
      authorize PolicyWrappedUser.new(@user)
    end

    def meta_properties(relation)
      {
        current_page: relation.current_page,
        total_pages: relation.total_pages
      }
    end
  end
end
