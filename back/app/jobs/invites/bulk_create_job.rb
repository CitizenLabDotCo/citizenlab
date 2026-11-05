# frozen_string_literal: true

module Invites
  class BulkCreateJob < ApplicationJob
    self.priority = 40
    perform_retries false

    def perform(current_user, params, import_id, xlsx_import: false)
      Invites::ImportRunner.new(import_id).run do
        if xlsx_import
          bulk_create_xlsx(current_user, params)
        else
          bulk_create(current_user, params)
        end
      end
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
