# frozen_string_literal: true

module Invites
  class CountNewSeatsJob < ApplicationJob
    self.priority = 40
    perform_retries false

    def perform(current_user, params, import_id, xlsx_import: false)
      Invites::ImportRunner.new(import_id).run do
        if xlsx_import
          count_new_seats_xlsx(current_user, params)
        else
          count_new_seats(current_user, params)
        end
      end
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
