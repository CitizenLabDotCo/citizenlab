namespace :single_use do
  desc 'Migrates phases with input_term "issue" to "comment" for non-French tenants'
  task :migrate_issue_to_comment_input_term, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'

    Tenant.safe_switch_each do |tenant|
      phases = Phase.where(input_term: 'issue')
      next unless phases.any?

      locales = AppConfiguration.instance.settings.dig('core', 'locales') || []
      primary_locale = locales.first

      # Skip French-primary tenants: they had correct "problème" translations for issue
      if primary_locale&.start_with?('fr')
        puts "\nTenant #{tenant.host}: Skipping (French-primary, #{phases.count} issue phases)"
        next
      end

      puts "\nTenant #{tenant.host} (#{primary_locale}): #{phases.count} phases with input_term='issue'"
      phases.each do |phase|
        puts "  Phase #{phase.id}: '#{phase.title_multiloc.values.first}'"
      end

      if execute
        updated = phases.update_all(input_term: 'comment')
        puts "  => Updated #{updated} phases to 'comment'"
      else
        puts "  (dry run)"
      end
    end
  end
end
