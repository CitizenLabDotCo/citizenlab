# frozen_string_literal: true

namespace :single_use do
  desc 'Delete all legacy file records after migration to new Files system'
  # This rake task deletes records explicitly using +destroy!+ before we delete the tables
  # in a migration in order to run the destroy callbacks and clean up associated files on
  # S3.
  task delete_legacy_file_records: [:environment] do |_t, _args|
    SemanticLogger.named_tagged(
      rake_task: 'single_use:delete_legacy_file_records',
      run_id: SecureRandom.uuid
    ) do
      legacy_classes = [
        IdeaFile,
        ProjectFile,
        EventFile,
        PhaseFile,
        StaticPageFile,
        ProjectFolders::File
      ]

      # region stats_and_logging
      tenant_count = 0
      file_counts = Hash.new(0)
      error_count = 0
      # endregion

      # We don't use +Tenant.safe_switch_each+ here because we also want to delete legacy
      # files for tenants marked as deleted.
      Tenant.all.each do |tenant|
        tenant.switch do
          SemanticLogger.named_tagged(tenant_host: tenant.host) do
            tenant_file_counts = Hash.new(0)
            tenant_error_count = 0

            legacy_classes.each do |klass|
              klass.migrated.find_each do |file|
                file.destroy!
                # region stats_and_logging
                tenant_file_counts[klass.name] += 1
                Rails.logger.info('Destroyed record', klass: klass.name, id: file.id)
              rescue StandardError => e
                tenant_error_count += 1
                ErrorReporter.report(e, extra: {
                  klass: klass.name, id: file.id, tenant: tenant.host, tenant_id: tenant.id
                })
                # endregion
              end
            end

            # region stats_and_logging
            file_counts.merge!(tenant_file_counts) { |_k, old, new| old + new }
            error_count += tenant_error_count

            Rails.logger.info('Tenant processed', file_counts: tenant_file_counts, error_count: tenant_error_count)
            tenant_count += 1
            # endregion
          end
        end
      end

      Rails.logger.info('Task completed', tenant_count:, file_counts:, error_count:)
    end
  end
end
