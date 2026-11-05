# frozen_string_literal: true

# Applies config/locales/overrides/de-AT.yml, which overrides the rails-i18n
# gem's Austrian January month name "Jänner"/"Jän" -> "Januar"/"Jan" (see that
# file for rationale).
#
# We use store_translations in a to_prepare hook rather than I18n.load_path:
# the gem's de-AT locale is appended to the load path *after* config/initializers
# run, so a plain load_path append loses the merge to the gem. store_translations
# deep-merges our data on top of whatever is already loaded (replacing the
# month_names and abbr_month_names arrays, keeping date/time formats), independent
# of load order, and to_prepare re-applies it after code reloads in development.
override_path = Rails.root.join('config/locales/overrides/de-AT.yml')

Rails.application.config.to_prepare do
  translations = YAML.load_file(override_path).fetch('de-AT')
  I18n.backend.store_translations(:'de-AT', translations)
end
