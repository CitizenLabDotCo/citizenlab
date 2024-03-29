# frozen_string_literal: true

module AdminApi
  class InvitesController < AdminApiController
    def create
      invitees = Invites::Service.new.bulk_create([invite_params])
      render json: invitees.first&.invitee_invite, status: :created
    rescue Invites::FailedError => e
      render json: { errors: e.to_h }, status: :unprocessable_entity
    end

    private

    def invite_params
      params.require(:invite).permit(
        :email,
        :first_name,
        :last_name,
        :locale,
        :invite_text,
        :send_invite_email,
        roles: %i[type project_id],
        group_ids: []
      )
    end
  end
end
