class WebApi::V1::MembershipsController < ApplicationController

  before_action :set_membership, only: [:show, :destroy]
  skip_after_action :verify_authorized, only: [:users_search, :accept_invite]

  def index
    @memberships = policy_scope(Membership)
      .where(group_id: params[:group_id])
      .includes(:user)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
  	render json: @memberships, include: ['user']
  end

  def show
    render json: @membership, include: ['user'], serializer: WebApi::V1::MembershipSerializer
  end

  # insert
  def create
    @membership = Membership.new(membership_params)
    @membership.group_id = params[:group_id]
    authorize @membership
    if @membership.save
      render json: @membership.reload, include: ['user'], status: :created
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
      head 500
    end
  end

  def users_search
    authorize Membership
    @users = policy_scope(User)
      .search_by_all(params[:search])
      .includes(:memberships)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    # @users += policy_scope(User)
    #   .where("first_name || ' ' || last_name || ' ' || email ILIKE (?)", "%#{params[:query]}%")
    #   .where.not(id: @users.map(&:id))
    #   .includes(:memberships)
    #   .page(params.dig(:page, :number))
    #   .per(params.dig(:page, :size))
    render :json => @users, :each_serializer => WebApi::V1::MemberSerializer, :group_id => params[:group_id]
  end

  def invite
    authorize Membership
    invitee = User.find_by(email: invite_params[:email])
    if invitee
      @membership = Membership.new(user: invitee, group_id: params[:group_id])
      if @membership.save
        render json: @membership, include: ['user'], status: :created
      else
        render json: { errors: @membership.errors.details }, status: :unprocessable_entity
      end
    else
      @invite = Invite.new invite_params
      @invite.group_id = params[:group_id]
      @invite.inviter ||= current_user
      if @invite.save
        SideFxInviteService.new.after_create(@invite, current_user)
        render json: @invite.reload, include: ['inviter'], status: :created
      else
        render json: { errors: @invite.errors.details }, status: :unprocessable_entity
      end
    end
  end


  def set_membership
    @membership = Membership.find params[:id]
    authorize @membership
  end

  def membership_params
    params.require(:membership).permit(
      :user_id
    )
  end

  def invite_params
    params.require(:membership).permit(
      :email
    )
  end

end
