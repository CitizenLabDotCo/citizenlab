require 'json'

namespace :homepage do
  desc 'Replaces legacy projects widget with new widgets on template tenants'
  task :migrate_template_homepage_layouts, [] => [:environment] do
    # Temporary way to kill logging when developing (to more closely match the production environment)
    dev_null = Logger.new('/dev/null')
    Rails.logger = dev_null
    ActiveRecord::Base.logger = dev_null

    # reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      puts "\nChecking tenant #{tenant.host} \n\n"
      next unless tenant.host.include?('template')

      puts "Updating homepage layout for tenant #{tenant.host}...\n\n"

      layout = ContentBuilder::Layout.find_by(code: 'homepage')
      craftjs = layout.craftjs_json

      # All existing template tenants have the legacy projects widget,
      # but this may be useful if we fail to update all and need to re-run the script
      next unless craftjs['ROOT']['nodes'].include?('PROJECTS')

      projects_index = craftjs['ROOT']['nodes'].index('PROJECTS')
      craftjs['ROOT']['nodes'].delete_at(projects_index) # Remove the old widget name from the nodes array

      # Insert the new widget names in reverse order, at the index of the legacy projects widget
      %w[FINISHED_OR_ARCHIVED OPEN_TO_PARTICIPATION FOLLOWED_ITEMS].each do |name|
        craftjs['ROOT']['nodes'].insert(projects_index, name)
      end

      locales = AppConfiguration.instance.settings('core', 'locales')
      utils = Utils120324.new

      # Insert the craftjs for the new widgets
      craftjs['FOLLOWED_ITEMS'] = utils.followed(locales)
      craftjs['OPEN_TO_PARTICIPATION'] = utils.open_to(locales)
      craftjs['FINISHED_OR_ARCHIVED'] = utils.finished(locales)

      craftjs.delete('PROJECTS') # Remove the old widget's craftjs

      layout.update!(craftjs_json: craftjs)
    end
  end
end

