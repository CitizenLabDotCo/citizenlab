# frozen_string_literal: true

class CosponsorsInitiativePolicy < ApplicationPolicy
  def accept_invite?
    active? && cosponsor?
  end

  private

  def cosponsor?
    user && record.user_id == user.id
  end
end
