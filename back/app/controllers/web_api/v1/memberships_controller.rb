# frozen_string_literal: true

class WebApi::V1::MembershipsController < ApplicationController
  before_action :set_membership, only: %i[show destroy]
  before_action :set_membership_from_group_and_user, only: %i[destroy_by_user_id show_by_user_id]
  skip_after_action :verify_authorized, only: [:users_search]

  def index
    @memberships = policy_scope(Membership)
      .where(group_id: params[:group_id])
      .includes(user: [:unread_notifications])
    @memberships = paginate @memberships

    render json: linked_json(
      @memberships,
      WebApi::V1::MembershipSerializer,
      params: jsonapi_serializer_params,
      include: [:user]
    )
  end

  def show
    render json: WebApi::V1::MembershipSerializer.new(
      @membership,
      params: jsonapi_serializer_params,
      include: [:user]
    ).serializable_hash.to_json
  end

  def show_by_user_id
    show
  end

  # insert
  def create
    @membership = Membership.new(membership_params)
    @membership.group_id = params[:group_id]
    authorize @membership
    if @membership.save
      render json: WebApi::V1::MembershipSerializer.new(
        @membership.reload,
        params: jsonapi_serializer_params,
        include: [:user]
      ).serializable_hash.to_json, status: :created
    else
      render json: { errors: @membership.errors.details }, status: :unprocessable_entity
    end
  end

  # delete
  def destroy
    membership = @membership.destroy
    if membership.destroyed?
      head :ok
    else
      head :internal_server_error
    end
  end

  def destroy_by_user_id
    destroy
  end

  def users_search
    authorize Membership
    @users = policy_scope(User)
      .search_by_all(params[:search])
      .includes(:memberships)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: linked_json(@users, WebApi::V1::MemberSerializer, params: jsonapi_serializer_params(group_id: params[:group_id]))
  end

  def set_membership
    @membership = Membership.find params[:id]
    authorize @membership
  end

  def set_membership_from_group_and_user
    @membership = Membership.find_by!(group: params[:group_id], user: params[:user_id])
    authorize @membership
  end

  def membership_params
    params.require(:membership).permit(:user_id)
  end
end
