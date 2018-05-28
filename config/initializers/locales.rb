require "i18n/backend/fallbacks" 
I18n.available_locales = [:en, :"en-GB", :"en-CA", :"nl-BE", :"nl-NL", :"fr-BE", :"fr-FR", :"de-DE", :"da-DK", :"nb-NO"]

# This allows a lookup of e.g. 'nl-NL' to be resolved by 'nl'
I18n::Backend::Simple.send(:include, I18n::Backend::Fallbacks)