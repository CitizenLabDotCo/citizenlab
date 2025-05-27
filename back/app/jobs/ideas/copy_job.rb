# frozen_string_literal: true

module Ideas
  class CopyJob < ApplicationJob
    include Jobs::TrackableJob
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
    def perform(
      idea_scope, idea_filters, dest_phase, current_user,
      # The following params are for batch processing
      offset: 0, batch_size: 100, until_created_at: nil
    )
      until_created_at = ensure_until_created_at(until_created_at)

      ideas = IdeasFinder.new(
        idea_filters,
        scope: IdeaPolicy::Scope.new(current_user, Idea.public_send(idea_scope)).resolve,
        current_user: current_user
      ).find_records

      remaining_ideas = ideas
        .order(:created_at, :id)
        .offset(offset)
        .where(created_at: ..until_created_at)

      batch = remaining_ideas.limit(batch_size)
      Ideas::CopyService.new.copy(batch, dest_phase, current_user)
      track_progress(batch.size)

      if remaining_ideas.count > batch_size
        enqueue_child_job(
          Ideas::CopyJob,
          idea_scope,
          idea_filters,
          dest_phase,
          current_user,
          offset: offset + batch.size,
          batch_size: batch_size,
          until_created_at: until_created_at
        )
      end
    end

    def estimate_tracker_total(idea_scope, idea_filters, _dest_phase, current_user, **_args)
      IdeasFinder.new(
        idea_filters,
        scope: IdeaPolicy::Scope.new(current_user, Idea.public_send(idea_scope)).resolve,
        current_user: current_user
      ).find_records.count
    end

    private

    def ensure_until_created_at(until_created_at)
      [until_created_at, Time.zone.now].compact.min
    end
  end
end
