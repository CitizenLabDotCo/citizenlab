# frozen_string_literal: true

# rubocop:disable Metrics/BlockLength
namespace :fix_existing_tenants do
  desc 'Migrate the existing related data to home_pages record, and set related values as needed'
  # Usage:
  # Dry run (no changes): rake fix_existing_tenants:migrate_home_page_data
  # Execute (changes): rake fix_existing_tenants:migrate_home_page_data['execute']
  task :migrate_home_page_data, [:execute] => [:environment] do |_t, args|
    args.with_defaults(execute: false)

    # Temporary way to kill logging when developing (to more closely match the production environment)
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    dry_run = true unless args[:execute] == 'execute'

    n = Tenant.all.count
    successful = 0
    failed = 0
    errors = []

    puts "\nProcessing #{n} tenants..."
    Tenant.all.each_with_index do |tenant, i|
      print "#{i + 1}). Processing tenant #{tenant.host}..."

      Apartment::Tenant.switch(tenant.schema_name) do
        host = tenant.schema_name.gsub('_', '.')
        config = AppConfiguration.first
        settings = config.settings
        style = config.style

        begin
          if HomePage.all.count.positive?
            home_page = HomePage.first!

            if settings['events_widget'] && settings['events_widget']['enabled']
              home_page.events_enabled = settings['events_widget']['enabled']
            end

            # These 5 conditional blocks assume all tenants have settings['core']...
            if settings['core']['currently_working_on_text']
              home_page.projects_header_multiloc = settings['core']['currently_working_on_text']
            end

            if settings['core']['display_header_avatars']
              home_page.banner_avatars_enabled = settings['core']['display_header_avatars']
            end

            if settings['core']['custom_onboarding_fallback_message']
              home_page.banner_signed_in_header_multiloc = settings['core']['custom_onboarding_fallback_message']
            end

            if settings['core']['header_title']
              home_page.banner_signed_out_header_multiloc = settings['core']['header_title']
            end

            if settings['core']['header_slogan']
              home_page.banner_signed_out_subheader_multiloc = settings['core']['header_slogan']
            end

            if style['signedOutHeaderOverlayColor']
              home_page.banner_signed_out_header_overlay_color = style['signedOutHeaderOverlayColor']
            end

            if style['signedOutHeaderOverlayOpacity']
              home_page.banner_signed_out_header_overlay_opacity = style['signedOutHeaderOverlayOpacity']
            end

            if settings['customizable_homepage_banner']
              banner = settings['customizable_homepage_banner']
              home_page.banner_enabled = banner['enabled'] if banner['enabled']
              home_page.banner_layout = banner['layout'] if banner['layout']
              home_page.cta_signed_in_type = banner['cta_signed_in_type'] if banner['cta_signed_in_type']

              if home_page.cta_signed_in_type == 'customized_button' &&
                 banner['cta_signed_in_customized_button']['text'] &&
                 banner['cta_signed_in_customized_button']['url']
                home_page.cta_signed_in_text_multiloc = banner['cta_signed_in_customized_button']['text']
                home_page.cta_signed_in_url = banner['cta_signed_in_customized_button']['url']
              end

              home_page.cta_signed_out_type = banner['cta_signed_out_type'] if banner['cta_signed_out_type']

              if home_page.cta_signed_out_type == 'customized_button' &&
                 banner['cta_signed_out_customized_button']['text'] &&
                 banner['cta_signed_out_customized_button']['url']
                home_page.cta_signed_out_text_multiloc = banner['cta_signed_out_customized_button']['text']
                home_page.cta_signed_out_url = banner['cta_signed_out_customized_button']['url']
              end

              home_page.header_bg = config.header_bg if config.header_bg

              if config.homepage_info_multiloc
                home_page.bottom_info_section_enabled = true # Must be set to true if we want to set section multiloc
                home_page.bottom_info_section_multiloc = config.homepage_info_multiloc
              end
            end

            
            if dry_run == true
              home_page.validate!
              puts "Validated HomePage: #{home_page.inspect}"
            else
              home_page.save!
              puts ' Success.'
            end

            successful += 1
          else
            failed += 1
            puts ' Error! no home_page record found.'
            errors << { index: i, host: host, message: 'has no home_page record.' }
          end
        rescue StandardError => e
          failed += 1
          puts " Error! could not save HomePage record  - #{e}."
          errors << { index: i, host: host, message: "could not save HomePage record - #{e}." }
        end
      end
    end

    puts "\nSuccessfully migrated data for #{successful} tenants."

    if failed.positive?
      puts "\nFailed to migrate data for #{failed} tenants, with the following errors:"

      errors.each do |error|
        puts "#{error[:index] + 1}). #{error[:host]}: #{error[:message]}"
      end
    end
  end
end

# rubocop:enable Metrics/BlockLength
