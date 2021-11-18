module CustomizableNavbar
  module WebApi
    module V1
      module Patches
        module PagesController
          private

          def assign_attributes_for_update
            attributes = permitted_attributes(Page).to_h
            if attributes[:nav_bar_item_attributes].present?
              attributes[:nav_bar_item_attributes][:id] = @page.nav_bar_item_id
            end
            @page.assign_attributes attributes
          end
        end
      end
    end
  end
end
