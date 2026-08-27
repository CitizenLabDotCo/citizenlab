# frozen_string_literal: true

namespace :id_acm do
  task :configure_rrn_field, %i[tenant_host] => [:environment] do |_t, args|
    Tenant.find_by(host: args[:tenant_host]).switch!

    puts 'Adding hidden field for RRN verification result'

    if CustomField.find_by(key: 'rrn_verfification_result')
      puts 'Hidden custom field for RRN result already exists'
      exit
    end

    puts 'Creating hidden custom field and options'
    field = CustomField.create!(resource_type: 'User', title_multiloc: { 'en' => 'RRN Verification Result', 'nl-BE' => 'RRN Verificatie Resultaat' }, key: 'rrn_verfification_result', input_type: 'select', hidden: true)
    option1 = CustomFieldOption.create!(key: 'valid', title_multiloc: { 'en' => 'Valid', 'nl-BE' => 'Geldig' }, custom_field: field)
    CustomFieldOption.create!(key: 'lives_outside', title_multiloc: { 'en' => 'Lives outside', 'nl-BE' => 'Woont buitenaf' }, custom_field: field)
    CustomFieldOption.create!(key: 'under_minimum_age', title_multiloc: { 'en' => 'Under minimum age', 'nl-BE' => 'Onder minimum leeftijd' }, custom_field: field)
    CustomFieldOption.create!(key: 'no_match', title_multiloc: { 'en' => 'No match', 'nl-BE' => 'Geen overeenkomst' }, custom_field: field)
    CustomFieldOption.create!(key: 'service_error', title_multiloc: { 'en' => 'Service error', 'nl-BE' => 'Dienst fout' }, custom_field: field)

    puts 'Creating smart group for verified users'
    Group.create!(
      slug: 'rrn-is-valid',
      title_multiloc: { 'en' => 'RRN is valid', 'nl-BE' => 'RRN is geldig' },
      membership_type: 'rules',
      rules: [{ value: option1.id, ruleType: 'custom_field_select', predicate: 'has_value', customFieldId: field.id }]
    )

    puts 'Adding field to configuration'
    config = AppConfiguration.instance
    method = config.settings['id_config']['id_methods'].find { |m| m['name'] == 'acm' }
    method['rrn_result_custom_field_key'] = field.key
    config.save!

    puts 'DONE!'
  end
end

# Helpers for the MAGDA rake tasks below.
module IdAcmMagdaRake
  module_function

  def switch_tenant!(host)
    Tenant.find_by!(host: host).switch!
  end

  # Overrides via environment variables (to probe without touching the tenant
  # settings) merged over the tenant's ACM config.
  def config
    base = IdMethodService.new.method_by_name('acm')&.config || {}
    overrides = {
      magda_endpoint: ENV.fetch('MAGDA_ENDPOINT', nil),
      magda_inschrijving_endpoint: ENV.fetch('MAGDA_INSCHRIJVING_ENDPOINT', nil),
      magda_uitschrijving_endpoint: ENV.fetch('MAGDA_UITSCHRIJVING_ENDPOINT', nil),
      magda_certificate: ENV['MAGDA_CERT_FILE'].present? ? File.read(ENV.fetch('MAGDA_CERT_FILE')) : nil,
      magda_private_key: ENV['MAGDA_KEY_FILE'].present? ? File.read(ENV.fetch('MAGDA_KEY_FILE')) : nil,
      magda_afzender_identificatie: ENV.fetch('MAGDA_IDENTIFICATIE', nil),
      magda_hoedanigheid: ENV.fetch('MAGDA_HOEDANIGHEID', nil),
      magda_sign_requests: ENV['MAGDA_SIGN'] == '0' ? false : nil
    }.compact
    base.merge(overrides)
  end

  def client(klass)
    unless klass.configured?(config)
      raise "Missing config for #{klass.name}: needs #{klass::CONFIG_KEYS.join(', ')} (tenant settings or MAGDA_* environment variables)"
    end

    klass.from_config(config)
  end

  def describe(result)
    parts = ["referte=#{result.referte}", "status=#{result.status}", "http=#{result.http_status}"]
    parts << "resultaat=#{result.resultaat}" if result.respond_to?(:resultaat) && result.resultaat
    if result.respond_to?(:found?) && result.found?
      parts += ["postcode=#{result.postal_code}", "nis=#{result.nis_code}", "birth_date=#{result.birth_date_string}"]
    end
    parts << "error=#{result.error_message}" if result.error_message.present?
    parts << "uitzonderingen=#{result.uitzonderingen.map(&:to_s).join(' | ')}" if result.uitzonderingen.any?
    parts.join(' ')
  end
end

