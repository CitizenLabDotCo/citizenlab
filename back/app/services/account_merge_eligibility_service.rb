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

  # Two different real people. Any active verification the target holds that the
  # source does not hold too is somebody else's assertion of who this account is,
  # so the merge is refused.
  #
  # Deliberately not scoped to the source's own methods. A platform can run more
  # than one (MitID and NemLog-in, the two Vienna methods), and a per-method
  # comparison would wave through a target verified as Alice via one method being
  # absorbed by a source verified as Bob via another: the survivor would carry two
  # people's verifications, and apply_verified_identity! overwrites the union of
  # every method's locked attributes with the source's, so Alice's asserted name
  # would be replaced by Bob's while her verification row still claimed her.
  #
  # The cost is refusing a genuine same-person merge where the two accounts were
  # verified different ways. That falls back to the existing "sign out and log in
  # with this email" route, which is the safe direction to fail in.
  def verification_conflict(source, target)
    target_verifications = target.verifications.active.to_a
    return nil if target_verifications.empty?

    source_uids = source.verifications.active.to_set { |verification| [verification.method_name, verification.hashed_uid] }
    conflicting = target_verifications.any? do |theirs|
      source_uids.exclude?([theirs.method_name, theirs.hashed_uid])
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
