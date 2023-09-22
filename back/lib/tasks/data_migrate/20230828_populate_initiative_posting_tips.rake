# frozen_string_literal: true

namespace :data_migrate do
  block_names = %w[elaborate meaningfulTitle visualise relevantAttachments shareSocialMedia]
  locale_file_url = 'https://raw.githubusercontent.com/CitizenLabDotCo/citizenlab/6e82b854cc8c05a0ea5ab2b5acf5b7ed3f76bf47/front/app/translations/%<locale>s.json'

  # docker-compose run --rm web bin/rails 'data_migrate:populate_initiative_posting_tips'
  task populate_initiative_posting_tips: :environment do |_t, _args|
    locale_files = {}
    Tenant.switch_each do |_tenant|
      posting_tips = {}
      app_config = AppConfiguration.instance

      app_config.settings('core', 'locales').each do |locale|
        locale_files[locale] ||= JSON.parse(HTTParty.get(URI.parse(format(locale_file_url, locale: locale))))

        content = block_names.map do |block_name|
          copy_path = "app.containers.InitiativesNewPage.#{block_name}"
          "<li>#{locale_files[locale][copy_path]}</li>"
        end.join
        content = "<ul>#{content}</ul>"

        posting_tips[locale] = content
      end

      app_config.settings['initiatives']['posting_tips'] = posting_tips
      app_config.save!
    end
  end

  # We need to have this copy in the BE code for defaults.
  task populate_initiative_posting_tips_from_be_locales: :environment do |_t, _args|
    Tenant.switch_each do |_tenant|
      app_config = AppConfiguration.instance
      app_config.settings['initiatives']['posting_tips'] =
        MultilocService.new.i18n_to_multiloc(
          'initiatives.default_posting_tips',
          locales: app_config.settings('core', 'locales')
        )
      app_config.save!
    end
  end

  task list_initiative_posting_tips_for_all_locales: :environment do |_t, _args|
    CL2_SUPPORTED_LOCALES.each do |locale|
      locale_file = JSON.parse(HTTParty.get(URI.parse(format(locale_file_url, locale: locale))))

      content = block_names.map do |block_name|
        copy_path = "app.containers.InitiativesNewPage.#{block_name}"
        "<li>#{locale_file[copy_path]}</li>"
      end.join
      puts "#{locale}:\n<ul>#{content}</ul>"
      puts
    end
  end
end
