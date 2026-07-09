# frozen_string_literal: true

# Repairs phases whose `available_views` does not contain their `presentation_mode`.
#
# The 20260223103753 backfill only added 'map' to `available_views` for ideation and proposals
# phases, so every other phase with `presentation_mode: 'map'` kept `['card']`. It wrote with
# `update_column`, which skips `Phase#validate_available_views`, so the invalid state persisted.
# Any later `update!` on such a phase now fails, which blocks phase editing, manual vote
# recounts, basket recounts and, through those, user and tenant deletion.
#
# DRY_RUN=true analyses without writing; HOST=<host> limits the run to one tenant.
namespace :single_use do
  desc 'Add the default presentation mode to phases whose available_views omits it. DRY_RUN=true to analyse only.'
  task fix_phase_available_views: :environment do
    dry_run = ENV['DRY_RUN']&.downcase == 'true'
    host = ENV.fetch('HOST', nil)

    reporter = ScriptReporter.new
    totals = Hash.new(0)

    if dry_run
      Rails.logger.info '🔍 DRY RUN MODE: analysing without writing.'
      Rails.logger.info '⚠️  NO DATABASE WRITES WILL BE PERFORMED'
    else
      Rails.logger.info '🚀 REPAIR MODE: adding the default presentation mode to available_views.'
      Rails.logger.info '⚠️  THIS WILL MODIFY THE DATABASE'
    end
    Rails.logger.info '=' * 80

    # Deliberately not `Tenant.creation_finalized` or `safe_switch_each`: both skip deleted
    # tenants, and tenants stuck mid-deletion are among the ones that need repairing.
    tenants = host ? Tenant.where(host: host) : Tenant.all

    tenants.each do |tenant|
      next unless ActiveRecord::Base.connection.schema_exists?(tenant.schema_name)

      reporter.add_processed_tenant(tenant)

      tenant.switch do
        drifted = Phase
          .where.not(presentation_mode: nil)
          .where.not('presentation_mode = ANY(available_views)')

        drifted.each do |phase|
          # Adding an unknown mode would only trade this failure for 'contains invalid view modes'.
          if Phase::PRESENTATION_MODES.exclude?(phase.presentation_mode)
            reporter.add_error(
              "presentation_mode #{phase.presentation_mode.inspect} is not a known presentation mode",
              context: { tenant: tenant.host, phase_id: phase.id }
            )
            totals[:skipped] += 1
            next
          end

          new_views = phase.available_views | [phase.presentation_mode]

          reporter.add_change(
            phase.available_views, new_views,
            context: {
              tenant: tenant.host,
              phase_id: phase.id,
              project_id: phase.project_id,
              participation_method: phase.participation_method,
              presentation_mode: phase.presentation_mode
            }
          )

          # `update_column` because we repair *to* a valid state. `update!` would re-run every
          # other validation on a phase we have not audited, and could fail for a second reason.
          phase.update_column(:available_views, new_views) unless dry_run
          totals[:fixed] += 1
        end
      end
    rescue StandardError => e
      # One unreachable tenant must not abort the run.
      reporter.add_error("#{e.class}: #{e.message}", context: { tenant: tenant.host })
    end

    Rails.logger.info "\n#{'=' * 80}"
    Rails.logger.info(dry_run ? '📊 DRY RUN SUMMARY:' : '📊 REPAIR SUMMARY:')
    Rails.logger.info "   #{dry_run ? 'Would fix' : 'Fixed'}: #{totals[:fixed]} phase(s)"
    Rails.logger.info "   Skipped (unknown presentation_mode): #{totals[:skipped]}"
    Rails.logger.info "   Errors: #{reporter.errors.size}"

    report_file = dry_run ? 'fix_phase_available_views_dry_run.json' : 'fix_phase_available_views.json'
    reporter.report!(report_file)
    Rails.logger.info "   📝 Per-phase report: #{report_file}"
  end
end
