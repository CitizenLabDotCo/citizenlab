module WebApi
  module V1
    module Invites
      class InvitesImportsController < ApplicationController
        skip_after_action :verify_policy_scoped

        def show
          import = InvitesImport.find(params[:id])
          authorize :invite, :create?

          render json: WebApi::V1::Invites::InvitesImportSerializer.new(
            import,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        def count_new_seats
          authorize :invite, :create?

          import = InvitesImport.create!(
            job_type: 'count_new_seats',
            importer: current_user
          )

          ::Invites::CountNewSeatsJob.perform_later(
            current_user,
            bulk_create_params,
            import.id,
            xlsx_import: false
          )

          render json: WebApi::V1::Invites::InvitesImportSerializer.new(
            import,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        def count_new_seats_xlsx
          authorize :invite, :create?

          import = InvitesImport.create!(
            job_type: 'count_new_seats_xlsx',
            importer: current_user
          )

          ::Invites::CountNewSeatsJob.perform_later(
            current_user,
            bulk_create_xlsx_params,
            import.id,
            xlsx_import: true
          )

          render json: WebApi::V1::Invites::InvitesImportSerializer.new(
            import,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        def bulk_create
          authorize :invite, :create?

          import = InvitesImport.create!(
            job_type: 'bulk_create',
            importer: current_user
          )

          ::Invites::BulkCreateJob.perform_later(
            current_user,
            bulk_create_params,
            import.id,
            xlsx_import: false
          )

          render json: WebApi::V1::Invites::InvitesImportSerializer.new(
            import,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        def bulk_create_xlsx
          authorize :invite, :create?

          import = InvitesImport.create!(
            job_type: 'bulk_create_xlsx',
            importer: current_user
          )

          ::Invites::BulkCreateJob.perform_later(
            current_user,
            bulk_create_xlsx_params,
            import.id,
            xlsx_import: true
          )

          render json: WebApi::V1::Invites::InvitesImportSerializer.new(
            import,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        private

        def bulk_create_params
          params.require(:invites).permit(
            :locale,
            :invite_text,
            group_ids: [],
            roles: %i[type project_id],
            emails: []
          )
        end

        def bulk_create_xlsx_params
          params.require(:invites).permit(
            :xlsx,
            :locale,
            :invite_text,
            group_ids: [],
            roles: %i[type project_id]
          )
        end
      end
    end
  end
end
