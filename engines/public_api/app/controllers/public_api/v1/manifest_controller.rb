module PublicApi

  class V1::ManifestController < PublicApiController
    skip_before_action :check_api_token

    def show
      render json: { 
        test: 'prrt'
      }, status: :ok
    end

  end
end