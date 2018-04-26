class WebApi::V1::ModeratorsController < ApplicationController

  before_action :do_authorize, except: [:index]
  before_action :set_moderator, only: [:show, :create, :destroy]
  
  skip_after_action :verify_authorized, only: [:users_search]
  skip_after_action :verify_policy_scoped, only: [:index]

  class Moderator < OpenStruct
    def self.policy_class
      ModeratorPolicy
    end
  end

  def index
    # TODO something about authorize index (e.g. user_id nastiness)
    authorize Moderator.new({user_id: nil, project_id: params[:project_id]})
    @moderators = User
      .where("roles @> ?", JSON.generate([{type: 'project_moderator', project_id: params[:project_id]}]))
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
    render json: @moderators, :each_serializer => WebApi::V1::UserSerializer
  end

  def show
    render json: @moderator, serializer: WebApi::V1::UserSerializer
  end

  # insert
  def create
    @moderator.add_role 'project_moderator', project_id: params[:project_id]
    if @moderator.save
      render json: @moderator, serializer: WebApi::V1::UserSerializer, status: :created
    else
      render json: { errors: @moderator.errors.details }, status: :unprocessable_entity
    end
  end

  # delete
  def destroy
    @moderator.delete_role 'project_moderator', project_id: params[:project_id]
    if @moderator.save
      head :ok
    else
      head 500
    end
  end

  def users_search
    # authorize Membership
    # @users = policy_scope(User)
    #   .search_by_all(params[:search])
    #   .includes(:memberships)
    #   .page(params.dig(:page, :number))
    #   .per(params.dig(:page, :size))

    # render :json => @users, :each_serializer => WebApi::V1::MemberSerializer, :group_id => params[:group_id]
    render json: [], each_serializer: WebApi::V1::UserSerializer
  end


  def set_moderator
    @moderator = User.find params[:id]
  end

  # def moderator_params
  #   params.require(:moderator).permit(
  #     :user_id
  #   )
  # end

  def secure_controller?
    false
  end

  def do_authorize
    authorize Moderator.new({user_id: params[:id], project_id: params[:project_id]})
  end

end
