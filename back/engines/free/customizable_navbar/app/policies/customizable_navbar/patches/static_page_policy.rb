# frozen_string_literal: true

module CustomizableNavbar
  module Patches
    module StaticPagePolicy
      def permitted_attributes
        super.tap do |attributes|
          attributes.push nav_bar_item_title_multiloc: CL2_SUPPORTED_LOCALES
        end
      end
    end
  end
end
