class WebApi::V1::ManifestController < ApplicationController

  skip_after_action :verify_authorized

  def show
    render json: { 
      short_name: MultilocService.new.t(Tenant.settings('core', 'organization_name')),
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

  private

  def secure_controller?
    false
  end

end
