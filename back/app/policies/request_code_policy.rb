# frozen_string_literal: true

class RequestCodePolicy < ApplicationPolicy
  def request_code_unauthenticated?
    binding.pry
    true
  end

  def request_code_authenticated?
    # user&.active?
  end

  def request_code_email_change?
    # user&.active? && (record.id == user.id)
  end
end