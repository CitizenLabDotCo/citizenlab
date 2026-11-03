# frozen_string_literal: true

# Finishes tenant deletions that stalled.
#
# `TenantService#delete` sets `deleted_at`, sweeps the users, and lets
# `Tenants::DeleteJob` destroy the tenant once no users remain. The sweep is
# `User.destroy_all_async`: it enqueues one `DeleteUserJob` per user, scheduled five per second, so
# a tenant of N users is not empty until roughly N / 5 seconds after the sweep starts.
#
# When a `DeleteUserJob` fails permanently the user count stops decreasing, `Tenants::DeleteJob`
# raises `Aborted`, and the tenant is left with `deleted_at` set, its users intact and no job that
# will ever retry. A surviving `Tenant` row with `deleted_at` set is exactly that state, because a
# completed deletion destroys the row.
#
# Nothing resumes those deletions on its own, so this task does it, one tenant at a time, with
# the evidence needed to decide printed before each prompt.
#
# It deliberately does not call `TenantService#delete` again: that would overwrite `deleted_at`
# (losing the record of when the deletion was actually requested) and re-run
# `SideFxTenantService#before_destroy`, which deletes Typeform webhooks that are already gone.
#
# A deletion also stalls when the schema was frozen before later migrations ran: Apartment migrates
# `Tenant.not_deleted` only, so a tenant deleted months ago is missing every migration since. The
# delete cascade then references columns/tables the current code expects but the old schema lacks
# (e.g. `phases.placement_type`), and every `DeleteUserJob` raises `PG::UndefinedColumn`. Before
# sweeping, this task brings the schema forward just enough to delete — and no further. It runs only
# the *missing*, *within-schema*, *additive* structural migrations (create_table / add_column /
# add_reference / rename_* / change_column), each in its own rescue and in version order, so one
# failure cannot halt the rest. The additive test is a *necessary* filter, not a purity check: it
# excludes any migration whose *only* work is one of the following, since none of them adds structure —
#   - data backfills — they run app-model code with side effects (jobs, callbacks, external calls),
#   - indexes and constraints — a unique index can fail on the tenant's own duplicate rows,
#   - roles and grants — a `GRANT`/`CREATE ROLE` is not schema-scoped (it ignores `search_path` and
#     so would reach every tenant on the server).
# — but it does not prove a *selected* migration contains nothing else. A migration that adds a column
# *and* backfills it in the same file (a common pattern) is run, backfill included; that backfill runs
# inside `tenant.switch`, against only this doomed tenant's own data, so it reaches no other tenant, and
# the tenant is about to be deleted anyway. The one mix that *would* escape the schema — additive DDL
# alongside a not-schema-scoped grant — occurs in no migration in the tree. Ordinary structural DDL
# Postgres confines to the switched-in schema regardless, so it cannot touch another tenant.
# A gap those exclusions leave open is not silently swallowed: it resurfaces as the `DeleteUserJob`
# error reported below, not as a stalled sweep.
#
# Reports and asks nothing unless passed 'execute', which makes it interactive. A host limits it to
# one tenant; a poll timeout overrides the one derived from the tenant's user count:
#
#     rake single_use:finish_stuck_tenant_deletions                       # report, all tenants
#     rake 'single_use:finish_stuck_tenant_deletions[execute]'            # finish, all tenants
#     rake 'single_use:finish_stuck_tenant_deletions[execute,foo.com]'    # finish, one tenant
#     rake 'single_use:finish_stuck_tenant_deletions[execute,foo.com,600]'
namespace :single_use do
  desc "Finish tenant deletions that stalled. Reports only unless passed 'execute', which is interactive."
  task :finish_stuck_tenant_deletions, %i[execute host poll_timeout] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'
    host = args[:host]
    poll_timeout_override = args[:poll_timeout]&.to_i

    # Without a TTY `$stdin.gets` returns nil, which would silently skip every tenant and look
    # exactly like a successful run. This task destroys schemas; it must not guess.
    if execute && !$stdin.tty?
      abort 'This task destroys tenants and must be confirmed interactively. ' \
            'Run it from a terminal, or drop the `execute` argument for a non-interactive report.'
    end

    reporter = ScriptReporter.new
    tenants = host ? Tenant.deleted.where(host: host) : Tenant.deleted

    if tenants.none?
      puts 'No unfinished tenant deletions on this cluster. Nothing to do.'
      next
    end

    puts "Found #{tenants.count} tenant(s) with an unfinished deletion."

    # The migrations a fully-migrated schema has, from Rails' own loader — deduplicated and
    # authoritative. NOT a glob of db/migrate + engines/**/db/migrate: engine migrations exist there
    # both as originals and as copied-in versions, and only the copies' versions are ever recorded,
    # so a glob invents phantom "pending" migrations under the originals' never-recorded timestamps.
    # This is the same source `db:migrate_if_pending` uses.
    migrations_by_version = ActiveRecord::Base.connection_pool.migration_context.migrations.index_by(&:version)

    additive_ddl = /\b(create_table|create_join_table|add_column|add_reference|add_belongs_to|rename_column|rename_table|change_column|change_column_null)\b/

    # Classification depends only on the migration, so do it once. The test is a *necessary* filter,
    # not a purity check: a migration is eligible only if its body makes an additive structural change.
    # That excludes anything whose *only* work is unsafe — a pure data backfill, a pure index/constraint,
    # a pure roles/grants migration all carry none of these keywords, so none is selected. It does NOT
    # prove a selected migration contains nothing else:
    #   - additive + backfill in one file (common) IS selected, and the backfill runs — but inside
    #     `tenant.switch`, so it touches only this doomed tenant's own data; it reaches no other tenant,
    #     and the tenant is about to be deleted anyway.
    #   - additive + GRANT/CREATE ROLE would be the one genuinely unsafe mix, since a grant is not
    #     schema-scoped — but no migration in the tree does both, so a separate guard would cover an
    #     empty set. (A filename match on "role" is worse than useless: it drops benign columns like
    #     `add_internal_role_to_projects`.)
    structural_versions = migrations_by_version.select do |_version, migration|
      File.read(migration.filename).match?(additive_ddl)
    rescue StandardError
      false # unreadable/unusual migration: never auto-run it — a real gap will surface in the sweep
    end.keys.to_set

    tenants.each do |tenant|
      reporter.add_processed_tenant(tenant)

      stats = tenant.switch do
        # A tenant deleted before the 20260223103753 migration never received the column
        # (Apartment migrates `Tenant.not_deleted` only). That must not stop us finishing its
        # deletion, so the statistic is reported as unknown rather than raising.
        drifted_phases =
          if ActiveRecord::Base.connection.column_exists?(:phases, :available_views)
            Phase.where.not(presentation_mode: nil)
              .where.not('presentation_mode = ANY(available_views)').count
          end

        {
          users: User.count,
          admins: User.admin.count,
          draft_baskets: Basket.not_submitted.count,
          drifted_phases: drifted_phases,
          orphaned_projects: Project.where.missing(:admin_publication).count,
          applied_migrations: ActiveRecord::Base.connection.select_values('SELECT version FROM schema_migrations').to_set(&:to_i)
        }
      end

      # What this schema is missing versus a fully-migrated one, split into the structural
      # migrations we would run and everything we deliberately skip.
      missing_migrations = migrations_by_version.keys.to_set - stats[:applied_migrations]
      runnable_migrations = (missing_migrations & structural_versions).to_a.sort
      skipped_migrations = (missing_migrations - structural_versions).to_a.sort

      user_jobs = QueJob.by_job_class(DeleteUserJob).all_by_tenant_schema_name(tenant.schema_name)
      pending_user_jobs = user_jobs.not_finished.not_expired.count
      failure_classes = user_jobs.expired.pluck(:last_error_message).map { |m| m.to_s.split(': ').first }.tally

      # `Tenants::DeleteJob` is enqueued outside the tenant switch, so it is not found by schema
      # name; it references the tenant through its global id in the job arguments.
      pending_tenant_jobs = QueJob.by_job_class(MultiTenancy::Tenants::DeleteJob)
        .not_finished.not_expired
        .where('args::text LIKE ?', "%#{tenant.id}%")
        .count

      drifted = stats[:drifted_phases] || 'unknown (schema predates the available_views migration)'

      puts "\n#{'=' * 80}"
      puts "#{tenant.host}  (deleted_at #{tenant.deleted_at}, #{(Time.zone.today - tenant.deleted_at.to_date).to_i} days ago)"
      puts "  users: #{stats[:users]} (admins: #{stats[:admins]})"
      puts "  draft baskets: #{stats[:draft_baskets]}"
      puts "  drifted phases: #{drifted}   orphaned projects: #{stats[:orphaned_projects]}"
      puts "  DeleteUserJobs: #{pending_user_jobs} pending, #{user_jobs.expired.count} expired"
      failure_classes.each { |klass, count| puts "    #{count} x #{klass}" }
      if missing_migrations.any?
        puts "  missing migrations: #{missing_migrations.size} " \
             "(#{runnable_migrations.size} structural to run, #{skipped_migrations.size} skipped: data/index/roles)"
        # List the ones that would run, in both modes and — in execute mode — before the prompt, so
        # the operator sees exactly what will be applied before confirming.
        unless runnable_migrations.empty?
          puts '    structural migrations to run:'
          runnable_migrations.each { |version| puts "      #{File.basename(migrations_by_version[version].filename, '.rb')}" }
        end
      end
      if stats[:drifted_phases].to_i.positive?
        puts "  ⚠️  drifted phases remain — run 'single_use:fix_phase_available_views[execute,#{tenant.host}]' first"
      end

      next unless execute

      # A deletion with jobs still in flight is in progress, not stuck. Sweeping again would
      # enqueue a second DeleteUserJob per user, and `pluck(:id)` has no ORDER BY, so the two
      # sweeps are free to traverse the table in the same physical order and the later one loses
      # the race on every user. Postgres guarantees no such thing, but it is the only reading that
      # explains a RecordNotFound for each of a tenant's users rather than for half of them.
      if pending_user_jobs.positive? || pending_tenant_jobs.positive?
        puts '  ⏭️  Skipped: this deletion is still in progress (jobs pending). Sweeping again would duplicate them.'
        next
      end

      print "  Type the host to finish this deletion, 's' to skip, 'q' to quit: "
      $stdout.flush
      answer = $stdin.gets&.strip

      break if answer.nil? || answer == 'q'

      if answer != tenant.host
        puts '  Skipped.'
        next
      end

      tenant_host = tenant.host

      # Bring the schema forward just enough to delete (see header). Per-migration and in version
      # order, each in its own rescue: a failure here — or a migration that needs data this frozen
      # schema no longer has — must not abort the deletion. Anything genuinely still missing shows up
      # as the DeleteUserJob error after the sweep. `Apartment::Migrator.run` switches into the tenant,
      # then applies and records the one migration there — the supported per-tenant path, already
      # correct for Rails 7.2's `connection_pool.migration_context` accessor.
      if runnable_migrations.any?
        puts "  Applying #{runnable_migrations.size} missing structural migration(s) to #{tenant.schema_name}…"
        applied_now = 0
        runnable_migrations.each do |version|
          Apartment::Migrator.run(:up, tenant.schema_name, version)
          applied_now += 1
        rescue StandardError => e
          puts "    ⚠️  #{version} #{migrations_by_version[version].name}: #{e.class}: #{e.message.lines.first&.strip}"
          reporter.add_error(
            "migration #{version} (#{migrations_by_version[version].name}) failed: #{e.class}: #{e.message.lines.first&.strip}",
            context: { tenant: tenant_host }
          )
        end
        puts "    ✅ applied #{applied_now}/#{runnable_migrations.size} structural migration(s)"
      end

      tenant.switch { User.destroy_all_async }

      # The sweep fans out at 5 jobs/sec, so the last job runs about `users / 5` seconds after it
      # starts. A fixed timeout would report a large tenant as failed while it is still working.
      poll_timeout = poll_timeout_override || [(stats[:users] / 5.0).ceil + 60, 120].max
      deadline = Time.zone.now + poll_timeout.seconds
      remaining = tenant.switch { User.count }
      while remaining.positive? && Time.zone.now < deadline
        sleep 2
        remaining = tenant.switch { User.count }
      end

      if remaining.positive?
        # A DeleteUserJob that keeps raising stays in `not_finished, not_expired` for days — its
        # retry backoff grows steeply with `error_count` — so a *count* of queued jobs cannot tell a
        # failing sweep from a slow one. Ask whether a job has actually errored before calling it
        # "in progress"; an errored job carries the reason this schema still cannot be swept (e.g. a
        # column a skipped migration would have added). The *expired* jobs carry a previous attempt's
        # failure, possibly months old, so they are not consulted here.
        errored_job = user_jobs.errored.order(error_count: :desc).first

        if errored_job
          latest_error = errored_job.last_error_message
          puts "  ❌ #{remaining} user(s) remain; DeleteUserJob is failing (error_count #{errored_job.error_count})."
          puts "     Job error: #{latest_error.to_s.lines.first&.strip}"
          reporter.add_error(
            "#{remaining} user(s) could not be deleted. DeleteUserJob error: #{latest_error}",
            context: { tenant: tenant_host }
          )
        elsif user_jobs.not_finished.not_expired.exists?
          # No job has errored yet, but jobs are still queued/scheduled: the sweep is genuinely
          # working, just slower than the poll (5 jobs/sec). A warning, not a verdict.
          queued = user_jobs.not_finished.not_expired.count
          puts "  ⏳ Sweep still in progress: #{remaining} user(s) left, #{queued} job(s) queued. Re-run later."
          reporter.add_error(
            "sweep still in progress after #{poll_timeout}s: #{remaining} user(s) remain, #{queued} job(s) queued",
            context: { tenant: tenant_host }
          )
        else
          # Users remain but nothing is queued, scheduled or erroring on them — no job is working
          # towards this deletion at all, so re-running will not help on its own.
          puts "  ❌ #{remaining} user(s) remain; tenant not destroyed (no DeleteUserJob is working on them)."
          reporter.add_error(
            "#{remaining} user(s) could not be deleted; no DeleteUserJob remains.",
            context: { tenant: tenant_host }
          )
        end
        next
      end

      MultiTenancy::Tenants::DeleteJob.perform_now(tenant)
      reporter.add_delete('Tenant', tenant.id, context: { host: tenant_host })
      puts "  ✅ #{tenant_host} destroyed."
    rescue StandardError => e
      reporter.add_error("#{e.class}: #{e.message}", context: { tenant: tenant.host })
      puts "  ❌ #{tenant.host}: #{e.class}: #{e.message}"
    end

    # Skipped tenants are those in `processed_tenants` that appear in neither `deletes` nor `errors`.
    reporter.report!(execute ? 'finish_stuck_tenant_deletions.json' : 'finish_stuck_tenant_deletions_report.json')
  end
end
