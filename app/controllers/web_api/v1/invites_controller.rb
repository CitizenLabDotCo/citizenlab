class WebApi::V1::InvitesController < ApplicationController

  skip_after_action :verify_authorized, only: [:accept]


  def create
    @invitee = User.new(create_params)
    @invitee.is_invited = true
    @invite = Invite.new(invitee: @invitee, inviter: current_user)
    authorize @invite
    begin
      ActiveRecord::Base.transaction do
        @invitee.locale ||= current_user&.locale
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
      #AmIDoingThisRight?
      render json: { errors: { base: [{ error: "No invite with token #{params[:token]}" }] } }, status: :unauthorized 
      return
      # raise ActiveRecord::RecordNotFound.new(id: params[:token], model: Invite, primary_key: :token)
    end
    invitee = @invite.invitee
    begin
      ActiveRecord::Base.transaction do
        # TODO update invitee
        invitee.is_invited = false
        if !invitee.save
          raise ClErrors::TransactionError.new(error_key: :unprocessable_invitee)
        end
        @invite.accepted_at = Time.now
        if !@invite.save
          raise ClErrors::TransactionError.new(error_key: :unprocessable_invite)
        end
        SideFxInviteService.new.after_accept(@invite)
        head :accepted
      end
    rescue ClErrors::TransactionError => e
      if e.error_key == :unprocessable_invitee
        render json: { errors: invitee.errors.details }, status: :unprocessable_entity
      elsif e.error_key == :unprocessable_invite
        render json: { errors: invite.errors.details }, status: :unprocessable_entity
      else
        raise e
      end
    end
  end

  def create_params
    # TODO shared constant of user creation attributes, but no email here
    params.require(:invite).permit(
      :email,
      :first_name, :last_name, 
      :password, 
      :avatar, 
      :locale, 
      :gender, 
      :birthyear, 
      :domicile, 
      :education,
      roles: [:type, :project_id],
      bio_multiloc: I18n.available_locales, 
      group_ids: []
    )
  end

  def accept_params
    # TODO shared constant of user creation attributes, but no email here
    params.require(:invite).permit(
      :first_name, :last_name, 
      :password, 
      :avatar, 
      :locale, 
      :gender, 
      :birthyear, 
      :domicile, 
      :education, 
      bio_multiloc: I18n.available_locales,
    )
  end

  def secure_controller?
    # when accepting an invite, the user is still to be logged in;
    # hence, no user is logged in, therefore we do not want to
    # authenticate a user
    false
  end

end
