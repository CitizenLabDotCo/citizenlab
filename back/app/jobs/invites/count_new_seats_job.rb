# frozen_string_literal: true

module Invites
  class CountNewSeatsJob < ApplicationJob
    perform_retries false

    def perform(current_user, params, import_id, xlsx_import: false)
      import = InvitesImport.find(import_id)

      seat_numbers = if xlsx_import
        count_new_seats_xlsx(current_user, params)
      else
        count_new_seats(current_user, params)
      end

      result = {
        data: {
          type: 'invites_import',
          attributes: seat_numbers
        }
      }

      import.update!(result: result, completed_at: Time.current)
    rescue Invites::FailedError => e
      import.update!(result: { errors: e.to_h }, completed_at: Time.current)
    end

    private

    def count_new_seats(current_user, params)
      Invites::SeatsCounter.new.count_in_transaction do
        Invites::Service.new(current_user, run_side_fx: false).bulk_create(
          params[:emails].map { |e| { 'email' => e } },
          params.except(:emails).stringify_keys
        )
      end
    end

    def count_new_seats_xlsx(current_user, params)
      Invites::SeatsCounter.new.count_in_transaction do
        Invites::Service.new(current_user, run_side_fx: false).bulk_create_xlsx(
          params[:xlsx],
          params.except(:xlsx).stringify_keys
        )
      end
    end
  end
end
