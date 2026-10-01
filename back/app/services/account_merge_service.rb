# frozen_string_literal: true

# Merges an email-less SSO account (+source+) into the account owning the email it
# supplied (+target+), then deletes the source.
#
# Not built on UserReduceService: that blacklists the very tables this has to move,
# interpolates ids into raw SQL, and has no test coverage.
class AccountMergeService
  class IneligibleError < StandardError; end
  class IncompleteMergeError < StandardError; end

  # Everything the source can own that must end up on the target.
  #
  # +dedup_by+ columns are mostly backed by a unique index, so a missing dedup aborts
  # the merge rather than duplicating. +dedup_where+ narrows which of the target's
  # rows count as already held. +dupes+ is :destroy where a counter_culture counter
  # hangs off the row, :delete where nothing observes it.
  #
  # assert_source_emptied! derives from this same list, so a surface added here cannot
  # be silently left behind.
  MOVES = [
    # Auth. Eligibility already refuses a target holding a *different* identity or
    # verification, so an exact match here is the same person twice - drop it.
    { model: 'Identity', fk: :user_id, dedup_by: %i[provider uid], dupes: :delete },
    # dedup_where keeps a revoked verification on the target from swallowing the
    # source's active one and leaving the survivor unverified.
    { model: 'Verification::Verification', fk: :user_id, dedup_by: %i[method_name hashed_uid], dupes: :delete, dedup_where: { active: true } },

    # Participation.
    { model: 'Idea', fk: :author_id, rehash: true },
    { model: 'Comment', fk: :author_id, rehash: true },
    # The DB index is not scoped by mode, even though Reaction's validation is. Dedup
    # on mode and a user who liked what the other disliked breaks the merge.
    { model: 'Reaction', fk: :user_id, dedup_by: %i[reactable_type reactable_id], dupes: :destroy },
    { model: 'Basket', fk: :user_id, dedup_by: %i[phase_id], dupes: :destroy },
    { model: 'Polls::Response', fk: :user_id, dedup_by: %i[phase_id], dupes: :destroy },
    { model: 'Volunteering::Volunteer', fk: :user_id, dedup_by: %i[cause_id], dupes: :destroy },
    { model: 'Events::Attendance', fk: :attendee_id, dedup_by: %i[event_id], dupes: :destroy },
    { model: 'Cosponsorship', fk: :user_id, dedup_by: %i[idea_id], dupes: :destroy },
    { model: 'Follower', fk: :user_id, dedup_by: %i[followable_type followable_id], dupes: :destroy },
    { model: 'IdeaExposure', fk: :user_id, dedup_by: %i[idea_id phase_id], dupes: :delete },
    # No association on User and no foreign key, so these dangle unless moved here.
    { model: 'Surveys::Response', fk: :user_id },

    { model: 'SpamReport', fk: :user_id },
    { model: 'Files::File', fk: :uploader_id },

    # Preferences and bookkeeping. The target's own preference always wins.
    { model: 'Membership', fk: :user_id, dedup_by: %i[group_id], dupes: :destroy },
    { model: 'EmailCampaigns::Consent', fk: :user_id, dedup_by: %i[campaign_type], dupes: :delete },
    { model: 'Onboarding::CampaignDismissal', fk: :user_id, dedup_by: %i[campaign_name], dupes: :delete },
    { model: 'ClaimToken', fk: :pending_claimer_id },
    # Keeps the SSO sign-in and verification audit trail attached to the survivor.
    { model: 'Activity', fk: :user_id }
  ].freeze

  # What proved the two accounts belong to one person, which decides the rules.
  #
  # :email_code - the source entered a code sent to its merge_target_email, which the
  #   target owns. Reading an inbox is all it takes, so the full target rules apply,
  #   and the target's email counts as confirmed.
  # :identity_provider - a provider returned the same verification uid for both.
  #   Only the source rules apply: the target is the account being signed in to, so
  #   refusing an admin would only break re-verification.
  PROOFS = %i[email_code identity_provider].freeze

  def initialize
    @eligibility_service = AccountMergeEligibilityService.new
    @verification_service = Verification::VerificationService.new
  end

  # Moves everything +source+ owns onto +target+, then deletes +source+. Its pending
  # merge confirmation goes with it.
  #
  # @param proof [Symbol] one of PROOFS.
  # @return [User] +target+, the account the caller should be signed in as.
  # @raise [ArgumentError] for an unknown +proof+.
  # @raise [IneligibleError] if the two accounts may not be merged.
  # @raise [IncompleteMergeError] if anything would have been left on the source.
  def merge!(source:, target:, proof:)
    raise ArgumentError, "unknown proof: #{proof.inspect}" unless PROOFS.include?(proof)

    email_code = proof == :email_code

    moved = ActiveRecord::Base.transaction do
      lock_in_id_order!(source, target)

      reason = ineligibility_reason(source, target, proof)
      raise IneligibleError, reason.to_s if reason

      # Before the move: afterwards there is no telling whose lock is whose.
      target_locks = locks_held_by(target)

      moved_counts = move_all!(source, target)

      # The caller read a code sent to this address, so it is proven. Otherwise the
      # survivor would be asked to confirm the address that authorised the merge.
      confirm_target_email!(target) if email_code

      apply_verified_identity!(source, target, target_locks)
      recompute_counters!(target)

      # A new way to authenticate is a credential change, so other sessions should not
      # survive it. A provider-proven merge gives nobody new access, and expiring would
      # cut off the request in flight.
      target.expire_token! if email_code

      assert_source_emptied!(source)
      source.destroy!

      moved_counts
    end

    run_side_effects!(target, source, moved)
    target
  end

  private

  def ineligibility_reason(source, target, proof)
    if proof == :identity_provider
      return :target_is_source if target.id == source.id

      return @eligibility_service.source_reason(source)
    end

    # The caller looked the target up by this address before the lock, and the owner
    # may have changed it since. The code proves nothing about the new address.
    return :target_email_changed unless target.email.to_s.casecmp?(source.merge_target_email.to_s)

    @eligibility_service.ineligibility_reason(source: source, target: target)
  end

  # Deterministic ordering, or two merges into the same target deadlock each other.
  # lock! reloads as it locks, so the rules that follow see the rows as they are now
  # rather than as they were when these records were first loaded.
  def lock_in_id_order!(source, target)
    [source, target].sort_by(&:id).each(&:lock!)
  end

  def move_all!(source, target)
    MOVES.each_with_object({}) do |move, moved|
      model = resolve_model(move[:model])
      next unless model

      count = if move[:rehash]
        move_and_rehash!(model, move[:fk], source, target)
      else
        move_rows!(model, move, source, target)
      end
      moved[move[:model]] = count if count.positive?
    end
  end

  # The engines above all ship by default, but a model that isn't loaded must not take
  # the merge down with it.
  def resolve_model(name)
    name.safe_constantize
  end

  def move_rows!(model, move, source, target)
    fk = move[:fk]
    scope = model.where(fk => source.id)
    return 0 if scope.empty?

    if move[:dedup_by].present?
      duplicate_ids = duplicate_ids_for(model, move, source, target)
      if duplicate_ids.any?
        discard_duplicates!(model, duplicate_ids, move[:dupes])
        scope = scope.where.not(id: duplicate_ids)
      end
    end

    scope.update_all(assignment_for(model, fk, target))
  end

  def duplicate_ids_for(model, move, source, target)
    columns = move[:dedup_by]
    held = model.where(move[:fk] => target.id)
    held = held.where(move[:dedup_where]) if move[:dedup_where]
    existing = held.pluck(*columns).to_set { |key| columns.one? ? [key] : key }

    model.where(move[:fk] => source.id).pluck(:id, *columns).filter_map do |row|
      id, *key = row
      id if existing.include?(key)
    end
  end

  # :destroy where a counter or dependent association observes the row, else :delete.
  def discard_duplicates!(model, ids, strategy)
    scope = model.where(id: ids)

    if strategy == :destroy && model == Basket
      # destroy_or_keep! orphans submitted baskets to user_id: nil instead of
      # removing them, and basket counts are raw SQL, not counter_culture.
      phases = Phase.where(id: scope.distinct.pluck(:phase_id)).to_a
      scope.each(&:destroy!)
      phases.each { |phase| Basket.update_counts(phase) }
    elsif strategy == :destroy
      scope.destroy_all
    else
      scope.delete_all
    end
  end

  # set_author_hash only fires on author_id_changed?, so update_all would leave the
  # hash pointing at the deleted account. update_columns, not update!: an old record
  # need not still pass today's validations and a merge must not fail on one.
  def move_and_rehash!(model, fk, source, target)
    records = model.where(fk => source.id).to_a
    now = Time.zone.now

    records.each do |record|
      record.update_columns(
        fk => target.id,
        author_hash: model.create_author_hash(target.id, record.try(:project_id), false),
        updated_at: now
      )
    end

    records.size
  end

  def assignment_for(model, fk, target)
    assignment = { fk => target.id }
    assignment[:updated_at] = Time.zone.now if model.column_names.include?('updated_at')
    assignment
  end

  # Left to apply_verified_identity! to save, along with everything else it sets.
  def confirm_target_email!(target)
    return if target.email_confirmed_at.present?

    target.email_confirmed_at = Time.zone.now
    target.confirmation_required = false
  end

  # What +user+'s own verifications lock right now.
  def locks_held_by(user)
    {
      attributes: @verification_service.locked_attributes(user),
      custom_fields: @verification_service.locked_custom_fields(user).map(&:to_s)
    }
  end

  # users.verified is written by SideFxVerificationService#after_create, so moving the
  # rows does not flip it.
  #
  # Profile precedence, strongest first: what the target's own verification locks (its
  # provider asserted that); what the source's locks; what the target already had; the
  # source's remaining answers, filling gaps only.
  def apply_verified_identity!(source, target, target_locks)
    target.verified = true if target.verifications.active.exists?

    fillable = @verification_service.locked_attributes(target) - target_locks[:attributes]
    fillable.each do |attribute|
      value = source.public_send(attribute)
      target.public_send(:"#{attribute}=", value) if value.present?
    end

    locked_keys = @verification_service.locked_custom_fields(target).map(&:to_s) - target_locks[:custom_fields]

    transition_service = CustomFieldValuesTransitionService.new
    source_values = transition_service.custom_field_values(source)
    merged = source_values
      .merge(transition_service.custom_field_values(target))
      .merge(source_values.slice(*locked_keys))

    transition_service.assign(target, merged)
    target.save!
  end

  def recompute_counters!(target)
    # Follower is the only counter_culture counter stored on the user row, and
    # update_all bypasses it.
    target.update_columns(followings_count: Follower.where(user_id: target.id).count)
  end

  # source.destroy! silently nullifies ideas/comments/reactions and destroys
  # follows/baskets/attendances/cosponsorships, with no foreign key to raise on a
  # missed surface. Refusing to delete is all that stands between one and data loss.
  def assert_source_emptied!(source)
    leftovers = MOVES.filter_map do |move|
      model = resolve_model(move[:model])
      next unless model

      count = model.where(move[:fk] => source.id).count
      "#{move[:model]}=#{count}" if count.positive?
    end

    return if leftovers.empty?

    raise IncompleteMergeError, "source #{source.id} still owns: #{leftovers.join(', ')}"
  end

  def run_side_effects!(target, frozen_source, moved)
    SideFxUserService.new.after_update(target, target)
    SideFxUserService.new.after_destroy(frozen_source, nil)

    LogActivityJob.perform_later(
      target,
      'merged_account',
      target,
      Time.now.to_i,
      payload: { source_user_id: frozen_source.id, moved: moved }
    )
  end
end
