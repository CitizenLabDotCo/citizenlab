# frozen_string_literal: true

module CustomStyle
  module WebApi::V1
    module Patches
      module AppConfigurationsController
        def config_params
          @config_params ||= super.merge(params.require(:app_configuration).permit(style:{}))
        end
      end
    end
  end
end

WebApi::V1::AppConfigurationsController.prepend(CustomStyle::WebApi::V1::Patches::AppConfigurationsController)
