# frozen_string_literal: true

class BackgroundJobPolicy < ApplicationPolicy
  def index?
    admin_or_moderator?
  end
end
