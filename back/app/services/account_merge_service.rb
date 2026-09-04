# frozen_string_literal: true

# Merges an email-less SSO account (+source+) into the account that owns the email
# it supplied (+target+), then deletes the source.
#
# Reached only from the merge-account confirmation flow, i.e. after the caller has
# entered a code sent to the target's inbox. See AccountMergeEligibilityService for
# who may be merged into, and MergeAccountConfirmation for how the request is held.
#
# Not built on UserReduceService: that one blacklists exactly the tables this has to
# move (identities, verifications, followers, memberships), interpolates ids into raw
# SQL, and has no test coverage.
class AccountMergeService
  class IneligibleError < StandardError; end
  class IncompleteMergeError < StandardError; end

  # Everything the source can own that must end up on the target.
  #
  # +dedup_by+ names the columns that must stay unique per user - almost all of them
  # are backed by a unique index, so skipping the dedup doesn't produce a duplicate,
  # it aborts the merge. +dupes+ is :destroy where a counter_culture counter hangs off
  # the row and :delete where nothing observes it.
  #
  # The emptiness assertion is derived from this same list, so a surface added here is
  # automatically one the merge refuses to silently leave behind.
  MOVES = [
    # Auth. These are the point of the whole exercise. Eligibility already refuses a
    # target holding a *different* identity or verification for the same provider or
    # method; an exactly matching one is the same person twice, so it is dropped
    # rather than duplicated.
    { model: 'Identity', fk: :user_id, dedup_by: %i[provider uid], dupes: :delete },
    { model: 'Verification::Verification', fk: :user_id, dedup_by: %i[method_name hashed_uid], dupes: :delete },

    # Participation.
    { model: 'Idea', fk: :author_id, rehash: true },
    { model: 'Comment', fk: :author_id, rehash: true },
    # The DB index on reactions is (reactable_type, reactable_id, user_id) - it is NOT
    # scoped by mode, even though Reaction's own validation is. Dedup on mode and a
    # user who liked what the other disliked breaks the merge.
    { model: 'Reaction', fk: :user_id, dedup_by: %i[reactable_type reactable_id], dupes: :destroy },
    { model: 'Basket', fk: :user_id, dedup_by: %i[phase_id], dupes: :destroy },
    { model: 'Polls::Response', fk: :user_id, dedup_by: %i[phase_id], dupes: :destroy },
    { model: 'Volunteering::Volunteer', fk: :user_id, dedup_by: %i[cause_id], dupes: :destroy },
    { model: 'Events::Attendance', fk: :attendee_id, dedup_by: %i[event_id], dupes: :destroy },
    { model: 'Cosponsorship', fk: :user_id, dedup_by: %i[idea_id], dupes: :destroy },
    { model: 'Follower', fk: :user_id, dedup_by: %i[followable_type followable_id], dupes: :destroy },
    { model: 'IdeaExposure', fk: :user_id, dedup_by: %i[idea_id phase_id], dupes: :delete },
    # No association on User, no foreign key: these rows outlive source.destroy!
    # pointing at an id that no longer exists unless they are moved here.
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

  def initialize
    @eligibility_service = AccountMergeEligibilityService.new
    @verification_service = Verification::VerificationService.new
  end

  # @return [User] the surviving account the caller should be signed in as.
  # @raise [IneligibleError] if the target may not be merged into.
  # @raise [IncompleteMergeError] if anything would have been left on the source.
  def merge!(source:, confirmation:)
    target_email = confirmation.target_email
    frozen_source = nil
    moved = {}

    target = ActiveRecord::Base.transaction do
      target = User.find_by_cimail(target_email)

      # Nobody owns the address any more (the target deleted their account, or
      # changed it while the code was outstanding). Nothing to merge into, so fall
      # back to what the ordinary new-email flow would have done all along.
      next promote_email_onto_source!(source, target_email, confirmation) if target.nil?

      lock_in_id_order!(source, target)

      reason = @eligibility_service.ineligibility_reason(source: source, target: target)
      raise IneligibleError, reason.to_s if reason

      moved = move_all!(source, target)
      apply_verified_identity!(source, target)
      recompute_counters!(target)

      # The target has just gained an entirely new way to authenticate. That is a
      # credential change, so existing sessions elsewhere should not survive it.
      target.expire_token!

      assert_source_emptied!(source)
      confirmation.destroy!

      source.destroy!
      frozen_source = source

      target
    end

    return target if frozen_source.nil? # degraded path: no merge happened

    run_side_effects!(target, frozen_source, moved)
    target
  end

  private

  # Deterministic ordering, or two merges into the same target deadlock each other.
  def lock_in_id_order!(source, target)
    User.lock.where(id: [source.id, target.id]).order(:id).to_a
  end

  def promote_email_onto_source!(source, target_email, confirmation)
    source.update!(
      email: target_email,
      email_confirmed_at: Time.zone.now,
      confirmation_required: false
    )
    confirmation.destroy!
    source
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

  # Engine models. All the engines referenced above ship by default, but a model that
  # genuinely isn't loaded must not take the whole merge down with it.
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
    existing = model.where(move[:fk] => target.id).pluck(*columns)
    existing = existing.to_set { |key| columns.one? ? [key] : key }

    model.where(move[:fk] => source.id).pluck(:id, *columns).filter_map do |row|
      id, *key = row
      id if existing.include?(key)
    end
  end

  # :destroy where a counter_culture counter (or a dependent association) hangs off the
  # row, :delete where nothing observes it and the callbacks are pure overhead.
  def discard_duplicates!(model, ids, strategy)
    scope = model.where(id: ids)

    if strategy == :destroy && model == Basket
      # Basket's own destroy path orphans submitted baskets to user_id: nil rather
      # than removing them, and its counts are raw SQL rather than counter_culture.
      phases = Phase.where(id: scope.distinct.pluck(:phase_id)).to_a
      scope.each(&:destroy!)
      phases.each { |phase| Basket.update_counts(phase) }
    elsif strategy == :destroy
      scope.destroy_all
    else
      scope.delete_all
    end
  end

  # author_hash is recomputed by a before_validation that only fires when author_id
  # actually changes, so update_all would leave it pointing at the deleted account.
  # update_columns rather than update! deliberately: an old record need not still
  # satisfy today's validations, and a merge must not fail because of one.
  # Anonymous records carry no author_id and so never appear here.
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

  # users.verified is written by SideFxVerificationService#after_create, not by a
  # callback on Verification, so moving the rows does not by itself flip it.
  #
  # The attributes a verification method locks are then no longer editable by the
  # user, so the target has to end up holding the values the identity provider
  # actually asserted rather than whatever it had chosen for itself.
  def apply_verified_identity!(source, target)
    target.verified = true if target.verifications.active.exists?

    locked = @verification_service.locked_attributes(target)
    locked.each do |attribute|
      value = source.public_send(attribute)
      target.public_send(:"#{attribute}=", value) if value.present?
    end

    locked_keys = @verification_service.locked_custom_fields(target).map(&:to_s)
    locked_values = source.custom_field_values.slice(*locked_keys)

    if locked_values.present?
      # Only the locked keys: merging the whole hash would let a brand-new SSO
      # account's blanks overwrite a long-standing profile.
      target.update_merging_custom_fields!(custom_field_values: locked_values)
    else
      target.save!
    end
  end

  def recompute_counters!(target)
    # Follower is the only counter_culture counter stored on the user row, and
    # update_all bypasses it.
    target.update_columns(followings_count: Follower.where(user_id: target.id).count)
  end

  # source.destroy! silently nullifies ideas/comments/reactions and destroys
  # follows/baskets/attendances/cosponsorships - there is no foreign key to raise if a
  # surface was missed. Refusing to delete is the only thing standing between a missed
  # surface and silent data loss.
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
