class WebApi::V1::InvitesController < ApplicationController

  skip_after_action :verify_authorized, only: [:accept]


  def accept
    @invite = Invite.find_by(token: params[:token])
    if !@invite
      #AmIDoingThisRight?
      render json: { errors: { base: [{ error: "No invite with token #{params[:token]}" }] } }, status: :unauthorized 
      return
      # raise ActiveRecord::RecordNotFound.new(id: params[:token], model: Invite, primary_key: :token)
    end
    invitee = @invite.invitee

    begin
      ActiveRecord::Base.transaction do
        invitee.is_invited = false
        if !invitee.save
          raise ClErrors::TransactionError.new(error_key: :unprocessable_invitee)
        end
        @invite.destroy!
        SideFxInviteService.new.after_accept(@invite)
        head :accepted
      end
    rescue ClErrors::TransactionError => e
      if e.error_key == :unprocessable_invitee
        render json: { errors: invitee.errors.details }, status: :unprocessable_entity
      else
        raise e
      end
    end

    # @user = User.new accept_params
    # @user.email = @invite.email
    # @user.locale ||= @invite.inviter&.locale
    

    #ActiveRecord::Base.transaction do
    #  if @user.save
    #    @membership = Membership.new(user: @user, group_id: @invite.group_id)
    #    if @membership.save
    #      SideFxUserService.new.after_create(@user, current_user)
    #      SideFxInviteService.new.after_accept(@invite, @user)
    #      @invite.destroy!
    #      render json: @membership, include: ['user'], status: :created
    #    else
    #      render json: { errors: @membership.errors.details }, status: :unprocessable_entity
    #    end
    #  else
    #    render json: { errors: @user.errors.details }, status: :unprocessable_entity
    #  end
    #end
  end

  def create
    # TODO

    @invitee = User.new(email: invite_params[:email], is_invited: true)
    @invite = Invite.new(*invite_params*)
    @invite.inviter ||= current_user
    authorize @invite
    ActiveRecord::Base.transaction do
      if !@invitee.save
        render json: { errors: @invitee.errors.details }, status: :unprocessable_entity
      elsif !@invite.save
        render json: { errors: @invite.errors.details }, status: :unprocessable_entity
      else
        SideFxInviteService.new.after_create(@invite, current_user)
        render json: @invite.reload, include: ['invitee'], status: :created
      end
    end



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

  def accept_params
    # TODO shared constant of user creation attributes, but no email here
    params.require(:invite).permit(
      [:first_name, :last_name, :password, :avatar, :locale, :gender, :birthyear, :domicile, :education, bio_multiloc: I18n.available_locales]
    )
  end

  def secure_controller?
    # when accepting an invite, the user is still to be logged in;
    # hence, no user is logged in, therefore we do not want to
    # authenticate a user
    false
  end

end
