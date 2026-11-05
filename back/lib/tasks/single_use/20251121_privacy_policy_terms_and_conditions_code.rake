namespace :fix_existing_tenants do
  desc 'Fix custom fields orderings and make sure the first field is a page.'
  task :privacy_policy_terms_and_conditions_code, [] => [:environment] do
    reporter = ScriptReporter.new
    slug2code = {
      'privacy-policy' => 'privacy-policy',
      'terms-and-conditions' => 'terms-and-conditions'
    }
    Tenant.all.each do |tenant|
      tenant.switch do
        slug2code.each do |slug, code|
          page = StaticPage.where(slug:).where.not(code:).first
          next unless page

          prev_code = page.code
          page.code = code
          if page.save
            reporter.add_change(
              prev_code,
              code,
              context: { tenant: tenant.host, page: page.id }
            )
          else
            reporter.add_error(
              page.errors.details,
              context: { tenant: tenant.host, page: page.id }
            )
          end
        end
      end
    end
    reporter.report!('fix_privacy_policy_terms_and_conditions_code_report.json', verbose: true)
  end
end
