# frozen_string_literal: true

module Invites
  class CountNewSeatsJob < ApplicationJob
    perform_retries false

    def perform(current_user, bulk_create_xlsx_params, import_id)
      import = InvitesImport.find(import_id)

      seat_numbers = Invites::SeatsCounter.new.count_in_transaction do
        Invites::Service.new(current_user, run_side_fx: false).bulk_create_xlsx(
          bulk_create_xlsx_params[:xlsx],
          bulk_create_xlsx_params.except(:xlsx).stringify_keys
        )
      end

      result = {
        data: {
          type: 'invites_import',
          attributes: seat_numbers
        }
      }

      import.update!(result: result)
    rescue Invites::FailedError => e
      # render json: { errors: e.to_h }, status: :unprocessable_entity
      import.update!(result: { errors: e.to_h })
    end
  end
end
