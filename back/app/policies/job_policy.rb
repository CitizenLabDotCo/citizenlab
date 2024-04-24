# frozen_string_literal: true

class JobPolicy < ApplicationPolicy
  def show?
    admin_or_moderator?
  end

  def index?
    admin_or_moderator?
  end
end
