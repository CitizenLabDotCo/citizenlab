module FlagInappropriateContent
  class InappropriateContentFlagPolicy < ApplicationPolicy

    def show?
      user&.admin?
    end

    def mark_as_deleted?
      user&.admin?
    end

    def mark_as_flagged?
      user&.admin?
    end

  end
end