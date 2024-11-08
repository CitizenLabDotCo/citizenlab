# frozen_string_literal: true

module ImpactTracking
  module WebApi::V1
    class PageviewsController < ::ApplicationController
      skip_before_action :authenticate_user, only: :create
    end

    # POST /sessions/:id/track_pageview
    def create
      return head(:not_found) unless Session.exists?(params[:id])

      pageview = Pageview.create(
        session_id: params[:id],
        path: pageview_params[:path]
      )

      if pageview
        head :created
      else
        head :internal_server_error
      end
    end

    private

    def pageview_params
      params.require(:pageview).permit(:path, :route)
    end
  end
end
