# frozen_string_literal: true

module Ideas
  class CopyJob < ApplicationJob
    include Jobs::TrackableJob

    delegate :estimate_tracker_total, :idea_scope, to: :class

    ##
    # Copies a batch of ideas to a specified destination phase.
    #
    # We have to rely on a combination of a scope symbol and filters to specify the idea
    # scope, because an ActiveRecord relation is not serializable by ActiveJob and
    # cannot be passed as a job argument.
    #
    # @param [Symbol] idea_scope
    #   The named scope to use when querying ideas (e.g., :all, :published).
    #   Must correspond to a valid scope on the `Idea` model.
    #
    # @param [Hash] idea_filters
    #   A hash of filters passed to `IdeasFinder` to narrow down the idea selection.
    #
    # @param [Phase] dest_phase
    #   The destination phase where the selected ideas should be copied.
    #
    # @param [User] current_user
    #   The user performing the action.
    #
    # @param [Integer] offset
    #   The number of ideas to skip from the start of the dataset. Used for batch processing.
    #   Default is 0.
    #
    # @param [Integer] batch_size
    #   The number of ideas to process in this batch.
    #
    # @param [Time, nil] until_created_at
    #   Copy only ideas created up to this timestamp. If nil, defaults to current time.
    #   This is a safeguard against infinite loops.
    #
    # @param [Boolean] allow_duplicates
    #   Whether to allow copying ideas that have already been copied to the destination phase.
    #   Default is false.
    #
    def perform(
      idea_scope, idea_filters, dest_phase, current_user, allow_duplicates: false,
      # The following params are for batch processing
      offset: 0, batch_size: 100, until_created_at: nil
    )
      until_created_at = ensure_until_created_at(until_created_at)

      ideas = self.idea_scope(idea_scope, idea_filters, dest_phase, current_user, allow_duplicates:)

      remaining_ideas = ideas
        .order(:created_at, :id)
        .offset(offset)
        .where(created_at: ..until_created_at)

      batch = remaining_ideas.limit(batch_size)
      summary = Ideas::CopyService.new.copy(batch, dest_phase, current_user)
      error_count = summary.errors.size
      track_progress(summary.count - error_count, error_count)

      if remaining_ideas.count > batch_size
        enqueue_child_job(
          Ideas::CopyJob,
          idea_scope,
          idea_filters,
          dest_phase,
          current_user,
          offset: offset + summary.count,
          batch_size: batch_size,
          until_created_at: until_created_at
        )
      else
        complete!
      end
    end

    def self.dry_run(idea_scope, idea_filters, dest_phase, current_user, **args)
      Jobs::Tracker.new(
        id: SecureRandom.uuid,
        root_job_id: nil,
        root_job_type: name,
        owner: current_user,
        context: dest_phase,
        project_id: dest_phase.project_id,
        total: estimate_tracker_total(idea_scope, idea_filters, dest_phase, current_user, **args)
      )
    end

    def self.estimate_tracker_total(idea_scope, idea_filters, dest_phase, current_user, allow_duplicates: false, **_args)
      idea_scope(idea_scope, idea_filters, dest_phase, current_user, allow_duplicates:).count
    end

    def self.idea_scope(idea_scope, idea_filters, dest_phase, current_user, allow_duplicates: false)
      ideas = IdeasFinder.new(
        idea_filters,
        scope: IdeaPolicy::Scope.new(current_user, Idea.public_send(idea_scope)).resolve,
        current_user: current_user
      ).find_records

      unless allow_duplicates
        ideas = ideas.where.not(id: RelatedIdea.where(idea: dest_phase.ideas).select(:related_idea_id))
      end

      ideas
    end

    private

    def job_tracking_context
      arguments[2] # dest_phase
    end

    def ensure_until_created_at(until_created_at)
      # We do not allow copying ideas created in the future. Aside from being questionable
      # on its own, this could lead to an infinite loop if the source and destination phases
      # are the same (not the typical use case, but better safe than sorry).
      [until_created_at, Time.zone.now].compact.min
    end
  end
end
