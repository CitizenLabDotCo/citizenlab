# frozen_string_literal: true

# Removes, from stored rich text, the classes and styles the sanitiser no longer keeps: any class
# but the editor's own, and any style but alignment, size, a text's colour, and a table's borders
# and spacing. With the app's classes (a fixed header's, say) or a size taken from the viewport,
# content could cover the whole page.
# Sanitising on write does not touch rows already in the database, so this runs each field's own
# write-path sanitiser over its stored value: the model's callback, or the content builder's
# layout sanitiser. No feature list is copied here, so this cannot drift from the models.
#
# A row is written only when that changes it, so clean content is left untouched and re-runs are
# no-ops. Writes use `update_columns`, which skips unrelated validations, callbacks and
# `updated_at`. Only attributes and fake videos are meant to go: a row that would lose text or an
# image is left as it is and listed, for a person to look at. The write path also applies rules
# a field got after some of its content was saved (older campaign bodies still hold an `h1`), so
# a row that would lose any other tag is left as it is too, and counted. Such a row is not
# cleaned, so one that also looks like a payload is listed, to clean by hand.
#
#     rake single_use:purge_stored_overlay_markup                       # dry run, all tenants
#     rake 'single_use:purge_stored_overlay_markup[execute]'            # write, all tenants
#     rake 'single_use:purge_stored_overlay_markup[execute,foo.com]'    # write, one tenant
namespace :single_use do
  desc "Remove app classes and overlay styles from stored rich text. Dry run unless passed 'execute'."
  task :purge_stored_overlay_markup, %i[execute host] => [:environment] do |_t, args|
    # The attributes that can make content cover the page: a row without any of them is not read.
    # The sanitiser change also keeps a few others on their own tag only (`title`, `alt`…). They
    # cannot cover anything, so they go at the row's next save.
    touched = ->(col) { %w[class= style= width= height=].map { |a| "#{col} ILIKE '%#{a}%'" }.join(' OR ') }

    # Each field with the callback that sanitises it on write.
    fields = [
      [Idea, :body_multiloc, :sanitize_body_multiloc],
      [Comment, :body_multiloc, :sanitize_body_multiloc],
      [OfficialFeedback, :body_multiloc, :sanitize_body_multiloc],
      [InternalComment, :body, :sanitize_body],
      [Phase, :description_multiloc, :sanitize_description_multiloc],
      [Phase, :draft_description_multiloc, :sanitize_draft_description_multiloc],
      [Event, :description_multiloc, :sanitize_description_multiloc],
      [Area, :description_multiloc, :sanitize_description_multiloc],
      [Space, :description_multiloc, :sanitize_description_multiloc],
      [CustomField, :description_multiloc, :sanitize_description_multiloc],
      [Volunteering::Cause, :description_multiloc, :sanitize_description_multiloc],
      [StaticPage, :top_info_section_multiloc, :sanitize_top_info_section_multiloc],
      [StaticPage, :bottom_info_section_multiloc, :sanitize_bottom_info_section_multiloc],
      [CustomForm, :print_start_multiloc, :sanitize_print_start_multiloc],
      [CustomForm, :print_end_multiloc, :sanitize_print_end_multiloc],
      [Invite, :invite_text, :sanitize_invite_text],
      # Only some campaign types sanitise these; the others are skipped below.
      [EmailCampaigns::Campaign, :body_multiloc, :sanitize_body_multiloc],
      [EmailCampaigns::Campaign, :intro_multiloc, :sanitize_intro_multiloc],
      [MachineTranslations::MachineTranslation, :translation, :sanitize_translation]
    ].freeze

    # As in `purge_stored_xss`: re-running the write path over an older mention strips its dead
    # `data-user-slug`, which rewrites a row that carries nothing to remove. Leave those alone.
    slug_attribute = /\s*data-user-slug="[^"]*"/
    # A layout's json nests deeper than a multiloc; mentions only live in a string or a multiloc.
    strip_slug = lambda do |value|
      case value
      when String then value.gsub(slug_attribute, '')
      when Hash then value.transform_values { |v| v.is_a?(String) ? v.gsub(slug_attribute, '') : v }
      else value
      end
    end
    slug_only = lambda do |old_value, new_value|
      stripped = strip_slug.call(old_value)
      stripped != old_value && stripped == new_value
    end

    # A row is listed for review when it loses a frame, an overlay style, or an unknown class from a
    # video, image, link or mention. Unknown classes on text are left out: pasted text brings them
    # by the hundred (`MsoNormal`, `p1`, `x_elementtoproof`…) and they still get removed. Older
    # `ql-` classes the editor no longer writes are content, not payloads, and so are their pieces:
    # machine translation splits some (`ql-align -justify`). A word processor's
    # `background-position` is not a `position` either. Values are compared as HTML text, so a
    # nested layout reads the same way as a multiloc.
    as_html = ->(text) { text.gsub('\\"', '"').gsub('\\u003c', '<').gsub('\\u003e', '>') }
    class_tokens = lambda do |text|
      as_html.call(text).scan(/<(?:iframe|img|a|span)\s[^>]*class="([^"]*)"/i).flatten.flat_map(&:split)
    end
    editor_class = /\A(?:ql|-|Mso)/
    overlay_style = /(?<![\w-])position\s*:|z-index\s*:|\d\s*v[hw]\b/i
    # An iframe that disappears failed the video host check: it was never a real video.
    iframe_tag = /(?:<|\\u003c)iframe\b/i
    likely_payload = lambda do |old_value, new_value|
      before, after = [old_value, new_value].map { |value| value.is_a?(String) ? value : value.to_json }
      lost_classes = class_tokens.call(before) - class_tokens.call(after)
      lost_classes.any? { |token| !token.match?(editor_class) } ||
        before.scan(overlay_style).size > after.scan(overlay_style).size ||
        before.scan(iframe_tag).size > after.scan(iframe_tag).size
    end

    # Only attributes are meant to go. A row that would lose text or an image hit something else
    # in the sanitiser: libxml2, for one, drops an attribute over 10 MB (a pasted base64 image)
    # and everything after it. Such a row is left as it is, for a person to look at.
    strings = lambda do |value|
      case value
      when String then [value]
      when Hash then value.values.flat_map { |v| strings.call(v) }
      when Array then value.flat_map { |v| strings.call(v) }
      else []
      end
    end
    visible = lambda do |value|
      html = strings.call(value).join(' ')
      # Any space, a non-breaking one included: the write path trims trailing ones. `CGI.unescapeHTML`
      # leaves `&nbsp;` encoded, so it is decoded by hand.
      text = CGI.unescapeHTML(html.gsub(/<[^>]*>/, '').gsub('&nbsp;', ' '))
      [html.scan(/<img\b/i).size, text.gsub(/[[:space:]​﻿]+/, '').size]
    end
    content_lost = lambda do |old_value, new_value|
      visible.call(new_value).zip(visible.call(old_value)).any? { |after, before| after < before }
    end
    # Fake videos are meant to go, so frames are not counted.
    tag_counts = lambda do |value|
      strings.call(value).join(' ').scan(/<([a-z][a-z0-9]*)\b/i).flatten.map(&:downcase).tally.except('iframe')
    end
    markup_lost = lambda do |old_value, new_value|
      after = tag_counts.call(new_value)
      tag_counts.call(old_value).any? { |tag, count| after.fetch(tag, 0) < count }
    end

    affected = [] # { host:, model:, attribute:, id:, payload:, before: }
    left_alone = [] # { host:, model:, attribute:, id: }
    restructured = Hash.new(0) # 'Model#attribute' => rows
    restructured_payloads = [] # { host:, model:, attribute:, id: }
    slug_only_skipped = 0

    record_change = lambda do |tenant, script, record, attribute, old_value, new_value|
      if slug_only.call(old_value, new_value)
        slug_only_skipped += 1
        return
      end

      context = { tenant: tenant.host, model: record.class.base_class.name, id: record.id, attribute: attribute.to_s }
      if content_lost.call(old_value, new_value)
        left_alone << context.merge(host: tenant.host)
        return
      end
      if markup_lost.call(old_value, new_value)
        restructured["#{context[:model]}##{attribute}"] += 1
        restructured_payloads << context.merge(host: tenant.host) if likely_payload.call(old_value, new_value)
        return
      end

      script.reporter.add_change(old_value, new_value, context: context)
      payload = likely_payload.call(old_value, new_value)
      # Only the start of a payload is printed: the whole value is in the JSON report.
      before = (old_value.is_a?(String) ? old_value : old_value.to_json).truncate(400) if payload
      affected << context.merge(host: tenant.host, payload: payload, before: before)
      record.update_columns(attribute => new_value) if script.execute?
    end

    summary = lambda do |_script|
      if slug_only_skipped.positive?
        puts "\n   ⏭️  Left alone: #{slug_only_skipped} row(s) whose only change was the dead mention attribute."
      end
      if left_alone.any?
        puts "\n   ⏭️  Left alone, content would be lost (text or an image), to look at by hand:"
        left_alone.each { |row| puts "      #{row[:host]}  #{row[:model]}##{row[:attribute]} #{row[:id]}" }
      end
      if restructured.any?
        puts "\n   ⏭️  Left alone, older markup the write path would also change (a tag, not just attributes):"
        restructured.each { |field, count| puts "      #{field}: #{count}" }
      end
      if restructured_payloads.any?
        puts "\n   ⚠️  Left alone with what looks like a payload, to clean by hand:"
        restructured_payloads.each { |row| puts "      #{row[:host]}  #{row[:model]}##{row[:attribute]} #{row[:id]}" }
      end
      if affected.any?
        puts "\n   🧹 Changed rows by tenant:"
        affected.group_by { |row| row[:host] }.each do |host, rows|
          puts "\n      #{host}"
          rows.group_by { |row| "#{row[:model]}##{row[:attribute]}" }.each do |field, group|
            puts "         #{field}: #{group.size}"
          end
        end
      end

      payloads = affected.select { |row| row[:payload] }
      return if payloads.empty?

      puts "\n   ⚠️  Likely payloads (lost a class the editor never writes, or an overlay style):"
      payloads.group_by { |row| row[:host] }.each do |host, rows|
        puts "\n      #{host}"
        rows.each do |row|
          puts "         #{row[:model]}##{row[:attribute]} #{row[:id]}"
          puts "            before: #{row[:before]}"
        end
      end
    end

    TenantScript.run(
      'purge_stored_overlay_markup',
      args: args,
      description: 'removing app classes and overlay styles from stored rich text',
      tenants: Tenant.not_deleted,
      summary: summary
    ) do |tenant, script|
      fields.each do |model, attribute, callback|
        column = model.columns_hash[attribute.to_s].type == :jsonb ? "#{attribute}::text" : attribute.to_s
        model.where(touched.call(column)).find_each do |record|
          next unless record.respond_to?(callback, true)

          # The raw column: some readers merge in default values (e.g. campaign regions).
          old_value = record[attribute].deep_dup
          record.send(callback)
          new_value = record[attribute]
          next if new_value == old_value

          record_change.call(tenant, script, record, attribute, old_value, new_value)
        rescue StandardError => e
          # `TenantScript` only rescues per tenant, so one bad row would cost the rest of the tenant.
          script.reporter.add_error(
            "#{e.class}: #{e.message}",
            context: { tenant: tenant.host, model: model.name, id: record.id, attribute: attribute.to_s }
          )
        end
      end

      layouts = ContentBuilder::LayoutSanitizationService.new
      ContentBuilder::Layout.where(touched.call('craftjs_json::text')).find_each do |layout|
        old_value = layout.craftjs_json
        # The sanitiser rewrites the json it is given in place.
        new_value = layouts.sanitize(old_value.deep_dup)
        next if new_value == old_value

        record_change.call(tenant, script, layout, :craftjs_json, old_value, new_value)
      rescue StandardError => e
        script.reporter.add_error(
          "#{e.class}: #{e.message}",
          context: { tenant: tenant.host, model: 'ContentBuilder::Layout', id: layout.id, attribute: 'craftjs_json' }
        )
      end
    end
  end
end
