# frozen_string_literal: true

# Re-sanitises stored content carrying an XSS payload saved before sanitisation was added. Draft
# idea bodies were never sanitised; idea titles and machine translations were never HTML-sanitised
# at all. Sanitising on write does not touch rows already in the database, so this cleans the
# stored values in place, using each field's whole write-path pipeline:
#
#     Idea#body_multiloc              -> SanitizationService#sanitize_body_multiloc, Idea features
#     Idea#title_multiloc             -> SanitizationService#strip_to_plain_text
#     Comment#body_multiloc           -> SanitizationService#sanitize_body_multiloc, Comment features
#     MachineTranslation#translation  -> the field's own derived rule (title full-strip vs body)
#
# `custom_field_values` is intentionally out of scope: those answers render as escaped text on the
# front end (not an HTML sink), so they cannot execute and do not need purging.
#
# A row is written only when processing actually changes it, so clean content is left untouched
# and re-runs are no-ops. Writes use `update_columns` to avoid re-running unrelated validations on
# legacy rows.
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

    # Pre-filter over a text-typed SQL expression (a jsonb cast or a text column). A row with no
    # `<` has no tag to strip and no `&` has no entity to decode, so nothing this excludes can be
    # changed below. Keep it this wide: matching executable keywords instead misses `<iframe src>`,
    # `<form>`, `<object>`, `<style>` and schemes hidden behind an entity like `javas&#99;ript:`.
    rewritable = ->(col) { "(#{col} LIKE '%<%' OR #{col} LIKE '%&%')" }

    strip_multiloc = lambda do |multiloc|
      multiloc.transform_values { |value| value ? service.strip_to_plain_text(value) : value }
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
        Idea.where(rewritable.call('body_multiloc::text')), :body_multiloc,
        ->(value) { service.sanitize_body_multiloc(value, Idea::BODY_SANITIZE_FEATURES) }, 'Idea'
      )
      purge.call(
        tenant, script,
        Idea.where(rewritable.call('title_multiloc::text')), :title_multiloc,
        strip_multiloc, 'Idea'
      )
      purge.call(
        tenant, script,
        Comment.where(rewritable.call('body_multiloc::text')), :body_multiloc,
        ->(value) { service.sanitize_body_multiloc(value, Comment::BODY_SANITIZE_FEATURES) }, 'Comment'
      )
      # Machine translations pick their rule from the record's own translatable_type and
      # attribute_name, so they reuse the model's sanitiser rather than the value-only helper.
      MachineTranslations::MachineTranslation.where(rewritable.call('translation')).find_each do |mt|
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
