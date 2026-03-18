class WebApi::V1::SpaceModeratorsController < ApplicationController
  before_action :set_space
  before_action :do_authorize
  before_action :set_moderator, only: %i[show destroy]

  skip_after_action :verify_policy_scoped, only: [:index]

  def index
    @moderators = User.space_moderator(params[:space_id])
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: linked_json(@moderators, ::WebApi::V1::UserSerializer, params: jsonapi_serializer_params)
  end

  def show; end

  def create; end

  def destroy; end

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
end
