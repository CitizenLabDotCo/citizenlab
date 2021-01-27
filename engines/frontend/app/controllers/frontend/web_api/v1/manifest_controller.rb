module Frontend
  module WebApi
    module V1
      class ManifestController < FrontendController

        skip_after_action :verify_authorized

        def show
          configuration = AppConfiguration.instance
          render json: {
            short_name: MultilocService.new.t(configuration.settings('core', 'organization_name')),
            icons: [
              {
                src: configuration.favicon.versions[:large].url,
                type: 'image/png',
                sizes: '152x152'
              }
            ],
            start_url: Frontend::UrlService.new.manifest_start_url,
            background_color: '#FFFFFF',
            display: 'standalone',
            theme_color: configuration.settings('core', 'color_main')
          }, status: :ok
        end

        private

        def secure_controller?
          false
        end

      end
    end
  end
end
