require 'i18n/backend/fallbacks'

CL2_SUPPORTED_LOCALES = %i[en ar-SA en-GB en-CA nl-BE nl-NL fr-BE fr-FR de-DE it-IT
                           da-DK nb-NO es-ES es-CL pl-PL hu-HU kl-GL ro-RO pt-BR mi sr-Latn].freeze

I18n.available_locales = CL2_SUPPORTED_LOCALES + %i[nl fr de it da nb es pl hu kl ro pt ar sr]

I18n.default_locale = :en

# This allows a lookup of e.g. 'nl-NL' to be resolved by 'nl' In order for
# this to work, we need to support more locales in CL2_SUPPORTED_LOCALES than
# we actually want to support for tenants, which is the reason
# CL2_SUPPORTED_LOCALES exists
I18n::Backend::Simple.include I18n::Backend::Fallbacks

# Load application custom translations in order to use them in other initializers (after https://stackoverflow.com/a/53918536/3585671)
I18n.load_path += Dir[Rails.root.join('config', 'locales', '*.{rb,yml}').to_s]
