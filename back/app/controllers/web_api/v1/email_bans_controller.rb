# frozen_string_literal: true

class WebApi::V1::EmailBansController < ApplicationController
  def count
    authorize :email_ban
    render json: raw_json({ count: EmailBan.distinct.count(:email_hash) })
  end

  # GET /email_bans/:email
  def show
    authorize :email_ban
    ban = EmailBan.find_for(params[:email])
    if ban
      render json: raw_json({
        id: ban.id,
        reason: ban.reason,
        created_at: ban.created_at,
        banned_by_id: ban.banned_by_id
      })
    else
      head :not_found
    end
  end

  # DELETE /email_bans/:email
  def destroy
    authorize :email_ban
    ban = EmailBan.find_for(params[:email])
    if ban
      ban.destroy!
      head :ok
    else
      head :not_found
    end
  end
end
