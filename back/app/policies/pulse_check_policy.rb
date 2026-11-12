# frozen_string_literal: true

class PulseCheckPolicy < ApplicationPolicy
  def show_next?
    PulseCheck::CHECKS.keys.any? { |key| PulseCheck.askable?(key, user) }
  end

  def answer?
    owned? && (record.shown? || record.answered?)
  end

  def dismiss?
    owned? && record.shown?
  end

  private

  def owned?
    user&.active? && record.user_id == user.id
  end
end
