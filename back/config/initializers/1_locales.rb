# frozen_string_literal: true

require 'i18n/backend/fallbacks'

# Unfortunately we implicitly require the first supported locale to be `:en` in some places in the code,
# which is why this list is not in alphabetical order.
# CL-1069 is supposed to fix it.
CL2_SUPPORTED_LOCALES = %i[
  en
  ar-MA
  ar-SA
  ca-ES
  da-DK
  de-DE
  el-GR
  en-CA
  en-GB
  es-CL
  es-ES
  fr-BE
  fr-FR
  hr-HR
  hu-HU
  it-IT
  kl-GL
  lb-LU
  lv-LV
  mi
  nb-NO
  nl-BE
  nl-NL
  pl-PL
  pt-BR
  ro-RO
  sr-Latn
  sr-SP
  sv-SE
  tr-TR
].freeze

fallback_locales =
  %i[
    ar
    ca
    da
    de
    el
    es
    fr
    hr
    hu
    it
    kl
    lb
    lv
    nb
    nl
    pl
    pt
    ro
    sr
    sv
    tr
  ].freeze

I18n.available_locales = CL2_SUPPORTED_LOCALES + fallback_locales
I18n.default_locale = :en

# This allows a lookup of e.g. 'nl-NL' to fallback to 'nl'.
# In order for this to work, we need to support more locales in CL2_SUPPORTED_LOCALES than
# we actually want to support for tenants, which is why CL2_SUPPORTED_LOCALES exists in the first place.
I18n::Backend::Simple.include I18n::Backend::Fallbacks

# Load application custom translations in order to use them in other initializers (after https://stackoverflow.com/a/53918536/3585671)
I18n.load_path += Dir[Rails.root.join('config/locales/*.{rb,yml}').to_s]
