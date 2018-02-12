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

    @user = User.new accept_params
    @user.email = @invite.email
    @user.locale ||= @invite.inviter&.locale
    ActiveRecord::Base.transaction do
      if @user.save
        @membership = Membership.new(user: @user, group_id: @invite.group_id)
        if @membership.save
          SideFxUserService.new.after_create(@user, current_user)
          SideFxInviteService.new.after_accept(@invite, @user)
          @invite.destroy!
          render json: @membership, include: ['user'], status: :created
        else
          render json: { errors: @membership.errors.details }, status: :unprocessable_entity
        end
      else
        render json: { errors: @user.errors.details }, status: :unprocessable_entity
      end
    end
  end

  def accept_params
    # TODO shared constant of user creation attributes, but no email here
    params.require(:invite).permit(
      [:first_name, :last_name, :password, :avatar, :locale, :gender, :birthyear, :domicile, :education, bio_multiloc: I18n.available_locales]
    )
  end

end
