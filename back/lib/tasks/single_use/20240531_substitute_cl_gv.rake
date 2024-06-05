namespace :gv_transition do
  desc 'Replace Citizenlab by Go Vocal in all static pages.'
  task :substitute_tenants, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      StaticPage.all.each do |page|
        {
          page.title_multiloc => 'title',
          page.top_info_section_multiloc => 'top_info_section',
          page.bottom_info_section_multiloc => 'bottom_info_section'
        }.each do |multiloc, attrstr|
          multiloc.each do |locale, old_v|
            new_v = rake_20240531_substitute_gv(old_v)
            if new_v != old_v
              multiloc[locale] = new_v
              reporter.add_change(
                old_v,
                new_v,
                context: { tenant: tenant.host, page: page.slug, attribute: attrstr, locale: locale }
              )
            end
          end
        end
        if !page.save
          reporter.add_error(
            page.errors.details,
            context: { tenant: tenant.host, page: page.slug }
          )
        end
      end
    end
    reporter.report!('substitute_tenants_report.json', verbose: true)
  end

  desc 'Prepare translation files for the transition to Go Vocal'
  task :substitute_translation_files, [] => [:environment] do
    translation_file_patterns = [
      'config/locales/*.yml',
      'engines/free/email_campaigns/config/locales/*.yml',
      'front_translations/admin/*.json',
      'front_translations/*.json'
    ]
    translation_file_patterns.each do |file_pattern|
      Dir.glob(file_pattern).each do |file|
        contentstr = File.read(file)
        new_contentstr = rake_20240531_substitute_gv(contentstr)
        if new_contentstr != contentstr
          File.write(file, new_contentstr)
        end
      end
    end
  end
end

def rake_20240531_substitute_gv(str)
  {
    '@citizenlab.co' => '@govocal.com',
    'www.citizenlab.co' => 'www.govocal.com',
    /citizenlab /i => 'Go Vocal ',
    /citizenlab,/i => 'Go Vocal,',
    / citizenlab./i => ' Go Vocal.',
    'Anspachlaan 65' => 'Pachecolaan 34'
  }.each do |old_v, new_v|
    str = str.gsub(old_v, new_v)
  end
  str
end