namespace :id_acm do
  desc 'One MAGDA GeefPersoon call (with automatic repertorium registration when needed). Env overrides: MAGDA_ENDPOINT, MAGDA_INSCHRIJVING_ENDPOINT, MAGDA_CERT_FILE, MAGDA_KEY_FILE, MAGDA_IDENTIFICATIE, MAGDA_HOEDANIGHEID, MAGDA_SIGN=0 (diagnostics only). MAGDA_POSTAL_CODES=2880,2890 and MAGDA_MINIMUM_AGE=12 also run the residency check. VERBOSE=1 prints the XML. Nothing is persisted.'
  task :magda_probe, %i[tenant_host insz] => [:environment] do |_t, args|
    IdAcmMagdaRake.switch_tenant!(args[:tenant_host])
    verbose = ENV['VERBOSE'] == '1'

    # MAGDA_PROBE_SERVICE=inschrijving or =uitschrijving probes only that repertorium service.
    case ENV.fetch('MAGDA_PROBE_SERVICE', nil)
    when 'inschrijving', 'uitschrijving'
      klass = ENV['MAGDA_PROBE_SERVICE'] == 'inschrijving' ? CustomIdMethods::Magda::RegistreerInschrijvingClient : CustomIdMethods::Magda::RegistreerUitschrijvingClient
      client = IdAcmMagdaRake.client(klass)
      puts "--- endpoint: #{client.endpoint}" if verbose
      result = client.call(args[:insz])
      puts "#{klass::DIENST_NAAM.underscore}: #{IdAcmMagdaRake.describe(result)}"
      puts "--- response:\n#{result.raw_xml}" if verbose && result.raw_xml.present?
      next
    end

    gp = IdAcmMagdaRake.client(CustomIdMethods::Magda::GeefPersoonClient)
    puts "--- endpoint: #{gp.endpoint}" if verbose

    result = gp.call(args[:insz])
    puts "geef_persoon: #{IdAcmMagdaRake.describe(result)}"
    puts "--- response:\n#{result.raw_xml}" if verbose && result.raw_xml.present?

    if result.not_registered? && IdAcmMagdaRake.config[:magda_inschrijving_endpoint].present?
      ri = IdAcmMagdaRake.client(CustomIdMethods::Magda::RegistreerInschrijvingClient)
      registration = ri.call(args[:insz])
      puts "registreer_inschrijving: #{IdAcmMagdaRake.describe(registration)}"
      puts "--- response:\n#{registration.raw_xml}" if verbose && registration.raw_xml.present?
      if registration.ok?
        result = gp.call(args[:insz])
        puts "geef_persoon (retry): #{IdAcmMagdaRake.describe(result)}"
        puts "--- response:\n#{result.raw_xml}" if verbose && result.raw_xml.present?
      end
    end

    postal_codes = ENV['MAGDA_POSTAL_CODES']&.split(',')
    minimum_age = ENV.fetch('MAGDA_MINIMUM_AGE', nil)
    if postal_codes || minimum_age
      check = CustomIdMethods::Magda::ResidencyCheck.call(result, postal_codes: postal_codes, minimum_age: minimum_age)
      puts "residency_check=#{check}"
    end
  end

  desc 'MAGDA acceptance run: for every INSZ in the file (one per line, cycling until MIN_CALLS (default 50) is reached per service): RegistreerInschrijving, GeefPersoon, RegistreerUitschrijving, each with a unique referte; plus two GeefPersoon error cases. Prints one line per call and a summary. Nothing is persisted.'
  task :magda_acceptance_run, %i[tenant_host insz_file] => [:environment] do |_t, args|
    IdAcmMagdaRake.switch_tenant!(args[:tenant_host])
    gp = IdAcmMagdaRake.client(CustomIdMethods::Magda::GeefPersoonClient)
    ri = IdAcmMagdaRake.client(CustomIdMethods::Magda::RegistreerInschrijvingClient)
    ru = IdAcmMagdaRake.client(CustomIdMethods::Magda::RegistreerUitschrijvingClient)

    inszs = File.readlines(args[:insz_file], chomp: true).map(&:strip).compact_blank.uniq
    raise 'The INSZ file is empty' if inszs.empty?

    min_calls = ENV.fetch('MIN_CALLS', '50').to_i
    calls = Hash.new { |h, k| h[k] = [] }
    queue = inszs.cycle
    line = 0

    while calls['GeefPersoon'].size < min_calls
      insz = queue.next
      { 'RegistreerInschrijving' => ri, 'GeefPersoon' => gp, 'RegistreerUitschrijving' => ru }.each do |name, client|
        result = client.call(insz)
        calls[name] << [insz, result]
        puts "#{(line += 1).to_s.rjust(3)} #{name} insz=#{insz} #{IdAcmMagdaRake.describe(result)}"
      end
    end

    {
      '12345678901' => 'invalid checksum, 20002 expected',
      '00000000097' => 'unknown INSZ expected'
    }.each do |error_insz, why|
      result = gp.call(error_insz)
      calls['GeefPersoon'] << [error_insz, result]
      puts "#{(line += 1).to_s.rjust(3)} GeefPersoon insz=#{error_insz} (#{why}) #{IdAcmMagdaRake.describe(result)}"
    end

    puts '--- summary'
    calls.each do |name, results|
      puts "#{name}: calls=#{results.size} distinct_insz=#{results.map(&:first).uniq.size} " \
           "statuses=#{results.map { |_, r| r.status }.tally} " \
           "uitzonderingen=#{results.flat_map { |_, r| r.uitzondering_codes }.tally}"
    end
  end
end
