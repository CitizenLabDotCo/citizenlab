namespace :single_use do
  desc 'Migrates Phase input_term values for tenants where the term was inconsistently translated. Based on doc/idea-term-migrations.csv.'
  task :migrate_input_terms, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'

    # Migration map: { locale => { old_term => new_term } }
    # Derived from doc/idea-term-migrations.csv, excluding NULL target rows.
    migrations_by_locale = {
      'en' => { 'issue' => 'comment' },
      'en-CA' => { 'issue' => 'comment' },
      'en-GB' => { 'issue' => 'comment' },
      'en-IE' => { 'issue' => 'comment' },
      'ca-ES' => { 'issue' => 'comment' },
      'cy-GB' => { 'issue' => 'comment' },
      'de-DE' => { 'issue' => 'comment' },
      'el-GR' => { 'issue' => 'comment' },
      'fi-FI' => { 'issue' => 'comment' },
      'hr-HR' => { 'issue' => 'comment' },
      'hu-HU' => { 'issue' => 'comment' },
      'lb-LU' => { 'issue' => 'comment' },
      'lt-LT' => { 'issue' => 'comment' },
      'lv-LV' => { 'issue' => 'comment' },
      'mi' => { 'issue' => 'comment' },
      'nb-NO' => { 'issue' => 'comment' },
      'pa-IN' => { 'issue' => 'comment' },
      'sr-SP' => { 'issue' => 'comment' },
      'sv-SE' => { 'issue' => 'comment' },
      'tr-TR' => { 'issue' => 'comment' },
      'ur-PK' => { 'issue' => 'comment' },
      'da-DK' => { 'issue' => 'response', 'initiative' => 'proposal' },
      'es-CL' => { 'issue' => 'response', 'contribution' => 'proposal' },
      'es-ES' => { 'issue' => 'response', 'contribution' => 'proposal' },
      'nl-NL' => { 'issue' => 'response' },
      'nn-NO' => { 'issue' => 'topic' },
      'pt-BR' => { 'contribution' => 'proposal' },
      'fr-BE' => { 'contribution' => 'suggestion' },
      'fr-FR' => { 'contribution' => 'suggestion' },
      'nl-BE' => { 'contribution' => 'topic' }
    }

    total_updated = 0

    Tenant.safe_switch_each do |tenant|
      locales = AppConfiguration.instance.settings.dig('core', 'locales') || []
      primary_locale = locales.first

      next unless primary_locale

      term_map = migrations_by_locale[primary_locale]
      next unless term_map

      term_map.each do |old_term, new_term|
        phases = Phase.where(input_term: old_term)
        next unless phases.any?

        puts "#{tenant.host} (#{primary_locale}): #{phases.count} phase(s) with '#{old_term}' -> '#{new_term}'"

        if execute
          begin
            updated = phases.update_all(input_term: new_term)
            total_updated += updated
            puts "  OK: Updated #{updated} phase(s)"
          rescue StandardError => e
            puts "  ERROR: #{e.message}"
          end
        end
      end
    end

    puts "\n#{'[DRY RUN] ' unless execute}Total phases updated: #{total_updated}"
    puts 'Run with [execute] to apply changes.' unless execute
  end
end
