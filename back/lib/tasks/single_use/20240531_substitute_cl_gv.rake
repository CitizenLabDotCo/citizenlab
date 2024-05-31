namespace :gv_transition do
  # TODO: Log all changes to a file

  desc 'Replace Citizenlab by Go Vocal in all static pages.'
  task :substitute_tenants, [] => [:environment] do |_t, args|
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      StaticPage.all.each do |page|
        page.title_multiloc.transform_values! do |old_v|
          substitute_gv(old_v).tap do |new_v|
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
          substitute_gv(old_v).tap do |new_v|
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
        substitute_gv leaf_str
      end
      yml_file.write!
    end
  end
end

def substitute_gv(str)
  str
end
