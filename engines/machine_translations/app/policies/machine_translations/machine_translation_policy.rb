module MachineTranslations
  class MachineTranslationPolicy < ApplicationPolicy

    def show?
      "#{record.translatable_type}Policy".constantize.new(user, record.translatable).show?
    end

  end
end