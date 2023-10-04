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
    # Improve
    # Wrap elsif in conditional: Is verification required to react?
    # Should this be a patch from verification module?
    if record.user_id == user.id
      true
    elsif record.user_id.nil?
      user_verifications_hashed_uids = user.verifications_hashed_uids
      return false unless user_verifications_hashed_uids&.any?

      reaction_verifications_hashed_uids =
        Verification::ReactionsVerificationsHashedUid.where(reaction: record).pluck(:verification_hashed_uid)
      return false unless reaction_verifications_hashed_uids&.any?

      return true if reaction_verifications_hashed_uids.any? { |uid| user_verifications_hashed_uids.include?(uid) }

      false
    else
      false
    end
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
