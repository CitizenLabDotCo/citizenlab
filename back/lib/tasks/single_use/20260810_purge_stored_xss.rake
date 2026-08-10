# frozen_string_literal: true

# Re-sanitises stored content that carries an XSS payload saved before the sanitisation fixes on
# this branch. Draft idea bodies were never sanitised; idea titles and machine translations were
# never HTML-sanitised at all. Sanitising on write does not touch rows already in the database, so
# this cleans the stored values in place, using the same rules each field now applies on write:
#
#     Idea#body_multiloc              -> SanitizationService, Idea::BODY_SANITIZE_FEATURES
#     Idea#title_multiloc             -> ActionView full_sanitizer (plain text, all tags stripped)
#     Comment#body_multiloc           -> SanitizationService, Comment::BODY_SANITIZE_FEATURES
#     MachineTranslation#translation  -> the field's own derived rule (title full-strip vs body)
#
# `custom_field_values` is intentionally out of scope: those answers render as escaped text on the
# front end (not an HTML sink), so they cannot execute and do not need purging.
#
# Only the *sanitise* step is applied, not the models' linkify/trailing-tag passes: those rewrite
# legitimate content (e.g. turning a bare URL into a link) and would produce a diff on clean rows.
# A cheap SQL pre-filter narrows the work to rows whose text carries an executable pattern (an on*
# handler, <script, javascript:/vbscript:, data:text/html), and a row is written only when
# sanitising actually changes it — so clean content is left untouched and re-runs are no-ops.
# Writes use `update_columns` to avoid re-running unrelated validations on legacy rows.
#
# `TenantScript` owns the dry run, the tenant loop and the report. Deleted tenants stay out; every
# other tenant can still serve content, so all of them are in scope.
#
#     rake single_use:purge_stored_xss                     # dry run, all tenants
#     rake 'single_use:purge_stored_xss[execute]'          # write, all tenants
#     rake 'single_use:purge_stored_xss[execute,foo.com]'  # write, one tenant
namespace :single_use do
  desc "Re-sanitise stored idea/comment/translation content carrying XSS payloads. Dry run unless passed 'execute'."
  task :purge_stored_xss, %i[execute host] => [:environment] do |_t, args|
    service = SanitizationService.new
    full_sanitizer = ActionView::Base.full_sanitizer

    # Executable-payload pre-filter over a text-typed SQL expression (a jsonb cast or a text column).
    suspicious = lambda do |col|
      "(#{col} ~* 'on\\w+\\s*=' OR #{col} ILIKE '%<script%' OR " \
        "#{col} ILIKE '%javascript:%' OR #{col} ILIKE '%vbscript:%' OR #{col} ILIKE '%data:text/html%')"
    end

    sanitize_multiloc = lambda do |multiloc, features|
      service.sanitize_multiloc(multiloc, features)
    end

    strip_multiloc = lambda do |multiloc|
      multiloc.transform_values { |value| value ? full_sanitizer.sanitize(value) : value }
    end

    affected = [] # rows for the summary: { host:, model:, attribute: }

    # Re-sanitises one attribute across a scope, reporting and writing only real changes.
    purge = lambda do |tenant, script, scope, attribute, sanitizer, model_label|
      scope.find_each do |record|
        old_value = record.public_send(attribute)
        new_value = sanitizer.call(old_value)
        next if new_value == old_value

        script.reporter.add_change(
          old_value, new_value,
          context: { tenant: tenant.host, model: model_label, id: record.id, attribute: attribute.to_s }
        )
        affected << { host: tenant.host, model: model_label, attribute: attribute.to_s }
        record.update_columns(attribute => new_value) if script.execute?
      end
    end

    summary = lambda do |_script|
      next if affected.empty?

      puts "\n   🧹 Purged rows by tenant:"
      affected.group_by { |row| row[:host] }.each do |host, rows|
        puts "\n      #{host}"
        rows.group_by { |row| [row[:model], row[:attribute]] }.each do |(model, attribute), group|
          puts "         #{model}##{attribute}: #{group.size}"
        end
      end
    end

    TenantScript.run(
      'purge_stored_xss',
      args: args,
      description: 'purging stored XSS payloads from idea, comment and translation content',
      tenants: Tenant.not_deleted,
      summary: summary
    ) do |tenant, script|
      purge.call(
        tenant, script,
        Idea.where(suspicious.call('body_multiloc::text')), :body_multiloc,
        ->(value) { sanitize_multiloc.call(value, Idea::BODY_SANITIZE_FEATURES) }, 'Idea'
      )
      purge.call(
        tenant, script,
        Idea.where(suspicious.call('title_multiloc::text')), :title_multiloc,
        strip_multiloc, 'Idea'
      )
      purge.call(
        tenant, script,
        Comment.where(suspicious.call('body_multiloc::text')), :body_multiloc,
        ->(value) { sanitize_multiloc.call(value, Comment::BODY_SANITIZE_FEATURES) }, 'Comment'
      )
      # Machine translations need the record's own translatable_type/attribute_name to pick the
      # right rule, so they reuse the model's private sanitiser in place rather than the value-only
      # `purge` helper above.
      MachineTranslations::MachineTranslation.where(suspicious.call('translation')).find_each do |mt|
        old_value = mt.translation
        mt.send(:sanitize_translation)
        new_value = mt.translation
        next if new_value == old_value

        script.reporter.add_change(
          old_value, new_value,
          context: { tenant: tenant.host, model: 'MachineTranslation', id: mt.id, attribute: 'translation' }
        )
        affected << { host: tenant.host, model: 'MachineTranslation', attribute: 'translation' }
        mt.update_columns(translation: new_value) if script.execute?
      end
    end
  end
end
