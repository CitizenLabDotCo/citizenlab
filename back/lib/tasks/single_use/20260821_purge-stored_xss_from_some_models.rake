# frozen_string_literal: true

# Re-sanitises stored content carrying an XSS payload saved before sanitisation was added. Draft
# idea bodies were never sanitised; titles, access denied explanations and machine translations
# were never HTML-sanitised at all. Sanitising on write does not touch rows already in the
# database, so this cleans the stored values in place, using each field's whole write-path
# pipeline:
#
#     Idea#body_multiloc              -> SanitizationService#sanitize_body_multiloc, Idea features
#     Comment#body_multiloc           -> SanitizationService#sanitize_body_multiloc, Comment features
#     Permission#access_denied_explanation_multiloc
#                                     -> SanitizationService#sanitize_body_multiloc, decoration and
#                                        link only
#     MachineTranslation#translation  -> the source field's own pipeline, whichever that is
#     every column in `plain_text_columns`
#                                     -> SanitizationService#strip_multiloc_to_plain_text
#
# `custom_field_values` is intentionally out of scope: those answers render as escaped text on the
# front end (not an HTML sink), so they cannot execute and do not need purging.
#
# A row is written only when processing actually changes it, so clean content is left untouched
# and re-runs are no-ops. Writes use `update_columns` to avoid re-running unrelated validations on
# legacy rows. A row whose only change is the dead `data-user-slug` mention attribute is left alone
# too, and counted in the summary.
#
# Two kinds of row cost content rather than just markup, and both are reported with their before and
# after. In execute mode each is put to the operator one at a time, because only a person can say
# whether the loss is acceptable:
#
#     emptied      sanitising left nothing, because the whole value was payload
#     lost text    words the reader could see are gone, and they were not inside a link
#
# `TenantScript` owns the dry run, the tenant loop and the report. Deleted tenants stay out; every
# other tenant can still serve content, so all of them are in scope.
#
#     rake single_use:purge_stored_xss_b                     # dry run, all tenants
#     rake 'single_use:purge_stored_xss_b[execute]'          # write, all tenants
#     rake 'single_use:purge_stored_xss_b[execute,foo.com]'  # write, one tenant
namespace :single_use do
  desc "Re-sanitise stored title/body/explanation/translation content carrying XSS payloads. Dry run unless passed 'execute'."
  task :purge_stored_xss_b, %i[execute host] => [:environment] do |_t, args|
    service = SanitizationService.new

    # Pre-filter over a text-typed SQL expression (a jsonb cast or a text column). No `<` means no
    # tag to strip and no `&` means no entity to decode, so nothing this excludes can carry a
    # payload. It does exclude rows the write path would merely normalise (a bare URL to linkify, a
    # stray `>` to re-escape) - deliberate: this task removes payloads, it does not reformat clean
    # history. Keep it this wide: keyword matching would miss `<iframe src>`, `<form>`, `<object>`,
    # `<style>` and schemes hidden behind an entity like `javas&#99;ript:`.
    rewritable = ->(col) { "(#{col} LIKE '%<%' OR #{col} LIKE '%&%')" }

    strip_multiloc = service.method(:strip_multiloc_to_plain_text)

    # Every column declared by `PlainTextMultiloc`, minus `CustomField` and
    # `EmailCampaigns::Campaign` - those two are swept by `purge_stored_xss_form_and_email_text`,
    # which is run separately so their higher risk of losing a legitimate `<` can be reviewed on its
    # own.
    plain_text_columns = {
      Idea => %i[title_multiloc],
      Project => %i[title_multiloc],
      Phase => %i[title_multiloc native_survey_title_multiloc native_survey_button_multiloc],
      ProjectFolders::Folder => %i[title_multiloc],
      InputTopic => %i[title_multiloc],
      GlobalTopic => %i[title_multiloc],
      DefaultInputTopic => %i[title_multiloc],
      Event => %i[title_multiloc location_multiloc address_2_multiloc attend_button_multiloc],
      StaticPage => %i[title_multiloc banner_header_multiloc banner_subheader_multiloc banner_cta_button_multiloc],
      Space => %i[title_multiloc],
      Area => %i[title_multiloc],
      Group => %i[title_multiloc],
      IdeaStatus => %i[title_multiloc],
      NavBarItem => %i[title_multiloc],
      CustomFieldOption => %i[title_multiloc],
      CustomFieldMatrixStatement => %i[title_multiloc],
      Polls::Question => %i[title_multiloc],
      Polls::Option => %i[title_multiloc],
      CustomMaps::Layer => %i[title_multiloc],
      Volunteering::Cause => %i[title_multiloc],
      OfficialFeedback => %i[author_multiloc]
    }.freeze

    # Stands in for a value sanitising to nothing, where the record rejects a blank.
    placeholder = '-'
    value_limit = 800

    affected = [] # rows for the summary: { host:, model:, attribute: }
    blanked = [] # rows sanitising emptied
    lost_text = [] # rows sanitising stripped visible words from
    skipped = [] # rows the operator declined to write
    slug_only_skipped = 0
    skip_all = false

    # A value that was nothing but payload sanitises to nothing. `update_columns` skips the presence
    # validation most of these fields carry, so a blank would leave the record frozen: every later
    # save of any field on it fails on the missing value. Collect them for the summary; a blank
    # title is visible and fixable, an unlisted one is neither.
    blanked_locales = lambda do |old_value, new_value|
      unless old_value.is_a?(Hash)
        return old_value.present? && new_value.blank? ? ['-'] : []
      end

      old_value.filter_map { |locale, old| locale if old.present? && new_value[locale].blank? }
    end

    # The words the stored value holds. Not the HTML sanitiser, and not `<[^>]*>` either: both read
    # `<Sea level <200 cm) ...</p>` as a single tag, so they drop that prose from the before-value
    # too and the loss measures as nothing. A real tag never contains `<`, which tells them apart.
    visible_words = lambda do |value|
      CGI.unescapeHTML(value.to_s.gsub(/<[^<>]*>/, ' ')).scan(/[[:word:]]+/)
    end

    # Words inside a link's label. `replace_links_with_urls` rewrites a label to its own href, so a
    # word that only ever lived in one is meant to go and is not a loss.
    label_words = lambda do |value|
      value.to_s.scan(%r{<a\b[^>]*>(.*?)</a>}im).flatten.flat_map { |label| visible_words.call(label) }
    end

    # Words the reader loses that were not inside a link. Compared as words rather than characters:
    # a rewritten URL shuffles single letters around, which reads as noise at character level.
    lost_words = lambda do |old_text, new_text|
      remaining = visible_words.call(new_text).tally
      labels = label_words.call(old_text).to_set
      visible_words.call(old_text).filter_map do |word|
        if remaining[word].to_i.positive?
          remaining[word] -= 1
          nil
        else
          labels.include?(word) ? nil : word
        end
      end
    end

    # [locale, words] for every locale whose visible text lost something outside a link. An emptied
    # locale lost every word it had, so it is left to `blanked` rather than listed twice.
    lost_by_locale = lambda do |old_value, new_value, emptied|
      unless old_value.is_a?(Hash)
        words = emptied.any? ? [] : lost_words.call(old_value, new_value)
        return words.any? ? [['-', words]] : []
      end

      old_value.filter_map do |locale, old|
        next if emptied.include?(locale)

        words = lost_words.call(old, (new_value || {})[locale])
        [locale, words] if words.any?
      end
    end

    # Only where the record itself rejects the blank. Where a blank is legal - `Idea#body_multiloc`,
    # a draft idea's title - it is left alone rather than given content nobody wrote.
    rejects_blank = lambda do |record, attribute, blank_value|
      original = record.public_send(attribute)
      record.assign_attributes(attribute => blank_value)
      record.valid?
      record.errors[attribute].any?
    ensure
      record.assign_attributes(attribute => original)
    end

    value_to_write = lambda do |record, attribute, new_value, emptied|
      return new_value if emptied.empty?
      return new_value unless rejects_blank.call(record, attribute, new_value)

      return placeholder unless new_value.is_a?(Hash)

      new_value.merge(emptied.index_with { placeholder })
    end

    preview = lambda do |value|
      text = value.to_s
      text.length > value_limit ? "#{text[0, value_limit]}… (#{text.length} chars)" : text
    end

    # A row's identity line and its before/after, shared by the summary and the execute-mode prompt.
    row_lines = lambda do |row|
      locales = row[:locales].map(&:first)
      tag = locales == ['-'] ? '' : " [#{locales.join(', ')}]"
      row[:locales].each_with_object(["         #{row[:model]}##{row[:attribute]}#{tag} #{row[:id]}"]) do |(locale, words), lines|
        before = locale == '-' ? row[:before] : (row[:before] || {})[locale]
        after = locale == '-' ? row[:after] : (row[:after] || {})[locale]
        lines << "            lost: #{words.join(', ')}" if words
        lines << "            before: #{preview.call(before)}"
        lines << "            after:  #{after.presence ? preview.call(after) : '(blank)'}"
      end
    end

    # Execute mode stops on every row where sanitising costs content: these are the rows a blanket
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

    # `data-user-slug` left the mention allowlist in April 2026, so re-running the write path over a
    # legacy row strips it. Nothing reads it - the front end finds a mention by `data-user-id`, and
    # comments written since have gone without it - so removing it rewrites a row that carries no
    # payload. Left in, these outnumber the real findings by seven to one and bury them.
    slug_attribute = /\s*data-user-slug="[^"]*"/
    slug_only = lambda do |old_value, new_value|
      stripped = if old_value.is_a?(String)
        old_value.gsub(slug_attribute, '')
      else
        old_value.transform_values { |value| value&.gsub(slug_attribute, '') }
      end
      stripped != old_value && stripped == new_value
    end

    # Re-sanitises one attribute across a scope, reporting and writing only real changes. The
    # sanitiser takes the record as well as the value, because a machine translation's rule depends
    # on which field it was translated from.
    purge = lambda do |tenant, script, scope, attribute, sanitizer, model_label|
      scope.find_each do |record|
        # The raw column, not the reader: a model may override one to merge in a default or a
        # translation, and writing that back would save a computed value as if it had been typed.
        old_value = record[attribute]
        new_value = sanitizer.call(old_value, record)
        next if new_value == old_value

        if slug_only.call(old_value, new_value)
          slug_only_skipped += 1
          next
        end

        # The report records what the sweep found; the summary records what was not written.
        script.reporter.add_change(
          old_value, new_value,
          context: { tenant: tenant.host, model: model_label, id: record.id, attribute: attribute.to_s }
        )
        affected << { host: tenant.host, model: model_label, attribute: attribute.to_s }

        emptied = blanked_locales.call(old_value, new_value)
        lost = lost_by_locale.call(old_value, new_value, emptied)
        written = value_to_write.call(record, attribute, new_value, emptied)

        row = {
          host: tenant.host, model: model_label, attribute: attribute.to_s, id: record.id,
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
        # `TenantScript` only rescues per tenant, so without this one bad row would cost the tenant
        # every sweep still to come.
        script.reporter.add_error(
          "#{e.class}: #{e.message}",
          context: { tenant: tenant.host, model: model_label, id: record.id, attribute: attribute.to_s }
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
      if slug_only_skipped.positive?
        puts "\n   ⏭️  Left alone: #{slug_only_skipped} row(s) whose only change was the dead mention attribute."
      end
      if affected.any?
        puts "\n   🧹 Purged rows by tenant:"
        affected.group_by { |row| row[:host] }.each do |host, rows|
          puts "\n      #{host}"
          rows.group_by { |row| [row[:model], row[:attribute]] }.each do |(model, attribute), group|
            puts "         #{model}##{attribute}: #{group.size}"
          end
        end
      end

      listing.call(blanked, 'Emptied - nothing survived sanitising. Set a value on each by hand:')
      listing.call(lost_text, 'Text lost outside a link. Check each one:')

      return if skipped.empty?

      puts "\n   ⏭️  Skipped on your say-so - the original value is still stored:"
      skipped.group_by { |row| row[:host] }.each do |host, rows|
        puts "\n      #{host}"
        rows.each { |row| puts "         #{row[:model]}##{row[:attribute]} #{row[:id]}" }
      end
    end

    TenantScript.run(
      'purge_stored_xss_b',
      args: args,
      description: 'purging stored XSS payloads from idea, comment, title, explanation and translation content',
      tenants: Tenant.not_deleted,
      summary: summary
    ) do |tenant, script|
      purge.call(
        tenant, script,
        Idea.where(rewritable.call('body_multiloc::text')), :body_multiloc,
        ->(value, _record) { service.sanitize_body_multiloc(value, Idea::BODY_SANITIZE_FEATURES) }, 'Idea'
      )
      plain_text_columns.each do |model, attributes|
        attributes.each do |attribute|
          purge.call(
            tenant, script,
            model.where(rewritable.call("#{attribute}::text")), attribute,
            ->(value, _record) { strip_multiloc.call(value) }, model.name
          )
        end
      end
      purge.call(
        tenant, script,
        Comment.where(rewritable.call('body_multiloc::text')), :body_multiloc,
        ->(value, _record) { service.sanitize_body_multiloc(value, Comment::BODY_SANITIZE_FEATURES) }, 'Comment'
      )
      purge.call(
        tenant, script,
        Permission.where(rewritable.call('access_denied_explanation_multiloc::text')),
        :access_denied_explanation_multiloc,
        ->(value, _record) { service.sanitize_body_multiloc(value, %i[decoration link]) }, 'Permission'
      )
      # A translation's rule depends on its own translatable_type and attribute_name, so reuse the
      # model's sanitiser rather than a value-only helper.
      purge.call(
        tenant, script,
        MachineTranslations::MachineTranslation.where(rewritable.call('translation')), :translation,
        lambda { |_value, mt|
          mt.send(:sanitize_translation)
          mt.translation
        },
        'MachineTranslation'
      )
    end
  end
end
