# frozen_string_literal: true

class InitiativeReactionPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      if user&.admin?
        scope.all
      elsif user
        scope.where(user: user)
      else
        scope.none
      end
    end
  end

  def create?
    return if !user&.active? || !owner?

    reason = reacting_denied_reason user
    reason ? raise_not_authorized(reason) : true
  end

  def destroy?
    return if !user&.active?

    reason = reacting_denied_reason user
    raise_not_authorized(reason) if reason

    # TO DO:
    # Wrap elsif in conditional: Is verification required to react?
    # Should this be a patch from verification module?
    if owner?
      return true
    elsif record.user_id.nil?
      user_verifications_hashed_uids = user.verifications_hashed_uids
      reaction_verifications_hashed_uids =
        record.verification_reactions_verifications_hashed_uids.pluck(:verification_hashed_uid)
      return true if reaction_verifications_hashed_uids&.any? { |uid| user_verifications_hashed_uids.include?(uid) }
    end

    false
  end

  def up?
    create?
  end

  def down?
    raise_not_authorized('dislikes_not_supported')
  end

  def show?
    active? && (owner? || admin?)
  end

  private

  def reacting_denied_reason(user)
    :not_signed_in unless user
  end
end

InitiativeReactionPolicy.prepend(GranularPermissions::Patches::InitiativeReactionPolicy)
