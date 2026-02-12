# frozen_string_literal: true

namespace :single_use do
  desc 'Migrate phase input_terms from overloaded terms to new specific terms'
  task :migrate_input_terms, [:persist] => :environment do |_task, args|
    persist = args[:persist] == 'true'

    # Mapping: (first_locale, old_input_term) → new_input_term
    # Based on analysis of how translators actually translated each term
    locale_term_migrations = {
      # issue → comment: locales where "issue" was translated as "Comment"/"Kommentar"/etc.
      ['de-DE', 'issue'] => 'comment',
      ['en', 'issue'] => 'comment',
      ['en-CA', 'issue'] => 'comment',
      ['en-GB', 'issue'] => 'comment',
      ['en-IE', 'issue'] => 'comment',
      ['fi-FI', 'issue'] => 'comment',
      ['hu-HU', 'issue'] => 'comment',
      ['lb-LU', 'issue'] => 'comment',
      ['lt-LT', 'issue'] => 'comment',
      ['mi', 'issue'] => 'comment',
      ['mi-NZ', 'issue'] => 'comment',
      ['nb-NO', 'issue'] => 'comment',
      ['nl-NL', 'issue'] => 'comment',
      ['pa-IN', 'issue'] => 'comment',
      ['sv-SE', 'issue'] => 'comment',
      ['tr-TR', 'issue'] => 'comment',
      ['ur-PK', 'issue'] => 'comment',
      ['cy-GB', 'issue'] => 'comment',
      ['ca-ES', 'issue'] => 'comment',
      ['sr-SP', 'issue'] => 'comment',
      ['sr-Latn', 'issue'] => 'comment',
      ['hr-HR', 'issue'] => 'comment',
      ['lv-LV', 'issue'] => 'comment',

      # issue → response: locales where "issue" was translated as "Response"/"Respuesta"/etc.
      ['da-DK', 'issue'] => 'response',
      ['es-CL', 'issue'] => 'response',
      ['es-ES', 'issue'] => 'response',

      # issue → topic: locales where "issue" was translated as "Topic"/"Emne"
      ['nn-NO', 'issue'] => 'topic',

      # contribution → suggestion: locales where "contribution" was translated as "Suggestion"
      ['fr-BE', 'contribution'] => 'suggestion',
      ['fr-FR', 'contribution'] => 'suggestion',

      # contribution → topic: locales where "contribution" was translated as "Topic"/"Onderwerp"
      ['nl-BE', 'contribution'] => 'topic'
    }.freeze

    # ICU hack tenant migrations (hardcoded tenant hosts)
    # da-DK DeloitteDK tenants: idea → post (because ICU hack made "Idé" display as "Indlæg" for DeloitteDK)
    # nl-BE gent tenants: issue → story (because ICU hack made issue display as "Verhaal" for gent)
    deloitte_dk_tenant_hosts = [
      # TODO: Add actual DeloitteDK tenant hosts here before running
      # e.g., 'deloitte-dk.govocal.com'
    ].freeze

    gent_nl_be_tenant_hosts = [
      # TODO: Add actual Gent tenant hosts here before running
      # e.g., 'gent.govocal.com'
    ].freeze

    stats = { total_phases: 0, migrated: 0, skipped: 0, errors: 0 }

    log = ->(msg) { puts msg }

    log.call('=== Input Term Migration ===')
    log.call("Mode: #{persist ? 'PERSIST' : 'DRY RUN'}")
    log.call('')

    Tenant.not_deleted.each do |tenant|
      Apartment::Tenant.switch(tenant.host) do
        config = AppConfiguration.instance
        first_locale = config.settings.dig('core', 'locales')&.first
        next unless first_locale

        tenant_host = tenant.host

        Phase.where(participation_method: %w[ideation proposals]).find_each do |phase|
          stats[:total_phases] += 1
          old_term = phase.input_term
          new_term = nil

          # Check ICU hack tenant overrides first
          if deloitte_dk_tenant_hosts.include?(tenant_host) && first_locale == 'da-DK' && old_term == 'idea'
            new_term = 'post'
          elsif gent_nl_be_tenant_hosts.include?(tenant_host) && first_locale == 'nl-BE' && old_term == 'issue'
            new_term = 'story'
          else
            new_term = locale_term_migrations[[first_locale, old_term]]
          end

          if new_term
            log.call("[#{tenant_host}] Phase #{phase.id}: #{old_term} → #{new_term} (locale: #{first_locale})")
            if persist
              phase.update_column(:input_term, new_term)
            end
            stats[:migrated] += 1
          else
            stats[:skipped] += 1
          end
        end
      end
    rescue StandardError => e
      log.call("[ERROR] #{tenant.host}: #{e.message}")
      stats[:errors] += 1
    end

    log.call('')
    log.call('=== Summary ===')
    log.call("Total phases checked: #{stats[:total_phases]}")
    log.call("Migrated: #{stats[:migrated]}")
    log.call("Skipped (no change needed): #{stats[:skipped]}")
    log.call("Errors: #{stats[:errors]}")
  end
end