class Utils120324
  def finished(locales)
    {
      type: { resolvedName: 'FinishedOrArchived' },
      nodes: [],
      props: {
        filterBy: 'finished_and_archived',
        titleMultiloc: title_multiloc(locales, finished_title)
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'FinishedOrArchived',
      linkedNodes: {}
    }
  end

  def open_to(locales)
    {
      type: { resolvedName: 'OpenToParticipation' },
      nodes: [],
      props: {
        titleMultiloc: title_multiloc(locales, open_to_title)
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'OpenToParticipation',
      linkedNodes: {}
    }
  end

  def followed(locales)
    {
      type: { resolvedName: 'FollowedItems' },
      nodes: [],
      props: {
        titleMultiloc: title_multiloc(locales, followed_title)
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'FollowedItems',
      linkedNodes: {}
    }
  end

  private

  def title_multiloc(locales, title)
    locales.index_with do |locale|
      title[locale]
    end
  end

  # Since this is a single-use task, we can hardcode the translations.
  # I have a script to get these to get the translations from the front-end codebase,
  # so I will update these if they change or if we change the selection of widgets we are inserting
  # just before running the task

  def finished_title
    {
      'ar-MA' => 'You said, we did...',
      'lv-LV' => 'Jūs teicāt, mēs to darījām...',
      'es-CL' => 'Lo que dijiste, lo que hicimos...',
      'el-GR' => 'You said, we did...',
      'en-CA' => 'You said, we did...',
      'it-IT' => 'You said, we did...',
      'ur-PK' => 'تم نے کہا ہم نے...',
      'fr-BE' => "Vous avez dit, nous l'avons fait...",
      'nn-NO' => 'You said, we did...',
      'es-ES' => 'Lo que dijiste, lo que hicimos...',
      'tr-TR' => 'Sen söyledin, biz yaptık.',
      'ar-SA' => 'لقد قلت، لقد فعلنا...',
      'mi-NZ' => 'You said, we did...',
      'en' => 'You said, we did...',
      'hu-HU' => 'You said, we did...',
      'en-IE' => 'You said, we did...',
      'sv-SE' => 'Du sa, vi gjorde...',
      'ro-RO' => 'You said, we did...',
      'pa-IN' => 'ਤੁਸੀਂ ਕਿਹਾ, ਅਸੀਂ ਕੀਤਾ ...',
      'lt-LT' => 'Jūs sakėte, mes tai padarėme...',
      'pl-PL' => 'Powiedziałeś, zrobiliśmy...',
      'nl-BE' => 'Jij zei, wij deden...',
      'sr-Latn' => 'You said, we did...',
      'kl-GL' => 'You said, we did...',
      'hr-HR' => 'Rekli ste, jesmo...',
      'da-DK' => 'Du sagde, vi gjorde...',
      'nb-NO' => 'Du sa, vi gjorde...',
      'pt-BR' => 'Você disse, nós fizemos...',
      'de-DE' => 'Ihr habt gesagt, wir haben gemacht...',
      'ca-ES' => 'You said, we did...',
      'sr-SP' => 'You said, we did...',
      'fr-FR' => "Vous avez dit, nous l'avons fait...",
      'mi' => 'You said, we did...',
      'nl-NL' => 'Jij zei, wij deden...',
      'en-GB' => 'You said, we did...',
      'cy-GB' => 'Fe ddywedoch chi, fe wnaethon ni ...',
      'fi-FI' => 'Sanoit, teimme...',
      'lb-LU' => 'You said, we did...',
      'ach-UG' => 'crwdns3621247:0crwdne3621247:0'
    }
  end

  def open_to_title
    {
      'ar-MA' => 'Open to participation',
      'lv-LV' => 'Atvērts dalībai',
      'es-CL' => 'Abierto a la participación',
      'el-GR' => 'Open to participation',
      'en-CA' => 'Open to participation',
      'it-IT' => 'Open to participation',
      'ur-PK' => 'شرکت کے لیے کھلا ہے۔',
      'fr-BE' => 'Ouvert à la participation',
      'nn-NO' => 'Open to participation',
      'es-ES' => 'Abierto a la participación',
      'tr-TR' => 'Katılıma açık',
      'ar-SA' => 'مفتوح للمشاركة',
      'mi-NZ' => 'Open to participation',
      'en' => 'Open to participation',
      'hu-HU' => 'Open to participation',
      'en-IE' => 'Open to participation',
      'sv-SE' => 'Öppet för deltagande',
      'ro-RO' => 'Open to participation',
      'pa-IN' => 'ਭਾਗੀਦਾਰੀ ਲਈ ਖੁੱਲ੍ਹਾ ਹੈ',
      'lt-LT' => 'Atviras dalyvavimas',
      'pl-PL' => 'Otwarty na uczestnictwo',
      'nl-BE' => 'Open voor deelname',
      'sr-Latn' => 'Open to participation',
      'kl-GL' => 'Open to participation',
      'hr-HR' => 'Otvoren za sudjelovanje',
      'da-DK' => 'Åben for deltagelse',
      'nb-NO' => 'Åpent for deltakelse',
      'pt-BR' => 'Aberto à participação',
      'de-DE' => 'Offen für Beteiligung',
      'ca-ES' => 'Open to participation',
      'sr-SP' => 'Open to participation',
      'fr-FR' => 'Ouvert à la participation',
      'mi' => 'Open to participation',
      'nl-NL' => 'Open voor deelname',
      'en-GB' => 'Open to participation',
      'cy-GB' => 'Agored i gymryd rhan',
      'fi-FI' => 'Avoin osallistumiselle',
      'lb-LU' => 'Open to participation',
      'ach-UG' => 'crwdns3477979:0crwdne3477979:0'
    }
  end

  def followed_title
    {
      'ar-MA' => 'For you',
      'lv-LV' => 'Jums',
      'es-CL' => 'Para ti',
      'el-GR' => 'For you',
      'en-CA' => 'For you',
      'it-IT' => 'For you',
      'ur-PK' => 'آپ کے لیے',
      'fr-BE' => 'Pour vous',
      'nn-NO' => 'For you',
      'es-ES' => 'Para ti',
      'tr-TR' => 'Senin için',
      'ar-SA' => 'لك',
      'mi-NZ' => 'For you',
      'en' => 'For you',
      'hu-HU' => 'For you',
      'en-IE' => 'For you',
      'sv-SE' => 'För dig',
      'ro-RO' => 'For you',
      'pa-IN' => 'ਤੁਹਾਡੇ ਲਈ',
      'lt-LT' => 'Jums',
      'pl-PL' => 'Dla Ciebie',
      'nl-BE' => 'Voor jou',
      'sr-Latn' => 'For you',
      'kl-GL' => 'For you',
      'hr-HR' => 'Za vas',
      'da-DK' => 'For dig',
      'nb-NO' => 'For deg',
      'pt-BR' => 'Para você',
      'de-DE' => 'Für Dich',
      'ca-ES' => 'For you',
      'sr-SP' => 'For you',
      'fr-FR' => 'Pour vous',
      'mi' => 'For you',
      'nl-NL' => 'Voor jou',
      'en-GB' => 'For you',
      'cy-GB' => 'I chi',
      'fi-FI' => 'Sinulle',
      'lb-LU' => 'For you',
      'ach-UG' => 'crwdns3573579:0crwdne3573579:0'
    }
  end
end
