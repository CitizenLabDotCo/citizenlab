# frozen_string_literal: true

class WebApi::V1::EmailBansController < ApplicationController
  def count
    authorize(:email_ban)
    render json: raw_json({ count: EmailBan.count })
  end

  # GET /email_bans/:email
  def show
    authorize(:email_ban)
    ban = EmailBan.find_for(params[:email])
    return head :not_found unless ban

    render json: WebApi::V1::EmailBanSerializer
      .new(ban, params: jsonapi_serializer_params)
      .serializable_hash
  end

  # DELETE /email_bans/:email
  def destroy
    authorize(:email_ban)
    ban = EmailBan.find_for(params[:email])
    return head :not_found unless ban

    ban.destroy!
    head :ok
  end
end
