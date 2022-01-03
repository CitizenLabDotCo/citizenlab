module Onboarding
  module WebApi
    module V1
      class WebApi::V1::CampaignDismissalsController < OnboardingController
        skip_before_action :authenticate_user

        def create
          authorize current_user, :update?
          campaign_name = params[:campaign_id]
          dismissal = CampaignDismissal.new(campaign_name: campaign_name, user: current_user)
          if dismissal.save
            head 200
          else
            render json: {errors: dismissal.errors.details}, status: :unprocessable_entity
          end
        end
      end
    end
  end
end
