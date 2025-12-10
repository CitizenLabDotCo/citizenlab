# frozen_string_literal: true

namespace :fix_existing_description_videos do
  desc 'Add referrer policy to YouTube videos in HTML content'
  task youtube_iframes: :environment do
    # All models that have HTML multiloc fields that might contain iframes
    content_fields = {
      Area => %i[description_multiloc],
      Event => %i[description_multiloc],
      Idea => %i[body_multiloc],
      Phase => %i[description_multiloc],
      Project => %i[description_multiloc],
      StaticPage => %i[top_info_section_multiloc bottom_info_section_multiloc],
      ProjectFolders::Folder => %i[description_multiloc]
    }

    reporter = ScriptReporter.new

    def process_html(html)
      return html unless html

      doc = Nokogiri::HTML.fragment(html)
      modified = false
      doc.css('iframe').each do |iframe|
        src = iframe['src']
        next unless src&.include?('youtube.com')
        next if iframe['referrerpolicy'] == 'strict-origin-when-cross-origin'

        iframe['referrerpolicy'] = 'strict-origin-when-cross-origin'
        modified = true
      end
      [doc.to_s, modified]
    end

    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant #{tenant.host}..."

      content_fields.each do |model, fields|
        puts "  Processing #{model}..."
        model.find_each do |record|
          fields.each do |field|
            multiloc = record.send(field)
            next unless multiloc

            changed = false
            processed_multiloc = multiloc.transform_values do |content|
              processed_content, was_modified = process_html(content)
              changed = true if was_modified
              processed_content
            end

            if changed
              record.update_column(field, processed_multiloc)
              reporter.add_change(
                { field => multiloc },
                { field => processed_multiloc },
                context: {
                  tenant: tenant.host,
                  model: model.name,
                  record_id: record.id
                }
              )
            end
          end
        end
      end

      reporter.add_processed_tenant(tenant)
    end

    reporter.report!('youtube_iframes_referrer_policy_report.json', verbose: true)
    puts 'YouTube iframe referrer policy update completed!'
  end
end
