# frozen_string_literal: true

# Decides whether an email-less SSO account (+source+) may be merged into the
# account that owns the email it just supplied (+target+).
#
# The merge moves the source's identity, verification and participation onto the
# target and then deletes the source, so getting this wrong hands one person's
# verified identity - and a session - to another. Every rule here is a refusal.
#
# The caller proves control of the target's inbox by entering a code sent to it,
# which is why these checks run at *confirm* time rather than when the code is
# requested: refusing up front would let anyone probe which addresses belong to
# admins. They are re-run inside the merge transaction because the 24h code
# window is ample time for the target to be granted a role or verified.
class AccountMergeEligibilityService
  # @return [Symbol, nil] the reason the merge must be refused, or nil if allowed.
  #   Never expose the reason to the client - it would turn the endpoint into an
  #   account-role oracle.
  def ineligibility_reason(source:, target:)
    source_reason(source) || target_reason(source, target)
  end

  def eligible?(source:, target:)
    ineligibility_reason(source: source, target: target).nil?
  end

  # The source-side half on its own. Safe to answer before the caller has proved
  # anything, because it is entirely about the caller's own account - unlike the
  # target-side rules, which are only checked once the code has been entered.
  def source_eligible?(source)
    source_reason(source).nil?
  end

  private

  # These also serve as the scope fence. request_code_new_email is shared with the
  # ordinary "change my email" flow in the profile, and these guards are what keep
  # the merge from ever being offered there.
  def source_reason(source)
    return :source_missing if source.blank?
    return :source_not_sso unless source.sso?
    return :source_has_email if source.email.present?
    return :source_has_password if source.password_digest.present?
    # Deleting the source is part of the merge, so an account carrying roles must
    # never be the source: it would quietly remove an admin or moderator. A fresh
    # email-less SSO account never has any.
    return :source_has_roles if source.roles.present?

    nil
  end

  def target_reason(source, target)
    return :target_missing if target.blank?
    return :target_is_source if target.id == source.id
    return :target_is_admin_or_moderator if target.admin? || target.moderator?
    return :target_blocked if target.blocked?

    # The invite flow owns account claiming for invitees, including its own
    # acceptance side effects. Merging into a pending invite would strand it.
    return :target_is_invitee if target.invite_pending?

    # The shape AuthenticationService#prevent_user_account_hijacking guards
    # against: someone registered this address with a password and never proved
    # they own it. Merging would hand them the source's verified identity along
    # with a password only they know.
    return :target_unconfirmed_password_account if unconfirmed_password_account?(target)

    verification_conflict(source, target) || identity_conflict(source, target)
  end

  def unconfirmed_password_account?(target)
    target.confirmation_required? && target.email_confirmed_at.nil? && target.password_digest.present?
  end

  # Two different real people. The target is already verified as someone else
  # under the same method, so the merge would silently replace one verified
  # identity with another.
  def verification_conflict(source, target)
    target_verifications = target.verifications.active.to_a
    return nil if target_verifications.empty?

    conflicting = source.verifications.active.any? do |verification|
      target_verifications.any? do |theirs|
        theirs.method_name == verification.method_name && theirs.hashed_uid != verification.hashed_uid
      end
    end

    :verification_conflict if conflicting
  end

  # The same clash one level down, for login-only SSO methods that produce an
  # identity but no verification row - those are invisible to the check above.
  def identity_conflict(source, target)
    target_identities = target.identities.to_a
    return nil if target_identities.empty?

    conflicting = source.identities.any? do |identity|
      target_identities.any? do |theirs|
        theirs.provider == identity.provider && theirs.uid != identity.uid
      end
    end

    :identity_conflict if conflicting
  end
end
