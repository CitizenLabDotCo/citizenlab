# frozen_string_literal: true

module CustomizableNavbar
  module WebApi
    module V1
      module Patches
        module StaticPagesController
          private

          # See also back/app/serializers/web_api/v1/static_page_serializer.rb
          # `attribute :nav_bar_item_title_multiloc`
          def assign_attributes
            attributes = permitted_attributes(StaticPage).to_h
            nav_bar_item_title = attributes.delete(:nav_bar_item_title_multiloc)
            if nav_bar_item_title.present? && @page.nav_bar_item_id.present?
              attributes[:nav_bar_item_attributes] ||= {}
              attributes[:nav_bar_item_attributes][:id] = @page.nav_bar_item_id
              attributes[:nav_bar_item_attributes][:title_multiloc] = nav_bar_item_title
            end
            @page.assign_attributes attributes
          end
        end
      end
    end
  end
end
