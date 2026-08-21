# frozen_string_literal: true

# Re-sanitises stored content carrying an XSS payload saved before sanitisation was added. The
# fields swept here were never HTML-sanitised at all. Sanitising on write does not touch rows
# already in the database, so this cleans the stored values in place, using each field's whole
# write-path pipeline:
#
#     Permission#access_denied_explanation_multiloc
#                                     -> SanitizationService#sanitize_body_multiloc,
#                                        Permission::EXPLANATION_SANITIZE_FEATURES
#     #description_multiloc, on each of `topic_models`
#                                     -> SanitizationService#sanitize_multiloc, decoration only, then
#                                        empty trailing tags removed
#     every column in `plain_text_columns`
#                                     -> SanitizationService#strip_multiloc_to_plain_text
#
# Idea and comment bodies, machine translations, and the `title_multiloc` of `Idea`, `Project`,
# `Phase`, `ProjectFolders::Folder`, `InputTopic`, `GlobalTopic`, `DefaultInputTopic`, `Event` and
# `StaticPage` are out of scope: `purge_stored_xss` covers them and has already been run on every
# production server.
#
# `custom_field_values` is intentionally out of scope: those answers render as escaped text on the
# front end (not an HTML sink), so they cannot execute and do not need purging.
#
# A row is written only when processing actually changes it, so clean content is left untouched
# and re-runs are no-ops. Writes use `update_columns` to avoid re-running unrelated validations on
# legacy rows.
#
# Three kinds of row cost content rather than just markup, and each is reported with its before and
# after. In execute mode each is put to the operator one at a time, because only a person can say
# whether the loss is acceptable:
#
#     emptied      sanitising left nothing, because the whole value was payload
#     lost text    words the reader could see are gone, and they were not inside a link
#     moved link   a link points somewhere else, which the word check cannot see
#
# Only the explanation is checked for moved links. Stripping a plain-text column drops every anchor
# by definition, so checking those would report every link that ever existed and bury the rest.
#
# `TenantScript` owns the dry run, the tenant loop and the report. Deleted tenants stay out; every
# other tenant can still serve content, so all of them are in scope.
#
#     rake single_use:purge_stored_xss_b                     # dry run, all tenants
#     rake 'single_use:purge_stored_xss_b[execute]'          # write, all tenants
#     rake 'single_use:purge_stored_xss_b[execute,foo.com]'  # write, one tenant
namespace :single_use do
  desc "Re-sanitise stored plain-text and access denied explanation content carrying XSS payloads. Dry run unless passed 'execute'."
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

    # The write path each topic model applies to its description. No linkifying: the editor offers
    # no way to make a link, so the models do not add them either.
    sanitize_description = lambda do |value, features|
      service.remove_multiloc_empty_trailing_tags(service.sanitize_multiloc(value, features))
    end

    # Rich text, rendered with `dangerouslySetInnerHTML`, and sanitised on write only from
    # TAN-8413 onwards - so every row stored before that is unsanitised.
    topic_models = [InputTopic, GlobalTopic, DefaultInputTopic].freeze

    # Every column declared by `PlainTextMultiloc`, minus the `title_multiloc` columns
    # `purge_stored_xss` already swept, and minus `CustomField` and `EmailCampaigns::Campaign` -
    # those two are swept by `purge_stored_xss_form_and_email_text`, which is run separately so
    # their higher risk of losing a legitimate `<` can be reviewed on its own.
    plain_text_columns = {
      Phase => %i[native_survey_title_multiloc native_survey_button_multiloc],
      Event => %i[location_multiloc address_2_multiloc attend_button_multiloc],
      StaticPage => %i[banner_header_multiloc banner_subheader_multiloc banner_cta_button_multiloc],
      Space => %i[title_multiloc],
      Area => %i[title_multiloc],
      Group => %i[title_multiloc],
      IdeaStatus => %i[title_multiloc description_multiloc],
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
    relinked = [] # rows sanitising pointed a link somewhere else
    skipped = [] # rows the operator declined to write
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

    # Words inside a link's label. A label rewritten from its own href loses whatever it said, which
    # is the pipeline working as intended rather than text going missing.
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

    # Where each link points. Compared with both escapings undone, so `&amp;` in an attribute and a
    # percent-encoded character - both of which the write path normalises - do not read as a move.
    # Only the schemes a reader could have followed: dropping a `javascript:` href is the point.
    hrefs = lambda do |value|
      found = value.to_s.scan(/<a\b[^>]*\bhref="([^"]*)"/im).flatten
      found.map { |href| CGI.unescape(CGI.unescapeHTML(href)) }.grep(SanitizationService::LINKIFIABLE_HREF)
    end

    # Destinations the value no longer has. This is the one damage the word check cannot see: a
    # payload scrubbed out of an href moves the link without touching the label that names it.
    moved_links = lambda do |old_text, new_text|
      remaining = hrefs.call(new_text).tally
      hrefs.call(old_text).filter_map do |href|
        if remaining[href].to_i.positive?
          remaining[href] -= 1
          nil
        else
          href
        end
      end
    end

    moved_by_locale = lambda do |old_value, new_value, emptied|
      unless old_value.is_a?(Hash)
        links = emptied.any? ? [] : moved_links.call(old_value, new_value)
        return links.any? ? [['-', links, 'was']] : []
      end

      old_value.filter_map do |locale, old|
        next if emptied.include?(locale)

        links = moved_links.call(old, (new_value || {})[locale])
        [locale, links, 'was'] if links.any?
      end
    end

    # Only where the record itself rejects the blank. Where a blank is legal it is left alone rather
    # than given content nobody wrote.
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
      row[:locales].each_with_object(["         #{row[:model]}##{row[:attribute]}#{tag} #{row[:id]}"]) do |(locale, words, label), lines|
        before = locale == '-' ? row[:before] : (row[:before] || {})[locale]
        after = locale == '-' ? row[:after] : (row[:after] || {})[locale]
        lines << "            #{label || 'lost'}: #{words.join(', ')}" if words
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

    # Re-sanitises one attribute across a scope, reporting and writing only real changes.
    purge = lambda do |tenant, script, scope, attribute, sanitizer, model_label, track_links: false|
      scope.find_each do |record|
        # The raw column, not the reader: a model may override one to merge in a default or a
        # translation, and writing that back would save a computed value as if it had been typed.
        old_value = record[attribute]
        new_value = sanitizer.call(old_value)
        next if new_value == old_value

        # The report records what the sweep found; the summary records what was not written.
        script.reporter.add_change(
          old_value, new_value,
          context: { tenant: tenant.host, model: model_label, id: record.id, attribute: attribute.to_s }
        )
        affected << { host: tenant.host, model: model_label, attribute: attribute.to_s }

        emptied = blanked_locales.call(old_value, new_value)
        lost = lost_by_locale.call(old_value, new_value, emptied)
        moved = track_links ? moved_by_locale.call(old_value, new_value, emptied) : []
        written = value_to_write.call(record, attribute, new_value, emptied)

        row = {
          host: tenant.host, model: model_label, attribute: attribute.to_s, id: record.id,
          before: old_value, after: written
        }
        blanked << row.merge(locales: emptied.map { |locale| [locale, nil] }) if emptied.any?
        lost_text << row.merge(locales: lost) if lost.any?
        relinked << row.merge(locales: moved) if moved.any?

        next unless script.execute?

        flagged = emptied.map { |locale| [locale, nil] } + lost + moved
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
      listing.call(relinked, 'Links that now point elsewhere. Check each one:')

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
      description: 'purging stored XSS payloads from plain text and access denied explanation content',
      tenants: Tenant.not_deleted,
      summary: summary
    ) do |tenant, script|
      plain_text_columns.each do |model, attributes|
        attributes.each do |attribute|
          purge.call(
            tenant, script,
            model.where(rewritable.call("#{attribute}::text")), attribute,
            ->(value) { strip_multiloc.call(value) }, model.name
          )
        end
      end
      topic_models.each do |model|
        purge.call(
          tenant, script,
          model.where(rewritable.call('description_multiloc::text')), :description_multiloc,
          ->(value) { sanitize_description.call(value, model::DESCRIPTION_SANITIZE_FEATURES) }, model.name
        )
      end
      purge.call(
        tenant, script,
        Permission.where(rewritable.call('access_denied_explanation_multiloc::text')),
        :access_denied_explanation_multiloc,
        ->(value) { service.sanitize_body_multiloc(value, Permission::EXPLANATION_SANITIZE_FEATURES) }, 'Permission',
        track_links: true
      )
    end
  end
end
