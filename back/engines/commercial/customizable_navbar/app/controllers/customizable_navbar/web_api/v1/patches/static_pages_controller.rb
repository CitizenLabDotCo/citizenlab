module CustomizableNavbar
  module WebApi
    module V1
      module Patches
        module StaticPagesController
          private

          def assign_attributes_for_update
            attributes = permitted_attributes(StaticPage).to_h
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
