# frozen_string_literal: true

class WebApi::V1::InvitesController < ApplicationController
  # when accepting an invite, the user is still to be logged in;
  # hence, no user is logged in, therefore we do not want to
  # authenticate a user
  skip_before_action :authenticate_user

  UNAUTHORIZED_ACCEPT_REASONS = {
    token_not_found: 'token_not_found',
    already_accepted: 'already_accepted'
  }

  skip_after_action :verify_authorized, only: %i[accept resend]

  def index
    @invites = policy_scope(Invite)
      .left_outer_joins(:invitee)

    if params[:search].present?
      @invites = @invites.search_by_all(params[:search])
      # Started happening when moved from rails 5.1 -> 5.2
      # https://api.rubyonrails.org/classes/ActiveRecord/Associations/ClassMethods.html#module-ActiveRecord::Associations::ClassMethods-label-Table+Aliasing
      @invites = @invites.where(invitees_invites: { invite_status: params[:invite_status] }) if params[:invite_status].present?
    elsif params[:invite_status].present?
      @invites = @invites.where(users: { invite_status: params[:invite_status] })
    end

    if params[:sort].present? && params[:search].blank?
      @invites = case params[:sort]
      when 'created_at'
        @invites.order(created_at: :asc)
      when '-created_at'
        @invites.order(created_at: :desc)
      when 'last_name'
        @invites.order('users.last_name asc')
      when '-last_name'
        @invites.order('users.last_name desc')
      when 'email'
        @invites.order('users.email asc')
      when '-email'
        @invites.order('users.email desc')
      when 'invite_status'
        @invites.order('users.invite_status asc')
      when '-invite_status'
        @invites.order('users.invite_status desc')
      when nil
        @invites
      else
        raise 'Unsupported sort method'
      end
    end

    @invites = paginate @invites
    render json: linked_json(@invites, WebApi::V1::InviteSerializer, params: jsonapi_serializer_params, include: [:invitee])
  end

  def index_xlsx
    authorize :invite

    I18n.with_locale(current_user&.locale) do
      @invites = policy_scope(Invite).includes(invitee: [:manual_groups])
      xlsx = XlsxService.new.generate_invites_xlsx @invites, view_private_attributes: policy(User).view_private_attributes?
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'invites.xlsx'
    end
  end

  def example_xlsx
    authorize :invite
    xlsx = Invites::Service.new.generate_example_xlsx
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'invites.xlsx'
  end

  def accept
    @invite = Invite.find_by(token: params[:token])
    unless @invite
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
        invitee = UserService.assign_params_in_accept_invite(invitee, accept_params)
        SideFxInviteService.new.before_accept @invite
        unless invitee.save(context: :form_submission)
          raise ClErrors::TransactionError.new(error_key: :unprocessable_invitee)
        end
        unless @invite.save
          raise ClErrors::TransactionError.new(error_key: :unprocessable_invite)
        end

        claim_tokens = params.dig(:invite, :claim_tokens)
        SideFxInviteService.new.after_accept(@invite, claim_tokens:)

        render json: WebApi::V1::InviteSerializer.new(
          @invite.reload,
          params: jsonapi_serializer_params,
          include: [:invitee]
        ).serializable_hash, status: :ok
      end
    rescue ClErrors::TransactionError => e
      case e.error_key
      when :unprocessable_invitee
        render json: { errors: invitee.errors.details }, status: :unprocessable_entity
      when :unprocessable_invite
        render json: { errors: @invite.errors.details }, status: :unprocessable_entity
      else
        raise e
      end
    end
  end

  def destroy
    @invite = Invite.find(params[:id])
    authorize @invite
    @invite.destroy
    if @invite.destroyed?
      SideFxInviteService.new.after_destroy(@invite, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  def resend
    user = User.find_by_cimail(accept_params[:email])

    unless user&.invite_status == 'pending'
      render json: { errors: { base: [{ error: 'no_pending_invite' }] } }, status: :unprocessable_entity
      return
    end

    invite = user&.invitee_invite

    LogActivityJob.perform_later(invite, 'resent', current_user, nil)

    head :ok
  end

  private

  def accept_params
    params.require(:invite).permit(
      :email,
      :first_name,
      :last_name,
      :password,
      :locale
    )
  end

  def bulk_create_params
    params.require(:invites).permit(
      :locale,
      :invite_text,
      group_ids: [],
      roles: %i[type project_id],
      emails: []
    )
  end

  def bulk_create_xlsx_params
    params.require(:invites).permit(
      :xlsx,
      :locale,
      :invite_text,
      group_ids: [],
      roles: %i[type project_id]
    )
  end
end
