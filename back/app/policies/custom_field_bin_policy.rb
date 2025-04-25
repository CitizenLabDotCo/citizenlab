# frozen_string_literal: true

class CustomFieldBinPolicy < ApplicationPolicy
  # We don't implement a scope for this policy, because bins are only every
  # accessed through their parent custom_field. The scope depends on type of
  # custom field this bin belongs to.

  def show?
    user&.active? && (user.admin? || user.project_or_folder_moderator?) && policy_for(record.custom_field).show?
  end
end
