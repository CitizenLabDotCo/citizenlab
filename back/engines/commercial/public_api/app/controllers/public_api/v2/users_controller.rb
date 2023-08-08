# frozen_string_literal: true

module PublicApi
  class V2::UsersController < PublicApiController
    include DeletedItemsAction

    before_action :set_user, only: [:show]

    def index
      users = User
        .order(created_at: :desc)
        .page(params[:page_number])
        .per(num_per_page)

      users = common_date_filters(users)

      # TODO: Filter by first_partcipated, status

      render json: users,
        each_serializer: V2::UserSerializer,
        adapter: :json,
        meta: meta_properties(users)
    end

    def show
      render json: @user,
        serializer: V2::UserSerializer,
        adapter: :json
    end

    private

    def set_user
      @user = User.find(params[:id])
    end
  end
end
