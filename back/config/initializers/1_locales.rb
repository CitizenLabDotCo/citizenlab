# frozen_string_literal: true

require 'i18n/backend/fallbacks'

CL2_SUPPORTED_LOCALES = %i[
  en
  ar-MA
  ar-SA
  en-GB
  en-CA
  nl-BE
  nl-NL
  fr-BE
  fr-FR
  de-DE
  it-IT
  da-DK
  nb-NO
  es-ES
  es-CL
  pl-PL
  hu-HU
  kl-GL
  lb-LU
  ro-RO
  pt-BR
  mi
  sr-Latn
  sr-SP
  hr-HR
].freeze

FALLBACK_LOCALES = %i[
  ar
  da
  de
  es
  fr
  hr
  hu
  it
  kl
  lb
  nb
  nl
  pl
  pt
  ro
  sr
].freeze

# We don't want the rest of app to rely on the fallback locales, but promote the main locales (`CL2_SUPPORTED_LOCALES`)
# instead, so let's make the fallbacks private to be sure.
private_constant :FALLBACK_LOCALES

I18n.available_locales = CL2_SUPPORTED_LOCALES + FALLBACK_LOCALES
I18n.default_locale = :en

# This allows a lookup of e.g. 'nl-NL' to fallback to 'nl'.
# In order for this to work, we need to support more locales in CL2_SUPPORTED_LOCALES than
# we actually want to support for tenants, which is why CL2_SUPPORTED_LOCALES exists in the first place.
I18n::Backend::Simple.include I18n::Backend::Fallbacks

# Load application custom translations in order to use them in other initializers (after https://stackoverflow.com/a/53918536/3585671)
I18n.load_path += Dir[Rails.root.join('config/locales/*.{rb,yml}').to_s]
