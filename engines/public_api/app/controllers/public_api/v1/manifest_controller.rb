module PublicApi

  class V1::ManifestController < PublicApiController
    skip_before_action :check_api_token

    def show
      locale = params['locale'] || Tenant.settings('core', 'locales').first
      render json: { 
        short_name: Tenant.settings('core', 'organization_name')[locale],
        icons: [
          {
            src: Tenant.current.favicon.versions[:large].url,
            type: 'image/png',
            sizes: '152x152'
          }
        ],
        start_url: FrontendService.new.manifest_start_url,
        background_color: '#FFFFFF',
        display: 'standalone',
        theme_color: Tenant.settings('core', 'color_main')
      }, status: :ok
    end

  end
end