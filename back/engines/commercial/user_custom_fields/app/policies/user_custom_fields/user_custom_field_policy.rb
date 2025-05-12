# frozen_string_literal: true

module UserCustomFields
  class UserCustomFieldPolicy < CustomFieldPolicy
    def create?
      user&.active? && user.admin? && !record.code
    end

    def update?
      user&.active? && user.admin?
    end

    def reorder?
      update?
    end

    def show?
      true
    end

    def destroy?
      user&.active? && user.admin? && !record.code
    end

    def permitted_attributes_for_create
      [
        :key,
        :input_type,
        :required,
        :enabled,
        { title_multiloc: CL2_SUPPORTED_LOCALES,
          description_multiloc: CL2_SUPPORTED_LOCALES }
      ]
    end

    def permitted_attributes_for_update
      if record.code
        %i[
          required
          enabled
        ]
      else
        [
          :required,
          :enabled,
          { title_multiloc: CL2_SUPPORTED_LOCALES,
            description_multiloc: CL2_SUPPORTED_LOCALES }
        ]
      end
    end

    def permitted_attributes_for_reorder
      [:ordering]
    end
  end
end
