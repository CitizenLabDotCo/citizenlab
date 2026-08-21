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
# Because of (1), two kinds of row cost content rather than just markup, and both are reported with
# their before and after. In execute mode each is put to the operator one at a time, because only a
# person can say whether the loss is acceptable:
#
#     emptied      stripping left nothing, because the whole value was payload
#     lost text    words the reader could see are gone
#
# `lost text` catches an unclosed `<` swallowing the rest of a value. A balanced `<brand A>` is not
# flagged, and should not be: `PlainTextMultiloc` strips it from every save an admin makes today, so
# a legacy row losing it is this task doing its job. The dry-run report is the backstop for those.
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

    # Stands in for a value stripping to nothing, where the record rejects a blank.
    placeholder = '-'
    value_limit = 800

    affected = [] # rows for the summary: { host:, model:, attribute: }
    blanked = [] # rows stripping emptied
    lost_text = [] # rows stripping took visible words from
    skipped = [] # rows the operator declined to write
    skip_all = false

    # A value that was nothing but payload strips to nothing. `update_columns` skips the presence
    # validation `CustomField#title_multiloc` and a campaign's `subject_multiloc` carry, so a blank
    # would leave the record frozen: every later save of any field on it fails on the missing value.
    blanked_locales = lambda do |old_value, new_value|
      old_value.filter_map { |locale, old| locale if old.present? && new_value[locale].blank? }
    end

    # The words the stored value holds. Not the HTML sanitiser, and not `<[^>]*>` either: both read
    # `prefer A <or prefer B?` as one long tag, so they drop that prose from the before-value too and
    # the loss measures as nothing. A real tag never contains `<`, which tells them apart. A balanced
    # `<brand A>` is indistinguishable from markup and counts as markup here - see the header.
    #
    # `&nbsp;` is decoded by hand, as `strip_to_plain_text` does: `CGI.unescapeHTML` covers the five
    # XML names and numeric references but not that one, so without it the word `nbsp` counts as
    # visible text and every row the pipeline turns into a literal U+00A0 reads as prose lost.
    visible_words = lambda do |value|
      text = value.to_s.gsub(/<[^<>]*>/, ' ').gsub('&nbsp;', SanitizationService::NBSP)
      CGI.unescapeHTML(text).scan(/[[:word:]]+/)
    end

    # Words the reader loses. Compared as words rather than characters, which reads as noise. No
    # carve-out for link labels: stripping keeps an anchor's text and drops only the href, so a
    # label's words are never the ones that go missing here.
    lost_words = lambda do |old_text, new_text|
      remaining = visible_words.call(new_text).tally
      visible_words.call(old_text).filter_map do |word|
        if remaining[word].to_i.positive?
          remaining[word] -= 1
          nil
        else
          word
        end
      end
    end

    # [locale, words] for every locale whose visible text lost something. An emptied locale lost
    # every word it had, so it is left to `blanked` rather than listed twice.
    lost_by_locale = lambda do |old_value, new_value, emptied|
      old_value.filter_map do |locale, old|
        next if emptied.include?(locale)

        words = lost_words.call(old, (new_value || {})[locale])
        [locale, words] if words.any?
      end
    end

    # Only where the record itself rejects the blank. Where a blank is legal - a page's title, an
    # unused linear scale label - it is left alone rather than given content nobody wrote.
    rejects_blank = lambda do |record, attribute, blank_value|
      original = record[attribute]
      record.assign_attributes(attribute => blank_value)
      record.valid?
      record.errors[attribute].any?
    ensure
      record.assign_attributes(attribute => original)
    end

    value_to_write = lambda do |record, attribute, new_value, emptied|
      return new_value if emptied.empty?
      return new_value unless rejects_blank.call(record, attribute, new_value)

      new_value.merge(emptied.index_with { placeholder })
    end

    preview = lambda do |value|
      text = value.to_s
      text.length > value_limit ? "#{text[0, value_limit]}… (#{text.length} chars)" : text
    end

    # A row's identity line and its before/after, shared by the summary and the execute-mode prompt.
    row_lines = lambda do |row|
      locales = row[:locales].map(&:first)
      row[:locales].each_with_object(["         #{row[:model]}##{row[:attribute]} [#{locales.join(', ')}] #{row[:id]}"]) do |(locale, words), lines|
        lines << "            lost: #{words.join(', ')}" if words
        lines << "            before: #{preview.call((row[:before] || {})[locale])}"
        lines << "            after:  #{(row[:after] || {})[locale].presence ? preview.call(row[:after][locale]) : '(blank)'}"
      end
    end

    # Execute mode stops on every row where stripping costs content: these are the rows a blanket
    # write would quietly damage, and only the operator can judge them.
    ask = lambda do |row|
      puts
      puts "   ⚠️  #{row[:host]}"
      row_lines.call(row).each { |line| puts line }

      if skip_all
        puts '            ⏭️  skipped'
        return false
      end

      # Answering for the operator is the one thing this must not do: skipping leaves a live payload
      # and writing may cost content. Rows already written stand, and re-running is a no-op over them.
      unless $stdin.tty?
        abort "\n❌ This row needs a decision and there is no terminal to ask on. Re-run attached to one."
      end

      loop do
        print '            [y] write  [s] skip  [q] skip all remaining: '
        case $stdin.gets&.strip&.downcase
        when 'y' then return true
        when 's' then return false
        when 'q', nil
          skip_all = true
          return false
        end
      end
    end

    purge = lambda do |tenant, script, model, attribute|
      model.where(rewritable.call("#{attribute}::text")).find_each do |record|
        # The raw column, not the reader: both models compute one, and writing that back would save
        # a default or a translation as if an admin had typed it.
        old_value = record[attribute]
        new_value = strip_multiloc.call(old_value)
        next if new_value == old_value

        # The report records what the sweep found; the summary records what was not written.
        script.reporter.add_change(
          old_value, new_value,
          context: { tenant: tenant.host, model: model.name, id: record.id, attribute: attribute.to_s }
        )
        affected << { host: tenant.host, model: model.name, attribute: attribute.to_s }

        emptied = blanked_locales.call(old_value, new_value)
        lost = lost_by_locale.call(old_value, new_value, emptied)
        written = value_to_write.call(record, attribute, new_value, emptied)

        row = {
          host: tenant.host, model: model.name, attribute: attribute.to_s, id: record.id,
          before: old_value, after: written
        }
        blanked << row.merge(locales: emptied.map { |locale| [locale, nil] }) if emptied.any?
        lost_text << row.merge(locales: lost) if lost.any?

        next unless script.execute?

        flagged = emptied.map { |locale| [locale, nil] } + lost
        if flagged.any? && !ask.call(row.merge(locales: flagged))
          skipped << row
          next
        end

        record.update_columns(attribute => written)
      rescue StandardError => e
        # Contain the failure: `TenantScript` only rescues per tenant, so without this one bad row
        # would cost the tenant every sweep still to come.
        script.reporter.add_error(
          "#{e.class}: #{e.message}",
          context: { tenant: tenant.host, model: model.name, id: record.id, attribute: attribute.to_s }
        )
      end
    end

    listing = lambda do |rows, heading|
      return if rows.empty?

      puts "\n   ⚠️  #{heading}"
      rows.group_by { |row| row[:host] }.each do |host, group|
        puts "\n      #{host}"
        group.each { |row| row_lines.call(row).each { |line| puts line } }
      end
    end

    summary = lambda do |_script|
      if affected.any?
        puts "\n   🧹 Purged rows by tenant:"
        affected.group_by { |row| row[:host] }.each do |host, rows|
          puts "\n      #{host}"
          rows.group_by { |row| [row[:model], row[:attribute]] }.each do |(model, attribute), group|
            puts "         #{model}##{attribute}: #{group.size}"
          end
        end
      end

      listing.call(blanked, 'Emptied - nothing survived stripping. Set a value on each by hand:')
      listing.call(lost_text, 'Text lost. Check each one:')

      return if skipped.empty?

      puts "\n   ⏭️  Skipped on your say-so - the original value is still stored:"
      skipped.group_by { |row| row[:host] }.each do |host, rows|
        puts "\n      #{host}"
        rows.each { |row| puts "         #{row[:model]}##{row[:attribute]} #{row[:id]}" }
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
