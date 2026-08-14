# frozen_string_literal: true

# The rest of `purge_stored_xss`: the plain-text fields on `CustomField` and
# `EmailCampaigns::Campaign`, split into their own task so they can be reviewed and run separately.
#
#     CustomField#title_multiloc, #page_button_label_multiloc, #linear_scale_label_1..11_multiloc
#                                              -> survey and form question labels
#     EmailCampaigns::Campaign#subject_multiloc, #title_multiloc, #button_text_multiloc
#                                              -> the `text` editable regions of an email
#
# All are stripped to plain text on write (`PlainTextMultiloc`), same as the titles the other task
# sweeps. They are separate for two reasons:
#
# 1. Losing a legitimate `<` matters more here. `<` before a letter always opens a tag, so
#    "Do you prefer <brand A> or <brand B>?" loses both bracketed words. A question label or an
#    email subject reads like a sentence, where that phrasing is plausible; a project title does
#    not. Read the dry-run report for prefix-truncated values before executing.
# 2. Both models compute their readers - `CustomField#title_multiloc` returns a translation for
#    `title_page` fields, and a campaign merges in its region defaults - so this reads and writes
#    the raw column. Saving what a reader returned would store a default as if an admin typed it.
#
#     rake single_use:purge_stored_xss_form_and_email_text
#     rake 'single_use:purge_stored_xss_form_and_email_text[execute]'
#     rake 'single_use:purge_stored_xss_form_and_email_text[execute,foo.com]'
namespace :single_use do
  desc "Re-sanitise stored custom field titles and email text regions. Dry run unless passed 'execute'."
  task :purge_stored_xss_form_and_email_text, %i[execute host] => [:environment] do |_t, args|
    strip_multiloc = SanitizationService.new.method(:strip_multiloc_to_plain_text)

    # Same wide pre-filter as `purge_stored_xss`: no `<` means no tag to strip, no `&` means no
    # entity to decode. Keyword matching would miss `<iframe src>`, `<form>` and `javas&#99;ript:`.
    rewritable = ->(col) { "(#{col} LIKE '%<%' OR #{col} LIKE '%&%')" }

    # Model, then every plain-text multiloc column it owns.
    targets = {
      CustomField => %i[
        title_multiloc page_button_label_multiloc
        linear_scale_label_1_multiloc linear_scale_label_2_multiloc linear_scale_label_3_multiloc
        linear_scale_label_4_multiloc linear_scale_label_5_multiloc linear_scale_label_6_multiloc
        linear_scale_label_7_multiloc linear_scale_label_8_multiloc linear_scale_label_9_multiloc
        linear_scale_label_10_multiloc linear_scale_label_11_multiloc
      ],
      EmailCampaigns::Campaign => %i[subject_multiloc title_multiloc button_text_multiloc]
    }.freeze

    affected = []

    purge = lambda do |tenant, script, model, attribute|
      model.where(rewritable.call("#{attribute}::text")).find_each do |record|
        old_value = record[attribute]
        new_value = strip_multiloc.call(old_value)
        next if new_value == old_value

        script.reporter.add_change(
          old_value, new_value,
          context: { tenant: tenant.host, model: model.name, id: record.id, attribute: attribute.to_s }
        )
        affected << { host: tenant.host, model: model.name, attribute: attribute.to_s }
        record.update_columns(attribute => new_value) if script.execute?
      rescue StandardError => e
        # Contain the failure: `TenantScript` only rescues per tenant, so without this one bad row
        # would cost the tenant every sweep still to come.
        script.reporter.add_error(
          "#{e.class}: #{e.message}",
          context: { tenant: tenant.host, model: model.name, id: record.id, attribute: attribute.to_s }
        )
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
      'purge_stored_xss_form_and_email_text',
      args: args,
      description: 'purging stored XSS payloads from custom field titles and email text regions',
      tenants: Tenant.not_deleted,
      summary: summary
    ) do |tenant, script|
      targets.each do |model, attributes|
        attributes.each { |attribute| purge.call(tenant, script, model, attribute) }
      end
    end
  end
end
