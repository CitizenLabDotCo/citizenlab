# frozen_string_literal: true

require 'nlpcloud'

module Analysis
  module NLPCloudHelpers
    # from https://docs.nlpcloud.com/#multilingual-add-on
    LOCALE_MAPPING = {
      'en' => nil, # English is the default
      'ar-MA' => 'ary_Arab', # Arabic (Morocco) is not present
      'ar-SA' => 'arb_Arab',
      'ca-ES' => 'cat_Latn',
      'cy-GB' => 'cym_Latn',
      'da-DK' => 'dan_Latn',
      'de-DE' => 'deu_Latn',
      'el-GR' => 'ell_Grek',
      'en-CA' => nil,   # English is the default
      'en-GB' => nil,   # English is the default
      'en-IE' => nil,   # English is the default
      'es-CL' => 'spa_Latn',   # Spanish (Chile) is not present
      'es-ES' => 'spa_Latn',
      'fi-FI' => 'fin_Latn',
      'fr-BE' => 'fra_Latn',   # French (Belgium) is not present
      'fr-FR' => 'fra_Latn',
      'hr-HR' => 'hrv_Latn',
      'hu-HU' => 'hun_Latn',
      'it-IT' => 'ita_Latn',
      'kl-GL' => nil,   # Kalaallisut (Greenland) is not present
      'lb-LU' => 'ltz_Latn',
      'lt-LT' => 'lit_Latn',
      'lv-LV' => 'lav_Latn',
      'mi' => nil,      # Maori is not present
      'nb-NO' => 'nob_Latn',
      'nl-BE' => 'nld_Latn',
      'nl-NL' => 'nld_Latn',
      'pa-IN' => nil,   # Punjabi (Gurmukhi) is not present
      'pl-PL' => 'pol_Latn',
      'pt-BR' => 'por_Latn',
      'ro-RO' => 'ron_Latn',
      'sr-Latn' => nil, # Serbian (Latin script) is not present
      'sr-SP' => 'srp_Cyrl',
      'sv-SE' => 'swe_Latn',
      'tr-TR' => 'tur_Latn',
      'ur-PK' => 'urd_Arab'
    }.with_indifferent_access.freeze

    def retry_rate_limit(retry_count = 10, interval = 5)
      retry_count.times do |retry_attempt_no|
        break yield(retry_attempt_no)
      rescue RestClient::TooManyRequests
        puts "NLPCloud 429: Too many requests. Retrying in #{interval}s (attempt #{retry_attempt_no + 1}/#{retry_count})"
        sleep interval
      rescue Errno::ENETUNREACH
        puts "NLPCloud unreachable. Retrying in #{interval}s (attempt #{retry_attempt_no + 1}/#{retry_count})"
        sleep interval
      end
    end

    def nlp_cloud_client_for(model, locale = nil, **options)
      @nlp_clients ||= {}
      lang = locale && cl_to_nlpc_locale(locale)
      @nlp_clients[locale] ||= NLPCloud::Client.new(
        model,
        ENV.fetch('NLPCLOUD_TOKEN'),
        **options.merge(lang ? { lang: lang } : {})
      )
    end

    private

    def cl_to_nlpc_locale(cl_locale)
      LOCALE_MAPPING[cl_locale]
    end
  end
end
