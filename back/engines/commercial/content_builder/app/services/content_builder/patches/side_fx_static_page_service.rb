# frozen_string_literal: true

module ContentBuilder
  module Patches
    module SideFxStaticPageService
      def after_create(page, current_user)
        super
        # Temporary gate: nothing reads a layout while the feature is off, so write none.
        return unless AppConfiguration.instance.feature_activated?('custom_page_builder')

        ContentBuilder::LayoutProvisioningService.new.ensure_custom_page!(page)
      end
    end
  end
end
