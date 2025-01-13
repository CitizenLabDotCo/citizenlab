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
  cy-GB
  da-DK
  de-DE
  el-GR
  en-CA
  en-GB
  en-IE
  es-CL
  es-ES
  fi-FI
  fr-BE
  fr-FR
  hr-HR
  hu-HU
  it-IT
  kl-GL
  lb-LU
  lt-LT
  lv-LV
  mi
  nb-NO
  nl-BE
  nl-NL
  pa-IN
  pl-PL
  pt-BR
  ro-RO
  sr-Latn
  sr-SP
  sv-SE
  tr-TR
  ur-PK
].freeze

fallback_locales =
  %i[
    ar
    ca
    cy
    da
    de
    el
    es
    fi
    fr
    hr
    hu
    it
    kl
    lb
    lt
    lv
    nb
    nl
    pl
    pt
    ro
    sr
    sr-Cyrl
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
