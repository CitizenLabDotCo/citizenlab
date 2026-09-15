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

  # Whether this account may be merged away and deleted. Public because a merge
  # proven by an identity provider applies only this half - see
  # AccountMergeService::PROOFS for why.
  #
  # Also what keeps ordinary email changes out of the merge: request_code_new_email
  # serves the profile's "change my email" page too, where only an email-less
  # account like this one is offered a merge.
  def source_reason(source)
    return :source_missing if source.blank?
    return :source_not_sso unless source.sso?
    return :source_has_email if source.email.present?
    # A pending confirmation means the user is actively claiming this account and is
    # one code away from owning it. Merging would discard that silently.
    return :source_has_pending_email if source.new_email.present?
    # The merge deletes the source, which would quietly remove an admin or moderator.
    return :source_has_roles if source.roles.present?
    # Any invite, not only an admin one: an invite also adds the invitee to groups,
    # which can unlock restricted projects. Merging would pass that access to an
    # account nobody invited, and delete the invite without a trace.
    return :source_is_invitee if source.invite_pending?
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

  # A conflict is an active verification on the target that the source does not also
  # hold, compared by method and uid. A verification says who a real person is, so
  # one the source lacks means the target may be somebody else.
  #
  # - Target has no verifications: no conflict.
  # - Target holds the same method and uid as the source: no conflict, same person.
  # - Source holds verifications the target lacks: no conflict, they move over.
  # - Target holds any other verification: conflict, even under another method.
  #
  # Not scoped per method: a target verified one way merged with a source verified
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

  # The same check for login-only SSO methods, which create an identity but no
  # verification, so the rule above cannot see them.
  #
  # A conflict is a source identity and a target identity from the same provider with
  # different uids: the provider says they are two different people. Merging would
  # let both of them sign in to the survivor.
  #
  # Identities from different providers never conflict. Their uids cannot be
  # compared, and one account signing in through several providers is normal.
  # Unlike a verification, an identity is only a way to sign in, not a claim about
  # who the person is, so the stricter cross-method rule above does not apply.
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
