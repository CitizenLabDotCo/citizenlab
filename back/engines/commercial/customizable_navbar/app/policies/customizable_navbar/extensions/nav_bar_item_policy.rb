module CustomizableNavbar
  module Extensions
    module NavBarItemPolicy
      def create?
        user&.active? && user&.admin?
      end

      def update?
        user&.active? && user&.admin?
      end

      def reorder?
        update?
      end

      def destroy?
        update?
      end

      def permitted_attributes_for_create
        [:code, :static_page_id, { title_multiloc: CL2_SUPPORTED_LOCALES }] # TODO: Only allow static_page_id if custom?
      end

      def permitted_attributes_for_update
        attributes = [title_multiloc: CL2_SUPPORTED_LOCALES]
        attributes += %i[static_page_id] if record.custom?
        attributes
      end

      def permitted_attributes_for_reorder
        %i[ordering]
      end
    end
  end
end
