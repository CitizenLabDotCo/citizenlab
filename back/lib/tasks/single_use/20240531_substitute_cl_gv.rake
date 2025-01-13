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
  # rubocop:disable Style/RegexpLiteral, Style/RedundantRegexpEscape, Style/StringConcatenation
  substitutions = {
    'citizenLabAddress2022' => 'govocalAddress2022',
    'citizenlabExpert' => 'govocalExpert',
    /\>citizenlab\,\<\/a\>/i => '>Go Vocal</a>,',
    /^citizenlab-/i => 'Go Vocal-',
    'soren@citizenlab.dk' => 'soren@govocal.dk',
    'eva.mayer@citizenlab.de' => 'eva.mayer@go-vocal.de',
    '@citizenlab.co' => '@govocal.com',
    'www.citizenlab.co' => 'www.govocal.com',
    'Anspachlaan 65' => 'Pachecolaan 34',
    'суппорт@цитизенлаб.цо' => 'support@govocal.com',
    /citizenlab (?!nv)/i => 'Go Vocal \1', # Do not match "Citizenlab NV"
    / citizenlab/i => ' Go Vocal',
    /ЦитизенЛаб (?!nv)/i => 'Go Vocal \1', # Do not match "ЦитизенЛаб NV"
    / ЦитизенЛаб/i => ' Go Vocal',
    /go vocal nv/i => 'Go Vocal NV',
    /CitizenLab NV/i => 'Go Vocal NV',
    /ЦитизенЛаб/i => 'Go Vocal' # Now we can change to new company name
  }
  allowed_chars_before = '>'
  allowed_chars_after = ".,:<'`"
  allowed_chars_before.chars.each do |char_before|
    regex_before = '\\' + char_before
    allowed_chars_after.chars.each do |char_after|
      regex_after = '\\' + char_after
      substitutions[/#{regex_before}citizenlab#{regex_after}/i] = "#{char_before}Go Vocal#{char_after}"
      substitutions[/#{regex_before}ЦитизенЛаб#{regex_after}/i] = "#{char_before}Go Vocal#{char_after}"
    end
  end
  # rubocop:enable Style/RegexpLiteral, Style/RedundantRegexpEscape, Style/StringConcatenation
  substitutions.each do |old_v, new_v|
    str = str.gsub(old_v, new_v)
  end
  str
end
