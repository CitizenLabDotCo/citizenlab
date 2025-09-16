# frozen_string_literal: true

module Invites
  class CountNewSeatsJob < ApplicationJob
    perform_retries false

    def perform(current_user, params, import_id)
      import = InvitesImport.find(import_id)

      seat_numbers = count_new_seats_xlsx(current_user, params)

      result = {
        data: {
          type: 'invites_import',
          attributes: seat_numbers
        }
      }

      import.update!(result: result)
    rescue Invites::FailedError => e
      import.update!(result: { errors: e.to_h })
    end

    private

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
