require "i18n/backend/fallbacks"

CL2_SUPPORTED_LOCALES = [:en, :"en-GB", :"en-CA", :"nl-BE", :"nl-NL", :"fr-BE", :"fr-FR", :"de-DE", :"da-DK", :"nb-NO"]

I18n.available_locales = CL2_SUPPORTED_LOCALES + [:nl, :fr, :de, :da, :nb]


# This allows a lookup of e.g. 'nl-NL' to be resolved by 'nl' In order for
# this to work, we need to support more locales in CL2_SUPPORTED_LOCALES than
# we actually want to support for tenants, which is the reason
# CL2_SUPPORTED_LOCALES exists
I18n::Backend::Simple.send(:include, I18n::Backend::Fallbacks)