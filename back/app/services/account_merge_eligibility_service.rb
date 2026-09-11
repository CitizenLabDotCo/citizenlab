# frozen_string_literal: true

# Decides whether an email-less SSO account (+source+) may be merged into the
# account owning the email it supplied (+target+). Every rule here is a refusal;
# getting one wrong hands somebody's verified identity, and a session, to another.
#
# Checked at confirm time rather than when the code is requested: refusing up front
# would let anyone probe which addresses belong to admins. Re-run inside the merge
# transaction, because the 24h code window is long enough for the target to gain a
# role or a verification.
class AccountMergeEligibilityService
  # @return [Symbol, nil] why the merge is refused, or nil if allowed. Never expose
  #   the reason to the client: it would turn the endpoint into an account-role oracle.
  def ineligibility_reason(source:, target:)
    source_reason(source) || target_reason(source, target)
  end

  def eligible?(source:, target:)
    ineligibility_reason(source: source, target: target).nil?
  end

  # Safe to answer before the caller has proved anything: it is entirely about their
  # own account, unlike the target-side rules.
  def source_eligible?(source)
    source_reason(source).nil?
  end

  # Whether this account may be absorbed and deleted. Public because
  # AccountMergeService#absorb! applies only this half - see there for why.
  #
  # Also the scope fence: request_code_new_email is shared with the profile's
  # "change my email" flow, and these guards keep the merge out of it.
  def source_reason(source)
    return :source_missing if source.blank?
    return :source_not_sso unless source.sso?
    return :source_has_email if source.email.present?
    return :source_has_password if source.password_digest.present?
    # A pending confirmation means the user is actively claiming this account and is
    # one code away from owning it. Absorbing would discard that silently.
    return :source_has_pending_email if source.new_email.present?
    # The merge deletes the source, which would quietly remove an admin or moderator.
    return :source_has_roles if source.roles.present?
    # A block lives on the user row, so merging would carry the content and
    # verification to a clean account and leave the block behind with the deleted one.
    return :source_blocked if source.blocked?

    nil
  end

  private

  def target_reason(source, target)
    return :target_missing if target.blank?
    return :target_is_source if target.id == source.id
    return :target_is_admin_or_moderator if target.admin? || target.moderator?
    return :target_blocked if target.blocked?

    # The invite flow owns claiming those accounts; merging would strand the invite.
    return :target_is_invitee if target.invite_pending?

    # The shape prevent_user_account_hijacking guards against: registered with a
    # password, never proved they own the address. Merging would hand them the
    # source's verified identity plus a password only they know.
    return :target_unconfirmed_password_account if unconfirmed_password_account?(target)

    verification_conflict(source, target) || identity_conflict(source, target)
  end

  def unconfirmed_password_account?(target)
    target.confirmation_required? && target.email_confirmed_at.nil? && target.password_digest.present?
  end

  # Any active verification the target holds that the source does not is somebody
  # else's assertion of who this account is.
  #
  # Not scoped per method: a target verified one way absorbed by a source verified
  # another would leave the survivor holding two people's verifications, with the
  # target's locked name overwritten. Platforms are expected to run a single method,
  # so this usually reduces to the same-method case.
  def verification_conflict(source, target)
    target_verifications = target.verifications.active.to_a
    return nil if target_verifications.empty?

    source_uids = source.verifications.active.to_set { |verification| [verification.method_name, verification.hashed_uid] }
    conflicting = target_verifications.any? do |theirs|
      source_uids.exclude?([theirs.method_name, theirs.hashed_uid])
    end

    :verification_conflict if conflicting
  end

  # The same clash for login-only SSO methods, which produce an identity but no
  # verification row and so are invisible above.
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
