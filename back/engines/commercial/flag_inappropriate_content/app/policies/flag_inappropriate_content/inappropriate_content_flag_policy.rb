module FlagInappropriateContent
  class InappropriateContentFlagPolicy < ApplicationPolicy

    def show?
      user && ::UserRoleService.new.can_moderate?(record.flaggable, user)
    end

    def mark_as_deleted?
      user && ::UserRoleService.new.can_moderate?(record.flaggable, user)
    end

    def mark_as_flagged?
      user && ::UserRoleService.new.can_moderate?(record.flaggable, user)
    end

  end
end