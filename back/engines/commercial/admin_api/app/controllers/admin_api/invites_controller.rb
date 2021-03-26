module AdminApi
  class InvitesController < AdminApiController

    def create
      invites = InvitesService.new.bulk_create([invite_params])
      render json: invites.first, status: :created
    rescue InvitesService::InvitesFailedError => e
      render json: {errors: e.to_h}, status: :unprocessable_entity
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
        roles: [:type, :project_id],
        group_ids: []
      )
    end
  end
end