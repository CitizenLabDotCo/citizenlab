class WebApi::V1::SpaceModeratorsController < ApplicationController
  before_action :do_authorize
  before_action :set_moderator, only: %i[show destroy]

  skip_after_action :verify_policy_scoped, only: [:index]

  Moderator = Struct.new(:space_id) do
    def self.policy_class
      SpaceModeratorPolicy
    end
  end

  def index
    @moderators = User.space_moderator(params[:space_id])
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: linked_json(@moderators, ::WebApi::V1::UserSerializer, params: jsonapi_serializer_params)
  end

  def show; end

  def destroy; end

  def do_authorize
    authorize Moderator.new(params[:space_id])
  end
end
