# frozen_string_literal: true

module Invites
  class BulkCreateJob < ApplicationJob
    self.priority = 40
    perform_retries false

    def perform(current_user, params, import_id, xlsx_import: false)
      import = InvitesImport.find(import_id)

      seat_numbers = if xlsx_import
        bulk_create_xlsx(current_user, params)
      else
        bulk_create(current_user, params)
      end

      import.update!(result: seat_numbers, completed_at: Time.current)
    rescue Invites::FailedError => e
      import.update!(result: { errors: e.to_h }, completed_at: Time.current)
    rescue StandardError
      # Anything else (a DB error, a validation raised outside the invitee checks)
      # would otherwise leave the import pending forever, since this job does not
      # retry — the admin would wait out the front-end timeout instead of being
      # shown the error. Record the failure, then re-raise so it is not swallowed.
      import&.update!(
        result: { errors: [{ error: 'unexpected_invite_error' }] },
        completed_at: Time.current
      )
      raise
    end

    private

    def bulk_create(current_user, params)
      Invites::Service.new(current_user).bulk_create(
        params[:emails].map { |e| { 'email' => e } },
        params.except(:emails).stringify_keys
      )
    end

    def bulk_create_xlsx(current_user, params)
      Invites::Service.new(current_user).bulk_create_xlsx(
        params[:xlsx],
        params.except(:xlsx).stringify_keys
      )
    end
  end
end
