class WebApi::V1::InvitesController < ApplicationController

  UNAUTHORIZED_ACCEPT_REASONS = {
    token_not_found: 'token_not_found',
    already_accepted: 'already_accepted'
  }


  skip_after_action :verify_authorized, only: [:accept]

  def index
    @invites = policy_scope(Invite)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: @invites
  end


  def create
    @invitee = User.new(create_params)
    @invitee.invite_status = 'pending'
    @invitee.locale ||= current_user&.locale
    @invitee.password ||= SecureRandom.urlsafe_base64 32
    @invite = Invite.new(invitee: @invitee, inviter: current_user)
    authorize @invite
    begin
      ActiveRecord::Base.transaction do
        if !@invitee.save
          raise ClErrors::TransactionError.new(error_key: :unprocessable_invitee)
        end
        if !@invite.save
          raise ClErrors::TransactionError.new(error_key: :unprocessable_invite)
        end
        SideFxInviteService.new.after_create(@invite, current_user)
        render json: @invite.reload, include: ['invitee'], status: :created
      end
    rescue ClErrors::TransactionError => e
      if e.error_key == :unprocessable_invitee
        render json: { errors: @invitee.errors.details }, status: :unprocessable_entity
      elsif e.error_key == :unprocessable_invite
        render json: { errors: @invite.errors.details }, status: :unprocessable_entity
      else
        raise e
      end
    end
  end


  def accept
    @invite = Invite.find_by(token: params[:token])
    if !@invite
      render json: { errors: { base: [{ error: UNAUTHORIZED_ACCEPT_REASONS[:token_not_found] }] } }, status: :unauthorized 
      return
    end
    if @invite.accepted_at
      render json: { errors: { base: [{ error: UNAUTHORIZED_ACCEPT_REASONS[:already_accepted] }] } }, status: :unauthorized 
      return
    end
    invitee = @invite.invitee
    begin
      ActiveRecord::Base.transaction do
        invitee.assign_attributes accept_params
        invitee.invite_status = 'accepted'
        if !invitee.save
          raise ClErrors::TransactionError.new(error_key: :unprocessable_invitee)
        end
        @invite.accepted_at = Time.now
        if !@invite.save
          raise ClErrors::TransactionError.new(error_key: :unprocessable_invite)
        end
        SideFxInviteService.new.after_accept(@invite)
        render json: @invite.reload, include: ['invitee'], status: :ok
      end
    rescue ClErrors::TransactionError => e
      if e.error_key == :unprocessable_invitee
        render json: { errors: invitee.errors.details }, status: :unprocessable_entity
      elsif e.error_key == :unprocessable_invite
        render json: { errors: @invite.errors.details }, status: :unprocessable_entity
      else
        raise e
      end
    end
  end

  def create_params
    params.require(:invite).permit(
      :email,
      :first_name, 
      :last_name, 
      :avatar, 
      :locale, 
      roles: [:type, :project_id],
      group_ids: []
    )
  end

  def accept_params
    params.require(:invite).permit(
      :email,
      :first_name, 
      :last_name, 
      :password, 
      :locale, 
    )
  end

  def secure_controller?
    # when accepting an invite, the user is still to be logged in;
    # hence, no user is logged in, therefore we do not want to
    # authenticate a user
    false
  end

end
