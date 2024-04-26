# frozen_string_literal: true

class JobPolicy < ApplicationPolicy
  def index?
    admin_or_moderator?
  end
end
