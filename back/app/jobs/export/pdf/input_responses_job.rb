# frozen_string_literal: true

module Export
  module Pdf
    # Renders the input responses PDF of a phase in the background (the
    # Gotenberg render takes minutes for large phases) and stores the result as
    # a transient +Export::ResultFile+ for the requesting admin to download.
    #
    # Progress is reported through the +Jobs::Tracker+ of the job: one unit per
    # input processed, plus one reserved unit for the (slow, opaque) Gotenberg
    # render itself so the bar does not sit at 100% while Chromium works.
    #
    # Always enqueue via +with_tracking+: the result is only reachable through
    # the tracker, so an untracked run fails when storing it.
    class InputResponsesJob < ApplicationJob
      include Jobs::TrackableJob

      FILENAME = 'input_responses.pdf'

      # A too-big render fails identically on every attempt, and each attempt
      # hammers the Gotenberg service that is shared across all tenants — so
      # allow a single retry (for transient Gotenberg hiccups) instead of the
      # default 9.
      MAX_RETRY_COUNT = 1

      def perform(phase, cover:, redacted_field_keys:, locale:)
        # A retry starts over; don't stack progress on the first attempt's.
        tracker.update!(progress: 0, error_count: 0)

        pdf = I18n.with_locale(locale) do
          Export::Pdf::InputResponsesGenerator.new(
            phase,
            cover: cover,
            redacted_field_keys: redacted_field_keys,
            on_progress: -> { track_progress }
          ).generate_pdf
        end

        Export::ResultFile.create!(tracker: tracker, name: FILENAME, content: pdf)
        track_progress # The reserved unit for the Gotenberg render.
        mark_as_complete!
      end

      def handle_error(error)
        error_count > MAX_RETRY_COUNT ? expire : super
      end

      private

      # Called on the final failure. Expire the Que job first (so the tracker
      # exposes the error via +job_errors+), then complete the tracker so the
      # frontend stops polling and a new export can be started.
      def expire
        super
        mark_as_complete!
      end

      def job_tracking_context
        arguments.first
      end

      # Same signature as +perform+. The +1 reserves a progress unit for the
      # Gotenberg render.
      def estimate_tracker_total(phase, **_kwargs)
        phase.inputs_for_export.count + 1
      end
    end
  end
end
