# frozen_string_literal: true

# DEV-ONLY helper. Seeds projects (and a folder) whose legacy `description_multiloc`
# exercises every case the WYSIWYG → Content Builder migration must preserve:
# plain text, headings/lists/links, inline images (TextImage refs), video embeds,
# CTA buttons, a kitchen-sink across all locales, and one with a missing locale.
#
# These are created as plain WYSIWYG descriptions (NOT on the Content Builder), so
# you can then run single_use:migrate_descriptions_to_content_builder against them
# and compare the rendered citizen page to the original.
#
# Idempotent (skips slugs that already exist). Defaults to the localhost tenant.
#
#   docker compose run web bundle exec rake content_builder_migration:seed_test_descriptions
#   docker compose run web bundle exec rake content_builder_migration:seed_test_descriptions HOST=localhost
namespace :content_builder_migration do
  desc 'DEV: seed projects/folder with WYSIWYG descriptions covering every migration case.'
  task seed_test_descriptions: :environment do
    host = ENV.fetch('HOST', 'localhost')
    tenant = Tenant.find_by(host: host)
    raise "No tenant found for host #{host.inspect}" unless tenant

    tenant.switch do
      created = CONTENT_BUILDER_MIGRATION_TEST_CASES.filter_map do |test_case|
        seed_test_project(test_case)
      end

      folder = seed_test_folder
      created << folder if folder

      Rails.logger.info "✅ Seeded #{created.size} new description(s) on #{host}."
      created.each { |record| Rails.logger.info "   - #{record.class.name} /#{record.slug}" }
      Rails.logger.info 'ℹ️  Re-run is idempotent; existing slugs are skipped.'
    end
  end
end

# A 1×1 red PNG, rendered at width 200 so it is clearly visible once resolved.
CB_TEST_IMAGE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

def cb_plain_text_html(label)
  "<p>#{label}: a plain paragraph describing the project.</p>"
end

def cb_rich_text_html(label)
  <<~HTML.squish
    <h2>#{label}</h2>
    <p>Intro paragraph with a <a href="https://example.com" target="_blank" rel="noreferrer noopener nofollow">link</a>.</p>
    <ul><li>First point</li><li>Second point</li></ul>
    <ol><li>Step one</li><li>Step two</li></ol>
  HTML
end

def cb_inline_image_html(label)
  %(<p>#{label} with an inline image below:</p><p><img src="#{CB_TEST_IMAGE_DATA_URL}" width="200" alt="Test image"></p>)
end

def cb_video_html(label)
  %(<p>#{label} with a video embed:</p><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>)
end

def cb_button_html(label)
  %(<p>#{label} with a CTA button:</p><p><a class="custom-button" href="https://example.com" target="_blank" rel="noreferrer noopener nofollow">Take the survey</a></p>)
end

def cb_kitchen_sink_html(label)
  [
    cb_rich_text_html(label),
    cb_inline_image_html(label),
    cb_video_html(label),
    cb_button_html(label)
  ].join
end

# locales on the localhost tenant: en, fr-BE, nl-BE, nl-NL
def cb_multiloc(&)
  %w[en fr-BE nl-BE nl-NL].index_with(&)
end

CONTENT_BUILDER_MIGRATION_TEST_CASES = [
  { slug: 'cb-test-plain-text', kind: :plain_text },
  { slug: 'cb-test-rich-text', kind: :rich_text },
  { slug: 'cb-test-inline-image', kind: :inline_image },
  { slug: 'cb-test-video-embed', kind: :video },
  { slug: 'cb-test-cta-button', kind: :button },
  { slug: 'cb-test-kitchen-sink', kind: :kitchen_sink },
  { slug: 'cb-test-missing-locale', kind: :missing_locale }
].freeze

def cb_description_for(kind)
  case kind
  when :plain_text then cb_multiloc { |loc| cb_plain_text_html(loc) }
  when :rich_text then cb_multiloc { |loc| cb_rich_text_html(loc) }
  when :inline_image then cb_multiloc { |loc| cb_inline_image_html(loc) }
  when :video then cb_multiloc { |loc| cb_video_html(loc) }
  when :button then cb_multiloc { |loc| cb_button_html(loc) }
  when :kitchen_sink then cb_multiloc { |loc| cb_kitchen_sink_html(loc) }
  when :missing_locale
    # English only — nl-NL/nl-BE/fr-BE intentionally absent.
    { 'en' => cb_kitchen_sink_html('en') }
  end
end

def seed_test_project(test_case)
  return if Project.find_by(slug: test_case[:slug])

  Project.create!(
    slug: test_case[:slug],
    title_multiloc: cb_multiloc { |loc| "[CB test] #{test_case[:slug]} (#{loc})" },
    description_multiloc: cb_description_for(test_case[:kind]),
    visible_to: 'public',
    admin_publication_attributes: {}
  )
rescue StandardError => e
  Rails.logger.info "   ❌ Failed to seed project #{test_case[:slug]}: #{e.message}"
  nil
end

def seed_test_folder
  slug = 'cb-test-folder'
  return if ProjectFolders::Folder.find_by(slug: slug)

  ProjectFolders::Folder.create!(
    slug: slug,
    title_multiloc: cb_multiloc { |loc| "[CB test] folder (#{loc})" },
    description_multiloc: cb_multiloc { |loc| cb_kitchen_sink_html(loc) },
    description_preview_multiloc: cb_multiloc { |loc| "Folder preview (#{loc})" },
    admin_publication_attributes: {}
  )
rescue StandardError => e
  Rails.logger.info "   ❌ Failed to seed folder #{slug}: #{e.message}"
  nil
end
