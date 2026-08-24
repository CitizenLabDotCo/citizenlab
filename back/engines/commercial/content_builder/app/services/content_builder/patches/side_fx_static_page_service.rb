# frozen_string_literal: true

module ContentBuilder
  module Patches
    module SideFxStaticPageService
      def after_create(page, current_user)
        super
        ContentBuilder::DescriptionLayoutService.new.ensure_custom_page!(page)
      end
    end
  end
end
