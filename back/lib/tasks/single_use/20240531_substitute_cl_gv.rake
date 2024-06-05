namespace :gv_transition do
  desc 'Replace Citizenlab by Go Vocal in all static pages.'
  task :substitute_tenants, [] => [:environment] do |_t, args|
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      StaticPage.all.each do |page|
        page.title_multiloc.transform_values! do |old_v|
          rake_20240531_substitute_gv(old_v).tap do |new_v|
            if new_v != old_v
              reporter.add_change(
                old_v,
                new_v,
                context: { tenant: tenant.host, page: page.slug, attribute: 'title', locale: locale }
              )
            end
          end
        end
        page.body_multiloc.transform_values! do |old_v|
          rake_20240531_substitute_gv(old_v).tap do |new_v|
            if new_v != old_v
              reporter.add_change(
                old_v,
                new_v,
                context: { tenant: tenant.host, page: page.slug, attribute: 'body', locale: locale }
              )
            end
          end
        end
        if !page.save
          reporter.add_error(
            page.errors.details,
            context: { tenant: tenant.host, page: page.slug },
          )
        end
      end
    end
    reporter.report!('substitute_tenants_report.json', verbose: true)
  end

  desc 'Prepare translation files for the transition to Go Vocal'
  task :substitute_translation_files, [] => [:environment] do |_t, args|
    translation_files.each do |yml_file|
      yml_file.map_leaves do |leaf_str|
        rake_20240531_substitute_gv leaf_str
      end
      yml_file.write!
    end
  end
end

def rake_20240531_substitute_gv(str)
  {
    'citizenlab.co' => 'govocal.com',
    /citizenlab/i => 'Go Vocal',
    'Anspachlaan 65' => 'Pachecolaan 34'
  }.each do |old_v, new_v|
    str = str.gsub(old_v, new_v)
  end
  str
end
