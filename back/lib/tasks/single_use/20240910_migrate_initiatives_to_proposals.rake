namespace :initiatives_to_proposals do
  desc 'Replace the Citizenlab default moderator with Go Vocal attributes.'
  task :migrate_proposals, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      pp rake_20240910_migrate_project_description_multiloc
      next if !AppConfiguration.instance.feature_activated?('initiatives') && !Initiative.exists?

      project = rake_20240910_create_proposals_project(reporter)
      next if !project

      rake_20240910_substitute_homepage_element(project, reporter)
      rake_20240910_replace_navbaritem(project, reporter)
      rake_20240910_migrate_input_statuses(reporter) # Overwrite the input status descriptions
      map_initiatives_to_proposals = {}
      Initiative.where.not(publication_status: 'draft').each do |initiative|
        proposal_attributes = rake_20240910_proposal_attributes(initiative, project)
        proposal = Idea.new proposal_attributes
        next if !rake_20240910_assign_idea_status(proposal, initiative, reporter)

        rake_20240910_assign_publication(proposal, initiative)
        if proposal.save
          map_initiatives_to_proposals[initiative.id] = proposal.id
          reporter.add_create(
            'Proposal',
            proposal_attributes,
            context: { tenant: tenant.host, initiative: initiative.id }
          )
        else
          reporter.add_error(
            proposal.errors.details,
            context: { tenant: tenant.host, initiative: initiative.id }
          )
          next
        end
        rake_20240910_migrate_images_files(proposal, reporter) # Idea images, idea files and text images (header background is not migrated)
        rake_20240910_migrate_topics(proposal, reporter)
        rake_20240910_migrate_reactions(proposal, reporter)
        rake_20240910_migrate_comments(proposal, reporter) # Including internal comments
        rake_20240910_migrate_official_feedback(proposal, reporter)
        rake_20240910_migrate_followers(proposal, reporter)
        rake_20240910_migrate_spam_reports(proposal, reporter)
        rake_20240910_migrate_cosponsors(proposal, reporter)
        # Should we also migrate notifications?
      end
      rake_20240910_migrate_initiatives_static_page(reporter)
      SettingsService.new.deactivate_feature!('initiatives')
    end
    reporter.report!('migrate_initiatives_to_proposals.json', verbose: true)
  end
end

task :migrate_proposals, [] => [:environment] do
  Tenant.safe_switch_each do |tenant|
    Project.find_by(slug: 'proposals')&.destroy
    SettingsService.new.activate_feature!('initiatives')
  end
end

def rake_20240910_create_proposals_project(reporter)
  config = AppConfiguration.instance
  project = Project.new(
    title_multiloc: rake_20240910_migrate_project_title_multiloc,
    description_multiloc: rake_20240910_migrate_project_description_multiloc,
    slug: 'proposals' # Does this work if there is already a project with this slug?
    # Include more project attributes
  )
  project.admin_publication_attributes = { publication_status: 'archived' } if !config.feature_activated?('initiatives')
  # Set visibility and granular permissions according to the permissions for initiatives
  if !project.save
    reporter.add_error(
      project.errors.details,
      context: { tenant: config.host, project: project.id }
    )
    return false
  end
  phase = Phase.new(
    project: project,
    title_multiloc: MultilocService.new.i18n_to_multiloc('nav_bar_items.proposals.title', locales: CL2_SUPPORTED_LOCALES),
    start_at: config.created_at,
    end_at: nil,
    participation_method: 'proposals',
    expire_days_limit: config.settings('initiatives', 'days_limit'),
    reacting_threshold: config.settings('initiatives', 'reacting_threshold'),
    prescreening_enabled: config.feature_activated?('initiative_review'),
    campaigns_settings: { project_phase_started: true }
    # Include cosponsorship settings
    # Include more phase attributes
  )
  if !phase.save
    reporter.add_error(
      phase.errors.details,
      context: { tenant: config.host, phase: phase.id }
    )
    return false
  end
  project
end

def rake_20240910_substitute_homepage_element(project, reporter)
  homepage = ContentBuilder::Layout.find_by(code: 'homepage')
  return if !homepage

  homepage.craftjs_json.map_values! do |element|
    next element if element.dig('type', 'resolvedName') != 'Proposals'

    {
      'type' => { 'resolvedName' => 'Highlight' },
      'nodes' => [],
      "props": {
          'title' => {
              'en' => 'What is your proposal?' # app.containers.landing.initiativesBoxTitle
          },
          'description' => {
              'en' => 'Post your proposal on this platform. Blablabla.' # app.containers.landing.initiativesBoxText
          },
          'primaryButtonLink' => "/projects/#{project.slug}ideas/new?phase_id=#{project.phases.first.id}",
          'primaryButtonText' => {
              'en' => 'Post your proposal'
          },
          'secondaryButtonLink' => "/projects/#{project.slug}",
          'secondaryButtonText' => {
              'en' => 'Explore all proposals'
          }
      },
      'custom' => {
          'title' => {
              'id' => 'app.containers.admin.ContentBuilder.homepage.highlight.highlightTitle',
              'defaultMessage' => 'Highlight'
          },
          'noPointerEvents' => true
      },
      'hidden' => false,
      'parent' => 'ROOT',
      'isCanvas' => false,
      'displayName' => 'Highlight',
      'linkedNodes' => {}
    }
  end
end

def rake_20240910_replace_navbaritem(project, reporter)
  item = NavBarItem.find_by(code: 'proposals')
  return if !item

  item.assign_attributes(
    code: 'custom',
    project_id: project.id
  )
  if !item.save
    reporter.add_error(
      item.errors.details,
      context: { tenant: tenant.host, nav_bar_item: item.id }
    )
  end
end

def rake_20240910_proposal_attributes(initiative, project)
  proposals_phase = project.phases.first
  # Do we want to preserve the slug?
  {
    title_multiloc: initiative.title_multiloc,
    body_multiloc: initiative.body_multiloc,
    publication_status: initiative.publication_status,
    published_at: initiative.published_at,
    author_id: initiative.author_id,
    created_at: initiative.created_at,
    updated_at: initiative.updated_at,
    location_point_geojson: initiative.location_point_geojson,
    location_description: initiative.location_description,
    assignee_id: initiative.assignee_id,
    assigned_at: initiative.assigned_at,
    author_hash: initiative.author_hash,
    anonymous: initiative.anonymous,
    submitted_at: (initiative.published_at || initiative.created_at),
    project: initiative.project,
    creation_phase: proposals_phase,
    phases: [proposals_phase]
  }
end

def rake_20240910_assign_idea_status(proposal, initiative, reporter)
  code = initiative.initiative_status.code
  status = IdeaStatus.find_by(code: code, participation_method: 'proposals')
  if status
    proposal.idea_status = status
    return true
  elsif %w[review_pending changes_requested].include?(code)
    proposal.idea_status = IdeaStatus.find_by(code: 'prescreening', participation_method: 'proposals')
    return true
  else
    reporter.add_error(
      "No matching input status found for code #{code}",
      context: { tenant: tenant.host, initiative: initiative.id, input_status_code: code }
    )
    return false
  end
end

def rake_20240910_assign_publication(proposal, initiative)
  if proposal.idea_status.public_post?
    proposal.publication_status = 'published'
    proposal.published_at = initiative.proposed_at
  else
    proposal.publication_status = 'submitted'
    proposal.submitted_at = initiative.created_at
  end
end

def rake_20240910_migrate_initiatives_static_page(reporter)
  page = StaticPage.find_by(code: 'proposals')
  return if !page

  if !page.update(code: 'custom')
    reporter.add_error(
      page.errors.details,
      context: { tenant: tenant.host, static_page: page.id }
    )
  end
end

def rake_20240910_migrate_project_title_multiloc
  multiloc = {
    "ar-MA" => "انشر مُقترحك هنا وضعه على جدول أعمال {styledOrgName}",
    "ar-SA" => "انشر مُقترحك هنا وضعه على جدول أعمال {styledOrgName}",
    "ca-ES" => "Publiqueu la vostra proposta aquí i col·loqueu-la a l'agenda de {styledOrgName}",
    "cy-GB" => "Postiwch eich cynnig yma a'i roi ar agenda {styledOrgName}",
    "da-DK" => "Aflever dit forslag her og sæt det på dagsordenen hos {styledOrgName}",
    "de-DE" => "Veröffentliche deinen Vorschlag hier und setze ihn auf die Tagesordnung von {styledOrgName}",
    "el-GR" => "Δημοσιεύστε την πρότασή σας εδώ και βάλτε την στην ημερήσια διάταξη του {styledOrgName}",
    "en-CA" => "Post your proposal here and place it on the agenda of {styledOrgName}",
    "en-GB" => "Post your proposal here and place it on the agenda of {styledOrgName}",
    "en-IE" => "Post your proposal here and place it on the agenda of {styledOrgName}",
    "en" => "Post your proposal here and place it on the agenda of {styledOrgName}",
    "es-CL" => "Sube aquí tu propuesta e instálala en la agenda de {styledOrgName}",
    "es-ES" => "Sube aquí tu propuesta e instálala en la agenda de {styledOrgName}",
    "fi-FI" => "Lähetä ehdotuksesi tähän ja laita se {styledOrgName}esityslistalle",
    "fr-BE" => "Postez votre proposition ici et récoltez du soutien pour la mettre à l’agenda",
    "fr-FR" => "Postez votre proposition ici et récoltez du soutien pour la mettre à l’agenda",
    "hr-HR" => "Objavite svoj prijedlog i stavite ga na dnevni red {styledOrgName}",
    "hu-HU" => "Post your proposal here and place it on the agenda of {styledOrgName}",
    "it-IT" => "Pubblica qui la tua proposta e mettila all'ordine del giorno di {styledOrgName}",
    "kl-GL" => "Siunnersuutit uunga allaguk, uanilu {styledOrgName} oqaluuserisassanngortillugu",
    "lb-LU" => "Verëffentlecht Äre Virschlag hei a setzt en op d’Agenda vum {styledOrgName}",
    "lv-LV" => "Publicējiet šeit savu priekšlikumu un iekļaujiet to {styledOrgName} darba kārtībā",
    "mi" => "Post your proposal here and place it on the agenda of {styledOrgName}",
    "nb-NO" => "Publiser ideen din her og sett det på agendaen til {styledOrgName}",
    "nl-BE" => "Plaats je voorstel hier en breng het op de agenda van {styledOrgName}",
    "nl-NL" => "Plaats je voorstel hier en breng het op de agenda van {styledOrgName}",
    "pl-PL" => "Opublikuj swoją propozycję tutaj i umieść ją w porządku dziennym {styledOrgName}",
    "pt-BR" => "Publique aqui a sua proposta e coloque-a na agenda de {styledOrgName}",
    "ro-RO" => "Postează aici propunerea ta și pune-o pe ordinea de zi a {styledOrgName}",
    "sr-Latn" => "Postavite vaš predlog i uputite ga na razmatranje ka {styledOrgName}",
    "sr-SP" => "Поставите свој предлог овде и ставите га на дневни ред {styledOrgName}",
    "sv-SE" => "Publicera ditt förslag här och sätt upp det på dagordningen för {styledOrgName}",
    "tr-TR" => "Önerinizi burada yayınlayın ve {styledOrgName} gündemine taşıyın"
  }
  case AppConfiguration.instance.name
  when 'KøbenhavnsKommune'
    multiloc['da-DK'] = 'Hvad er dit københavnerforslag?'
  when 'HolbækKommune'
    multiloc['da-DK'] = 'Opret dit forslag her og sæt det på dagsordenen hos Holbæk Kommune'
  end
  multiloc.to_h do |key, value|
    org_name = Locale.new(key).resolve_multiloc(AppConfiguration.instance.settings('core', 'organization_name'))
    [key, value.gsub('{styledOrgName}', org_name)]
  end
end

def rake_20240910_migrate_project_description_multiloc
  config = AppConfiguration.instance
  expire_days_limit = config.settings('initiatives', 'days_limit')
  reacting_threshold = config.settings('initiatives', 'reacting_threshold')
  page_slug = StaticPage.find_by(code: 'proposals')&.slug
  multiloc_content = {
    "ar-MA" => "ألديك مُقترح ما ترغب في إرساله إلى {orgName}، وتشعر بالفضول لمعرفة مدى دعم الناس له أيضًا؟ انشر مُقترحك هنا، وأثبت دعم الناس له من خلال جمع {constraints}، وستقوم {orgName} بمعاودة التواصل معك. {link}",
    "ar-SA" => "ألديك مُقترح ما ترغب في إرساله إلى {orgName}، وتشعر بالفضول لمعرفة مدى دعم الناس له أيضًا؟ انشر مُقترحك هنا، وأثبت دعم الناس له من خلال جمع {constraints}، وستقوم {orgName} بمعاودة التواصل معك. {link}",
    "ca-ES" => "Teniu una proposta que voleu enviar a {orgName} i teniu curiositat per veure si altres persones també la donen suport? Publiqueu-lo aquí, demostreu que és compatible amb la recopilació de {constraints} i {orgName} us respondrà. {link}",
    "cy-GB" => "Mae gennych gynnig yr ydych am ei gyflwyno i {orgName}, ac rydych yn chwilfrydig i weld a yw pobl eraill yn ei gefnogi hefyd? Postiwch ef yma, profwch ei fod yn cael ei gefnogi gan gasglu {constraints}, a bydd {orgName} yn dod yn ôl atoch. {link}",
    "da-DK" => "Du har et forslag, som du vil sende til {orgName}, og du er nysgerrig efter at se, om andre borgere også støtter det? Send det her, få {constraints}, og {orgName} vil vende tilbage til dig. {link}",
    "de-DE" => "Du hast einen Vorschlag, den du bei {orgName} einreichen möchtest, und bist neugierig, ob andere Leute ihn auch unterstützen? Poste ihn hier, sammle {constraints} und {orgName} wird sich bei dir melden. {link}",
    "el-GR" => "Έχετε μια πρόταση που θέλετε να υποβάλετε στο {orgName} και είστε περίεργοι να δείτε αν την υποστηρίζουν και άλλοι; Δημοσιεύστε την εδώ, αποδείξτε ότι υποστηρίζεται συλλέγοντας {constraints}, και ο {orgName} θα επικοινωνήσει μαζί σας. {link}",
    "en-CA" => "You have a proposal that you want to submit to {orgName}, and you're curious to see whether other people support it as well? Post it here, prove that it's supported by collecting {constraints}, and {orgName} will get back to you. {link}",
    "en-GB" => "You have a proposal that you want to submit to {orgName}, and you're curious to see whether other people support it as well? Post it here, prove that it's supported by collecting {constraints}, and {orgName} will get back to you. {link}",
    "en-IE" => "You have a proposal that you want to submit to {orgName}, and you're curious to see whether other people support it as well? Post it here, prove that it's supported by collecting {constraints}, and {orgName} will get back to you. {link}",
    "en" => "You have a proposal that you want to submit to {orgName}, and you're curious to see whether other people support it as well? Post it here, prove that it's supported by collecting {constraints}, and {orgName} will get back to you. {link}",
    "es-CL" => "¿Tienes una propuesta que quieres presentar en {orgName}, y tienes curiosidad por ver si otras personas también la apoyan? Súbela aquí, demuestra que está apoyada recogiendo {constraints}, y {orgName} se pondrá en contacto contigo. {link}",
    "es-ES" => "¿Tienes una propuesta que quieres presentar en {orgName}, y tienes curiosidad por ver si otras personas también la apoyan? Súbela aquí, demuestra que está apoyada recogiendo {constraints}, y {orgName} se pondrá en contacto contigo. {link}",
    "fi-FI" => "Sinulla on ehdotus, jonka haluat lähettää {orgName}, ja olet utelias näkemään, tukevatko sitä myös muut ihmiset? Lähetä se tänne, todista, että sitä tuetaan keräämällä {constraints}, niin {orgName} ottaa sinuun yhteyttä. {link}",
    "fr-BE" => "Vous avez une proposition à nous soumettre. Partagez la ici, obtenez {constraints} et {orgName} vous répondra. {link}",
    "fr-FR" => "Vous avez une proposition à nous soumettre. Partagez la ici, obtenez {constraints} et {orgName} vous répondra. {link}",
    "hr-HR" => "Imate prijedlog koji biste željeli predati {orgName} i zanima vas bi li ga i drugi podržali? Objavite ga ovdje i pokažite da ima podršku sakupljajući {constraints}, a {orgName} će vas kontaktirati. {link}",
    "hu-HU" => "You have a proposal that you want to submit to {orgName}, and you're curious to see whether other people support it as well? Post it here, prove that it's supported by collecting {constraints}, and {orgName} will get back to you. {link}",
    "it-IT" => "Hai una proposta che vuoi sottoporre a {orgName}, e sei curioso di vedere se anche altre persone la sostengono? Postala qui, dimostra che è supportata dalla raccolta di {constraints}, e {orgName} ti risponderà. {link}",
    "kl-GL" => "Nassiunniakkannik siunnersuutissaqarputit uunga {orgName}, takorusuppallu innuttaasut allat aamma tapersersorneraat? Ugguuna nassiutiguk, taava {constraints}-imik pissaasit, unalu {orgName} ilinnut uterumaarpoq. {link} ",
    "lb-LU" => "Dir hutt e Virschlag deen Dir op {orgName} areeche wëllt an Dir sidd virwëtzeg ob och aner Leit se ënnerstëtzen? Verëffentlecht en hei, beweist datt en ënnerstëtzt gëtt andeems Dir {Constraints} sammelt, an {orgName} kennt op Iech zréck. {link} ",
    "lv-LV" => "Jums ir priekšlikums, ko vēlaties iesniegt {orgName}, un jūs interesē, vai to atbalsta arī citi cilvēki? Ievietojiet to šeit, pierādiet, ka tas tiek atbalstīts, apkopojot {constraints}, un {orgName} ar jums sazināsies. {link}",
    "mi" => "You have a proposal that you want to submit to {orgName}, and you're curious to see whether other people support it as well? Post it here, prove that it's supported by collecting {constraints}, and {orgName} will get back to you. {link}",
    "nb-NO" => "Du har et forslag som du ønsker å sende inn til {orgName}. Er du nysgjerrig på om andre også støtter det? Publiser det her, få {constraints}, og {orgName} vil komme tilbake til deg {link}",
    "nl-BE" => "Je hebt een voorstel dat je wil voorleggen aan {orgName} en je bent benieuwd of andere mensen het ook steunen? Plaats het hier, verzamel {constraints} om te tonen dat het draagkracht heeft en {orgName} komt bij je terug. {link}",
    "nl-NL" => "Je hebt een voorstel dat je wil voorleggen aan {orgName} en je bent benieuwd of andere mensen het ook steunen? Plaats het hier, verzamel {constraints} om te tonen dat het draagkracht heeft en {orgName} komt bij je terug. {link}",
    "pl-PL" => "Masz propozycję, którą chcesz złożyć i jesteś ciekaw, czy inni ludzie też ją popierają? Umieść ją tutaj, udowodnij, że ma ona poparcie poprzez zebranie {constraints}, a {orgName} zwróci się do Ciebie. {link}",
    "pt-BR" => "Você tem uma proposta que deseja enviar para {orgName}, e está curioso para ver se outras pessoas também a apoiam? Coloque-a aqui, prove que ela é suportada coletando {constraints}, e {orgName} irá retornar para você. {link}",
    "ro-RO" => "Ai o propunere pe care dorești sa o trimiți {orgName} și ești curios să vezi dacă și alte persoane îți împărtășesc opinia? O poți posta aici pentru a strânge minimul de {constraints} și {orgName} te va contacta.",
    "sr-Latn" => "Imate predlog koji biste želeli da uputite ka {orgName}, i zanima vas da li bi ga i drugi podržali? Postavite ga ovde i pokažite da ima podršku sakupljajući {constraints}, i {orgName} će vas kontaktirati. {link}",
    "sr-SP" => "Имате предлог који желите да поднесете {orgName}, и радознали сте да видите да ли га подржавају и други људи? Објавите га овде, докажите да је подржано прикупљањем {constraints}, а {orgName} ће вам се вратити. {link}",
    "sv-SE" => "Har du ett förslag som du vill skicka till {orgName} och är nyfiken på om andra personer också stödjer det? Publicera det här, bevisa att det stöds genom att samla in {constraints}, så återkommer {orgName} till dig. {link}",
    "tr-TR" => "{orgName} için sunmak istediğiniz bir öneriniz var ve başkalarının da bunu destekleyip desteklemediğini mi merak ediyorsunuz? Burada yayınlayın ve {constraints} toplayarak önerinizin desteklendiğini kanıtlayın, {orgName} sizinle iletişim kuracaktır. {link}"
  }
  multiloc_constraints = {
    "ar-MA" => "{voteThreshold} من الأصوات خلال {daysLimit} من الأيام",
    "ar-SA" => "{voteThreshold} من الأصوات خلال {daysLimit} من الأيام",
    "ca-ES" => "{voteThreshold} vots en {daysLimit} dies",
    "cy-GB" => "{voteThreshold} pleidleisiau o fewn {daysLimit} diwrnod",
    "da-DK" => "{voteThreshold} stemmer inden for {daysLimit} dage",
    "de-DE" => "{voteThreshold} Stimmen innerhalb von {daysLimit} Tagen",
    "el-GR" => "{voteThreshold} ψήφοι εντός {daysLimit} ημερών",
    "en-CA" => "{voteThreshold} votes within {daysLimit} days",
    "en-GB" => "{voteThreshold} votes within {daysLimit} days",
    "en-IE" => "{voteThreshold} votes within {daysLimit} days",
    "en" => "{voteThreshold} votes within {daysLimit} days",
    "es-CL" => "{voteThreshold} votos en {daysLimit} días",
    "es-ES" => "{voteThreshold} votos en {daysLimit} días",
    "fi-FI" => "{voteThreshold} ääntä {daysLimit} päivän sisällä",
    "fr-BE" => "{voteThreshold} votes dans un délai de {daysLimit} jours",
    "fr-FR" => "{voteThreshold} votes dans un délai de {daysLimit} jours",
    "hr-HR" => "{voteThreshold} glasova u roku od {daysLimit} dana",
    "hu-HU" => "{voteThreshold} votes within {daysLimit} days",
    "it-IT" => "{voteThreshold} voti entro {daysLimit} giorni",
    "kl-GL" => "{voteThreshold} ullut uku iluanni taasinerit {daysLimit} ",
    "lb-LU" => "{voteThreshold} Stëmmen innerhalb vun {daysLimit} Deeg",
    "lv-LV" => "{voteThreshold} balsis {daysLimit} dienu laikā",
    "mi" => "{voteThreshold} votes within {daysLimit} days",
    "nb-NO" => "{voteThreshold} stemmer innen {daysLimit} dager",
    "nl-BE" => "{voteThreshold} stemmen in {daysLimit} dagen",
    "nl-NL" => "{voteThreshold} stemmen in {daysLimit} dagen",
    "nn-NO" => "{voteThreshold} stemmer innen {daysLimit} dager",
    "pl-PL" => "{voteThreshold} głosów w ciągu {daysLimit} dni",
    "pt-BR" => "{voteThreshold} votos dentro de {daysLimit} dias",
    "ro-RO" => "{voteThreshold} voturi în {daysLimit} zile",
    "sr-Latn" => "{voteThreshold} glasova u roku od {daysLimit} dana",
    "sr-SP" => "{voteThreshold} гласова у року од {daysLimit} дана",
    "sv-SE" => "{voteThreshold} röster inom {daysLimit} dagar",
    "tr-TR" => "{daysLimit} gün içinde {voteThreshold} oy"
  }
  multiloc_link = {
    "ar-MA" => "اعرف المزيد حول المُقترحات.",
    "ar-SA" => "اعرف المزيد حول المُقترحات.",
    "ca-ES" => "Obteniu més informació sobre com funcionen les propostes.",
    "cy-GB" => "Dysgwch fwy am sut mae cynigion yn gweithio.",
    "da-DK" =>  "Læs mere om hvordan forslag fungerer.",
    "de-DE" => "Mehr zu den Zulassungskriterien von Vorschlägen.",
    "el-GR" => "Μάθετε περισσότερα σχετικά με τον τρόπο λειτουργίας των προτάσεων.",
    "en-CA" => "Learn more about how proposals work.",
    "en-GB" => "Learn more about how proposals work.",
    "en-IE" => "Learn more about how proposals work.",
    "en" => "Learn more about how proposals work.",
    "es-CL" => "Aprende más sobre cómo funcionan las propuestas.",
    "es-ES" => "Conoce más sobre cómo funcionan las propuestas.",
    "fi-FI" => "Lue lisää ehdotusten toiminnasta.",
    "fr-BE" => "Apprenez-en plus sur le fonctionnement des propositions.",
    "fr-FR" => "Apprenez-en plus sur le fonctionnement des propositions.",
    "hr-HR" => "Saznajte kako funkcioniraju prijedlozi.",
    "hu-HU" => "Learn more about how proposals work.",
    "it-IT" => "Per saperne di più sulle proposte.",
    "kl-GL" => "Innuttaasunut siunnersuuteqartarnerup ingerlariaasia paasisaqarfigiuk",
    "lb-LU" => "Gitt méi doriwwer gewuer wéi Virschléi funktionéieren.",
    "lv-LV" => "Uzzināt vairāk par to, kā darbojas priekšlikumi.",
    "mi" => "Learn more about how proposals work.",
    "nb-NO" => "Lær mere om hvordan borger forslag fungerer.",
    "nl-BE" => "Lees meer over hoe voorstellen werken.",
    "nl-NL" => "Lees meer over hoe voorstellen werken.",
    "pl-PL" => "Dowiedz się więcej o tym, jak działają propozycje.",
    "pt-BR" => "Saiba mais sobre como as propostas funcionam.",
    "ro-RO" => "Aflați mai multe despre modul în care funcționează propunerile.",
    "sr-Latn" => "Saznajte kako funkcioniše predlaganje.",
    "sr-SP" => "Сазнајте више о томе како функционишу предлози.",
    "sv-SE" => "Läs mer om hur förslag fungerar.",
    "tr-TR" => "Önerilerin işleyiş şekli hakkında daha fazla bilgi edinin."
  }
  multiloc_content.to_h do |key, value|
    org_name = Locale.new(key).resolve_multiloc(config.settings('core', 'organization_name'))
    new_value = value.gsub('{orgName}', org_name)
    new_value = if !page_slug
      new_value.gsub('{link}', '')
    else
      link = "/#{key}/pages/#{page_slug}"
      text = if config.name == 'KøbenhavnsKommune' && key == 'da-DK'
        'Her kan du læse mere om retningslinjer og kriterier for Københavnerforslagsordningen.'
      elsif config.name == 'RegionSjælland' && key == 'da-DK'
        'Læs mere om, hvordan ordningen med borgerforslag fungerer.'
      else
        multiloc_link[key]
      end
      new_value.gsub('{link}', "<a href=\"#{link}\">#{text}</a>")
    end
    constraints_text = multiloc_constraints[key]
    case key
    when 'da-DK'
      case config.name
      when 'RegionSjælland'
        constraints_text = "Har du et forslag til, hvordan Region Sjælland kan blive sundere, grønnere og mere lige for alle? Så har du mulighed for at stille dit borgerforslag og sætte det til offentlig afstemning her på platformen. Hvis dit forslag opfylder kriterierne og opnår {constraints}, vil det blive behandlet af dine regionspolitikere. {link}"
      when 'KøbenhavnsKommune'
        constraints_text = "Har du et forslag til, hvordan København kan blive en endnu bedre by at bo og færdes i? Så har du mulighed for at stille dit københavnerforslag og sætte det til offentlig afstemning her på platformen. Hvis dit forslag opfylder kriterierne og opnår {constraints}, vil det blive behandlet af vores kommunalpolitikere. {link}"
      when 'HolbækKommune'
        constraints_text = "Har du en idé til hvordan kommunen kan blive endnu bedre, eller et forslag som du synes politikerne skal drøfte? Så opret et borgerforslag her. Hvis det opnår {constraints}, kommer det videre til Kommunalbestyrelsen. Husk at du skal være MitID-valideret for at kunne stille forslag. {link}"
      end
    end
    new_value = new_value.gsub(
      '{constraints}',
      constraints_text.gsub('{daysLimit}', expire_days_limit.to_s).gsub('{voteThreshold}', reacting_threshold.to_s)
    )
    [key, new_value]
  end
end

def rake_20240910_migrate_homepage_title_multiloc
  multiloc = {
    "ar-MA" => "ما هو مُقترحك؟",
    "ar-SA" => "ما هو مُقترحك؟",
    "ca-ES" => "Quina és la vostra proposta?",
    "cy-GB" => "Beth yw eich cynnig?",
    "da-DK" => "Hvad er dit forslag?",
    "de-DE" => "Wie lautet Ihr Vorschlag?",
    "el-GR" => "Ποια είναι η πρότασή σας;",
    "en-CA" => "What is your proposal?",
    "en-GB" => "What is your proposal?",
    "en-IE" => "What is your proposal?",
    "en" => "What is your proposal?",
    "es-CL" => "¿Cuál es tu propuesta?",
    "es-ES" => "¿Cuál es tu propuesta?",
    "fi-FI" => "Mikä on ehdotuksesi?",
    "fr-BE" => "Quelle est votre proposition ?",
    "fr-FR" => "Quelle est votre proposition ?",
    "hr-HR" => "Koji je vaš prijedlog?",
    "hu-HU" => "What is your proposal?",
    "it-IT" => "Qual è la sua proposta?",
    "kl-GL" => "Innuttaasutut siunnersuutit sunaava?",
    "lb-LU" => "Wat ass Äre Virschlag?",
    "lv-LV" => "Kāds ir jūsu priekšlikums?",
    "mi" => "E tono ana koe mō te aha?",
    "nb-NO" => "Hva er forslaget ditt?",
    "nl-BE" => "Wat is jouw voorstel?",
    "nl-NL" => "Geen plaats voor jouw plannen? Start je eigen voorstel!",
    "pl-PL" => "O czym jest twoja propozycja?",
    "pt-BR" => "Qual é a sua proposta?",
    "ro-RO" => "Care este propunerea ta?",
    "sr-Latn" => "Koji je vaš predlog?",
    "sr-SP" => "Шта је ваш предлог?",
    "sv-SE" => "Vad är ditt förslag?",
    "tr-TR" => "Öneriniz nedir?"
  }

  case AppConfiguration.instance.name
  when 'KøbenhavnsKommune'
    multiloc['da-DK'] = 'Stil og støt københavnerforslag'
  when 'RegionSjælland'
    multiloc['da-DK'] = 'Stil og støt borgerforslag'
  end

  multiloc
end

def rake_20240910_migrate_homepage_description_multiloc
  multiloc = {
    "ar-MA" => "انشر مُقترحك على هذه المنصة، احشد الدعم وضعه على جدول الأعمال. أو اطلع على مُقترحات الآخرين.",
    "ar-SA" => "انشر مُقترحك على هذه المنصة، احشد الدعم وضعه على جدول الأعمال. أو اطلع على مُقترحات الآخرين.",
    "ca-ES"=>
      "Publiqueu la vostra proposta en aquesta plataforma, reculliu suport i col·loqueu-lo a l'agenda. O reviseu els suggeriments dels altres.",
    "cy-GB" => "Postiwch eich cynnig ar y platfform hwn, casglwch gefnogaeth a rhowch ef ar yr agenda. Neu adolygwch awgrymiadau eraill.",
    "da-DK"=>
      "Du kan aflevere dit forslag på denne platform, indsamle støtte fra andre borgere og sætte det på kommunens dagsorden. Du kan også tage et kig på forslag fra andre borgere.",
    "de-DE"=>
      "Reiche deinen Vorschlag auf dieser Plattform ein, sammle dafür Unterstützung und setze ihn auf unsere Tagesordnung. Oder lass dich von anderen Vorschlägen inspirieren.",
    "el-GR"=>
      "Δημοσιεύστε την πρότασή σας σε αυτή την πλατφόρμα, συγκεντρώστε υποστήριξη και βάλτε την στην ημερήσια διάταξη. Ή εξετάστε τις προτάσεις των άλλων.",
    "en-CA" => "Post your proposal on this platform, gather support and place it on the agenda. Or review the suggestions of others.",
    "en-GB"=>
      "Post your proposal on this platform, gather support and place it on the agenda. Or review the suggestions of others.",
    "en-IE" => "Post your proposal on this platform, gather support and place it on the agenda. Or review the suggestions of others.",
    "en" => "Post your proposal on this platform, gather support and place it on the agenda. Or review the suggestions of others.",
    "es-CL" => "Publica tu propuesta en la plataforma, reúne apoyo y colócala en la agenda. O revisa las sugerencias de otros.",
    "es-ES" => "Publica tu propuesta en la plataforma, reúne apoyo y colócala en la agenda. O revisa las sugerencias de otros.",
    "fi-FI" => "Lähetä ehdotuksesi tälle alustalle, kerää tukea ja laita se asialistalle. Tai tutustu muiden ehdotuksiin.",
    "fr-BE"=>
      "Postez votre proposition sur cette plateforme, recueillez des soutiens et mettez-la à l'ordre du jour. Ou explorez simplement les propositions de vos concitoyens.",
    "fr-FR"=>
      "Postez votre proposition sur cette plateforme, recueillez des soutiens et mettez-la à l'ordre du jour. Ou explorez simplement les propositions de vos concitoyens.",
    "hr-HR" => "Objavite svoj prijedlog na ovoj platformi, prikupite podršku, stavite ga na dnevni red ili pregledajte prijedloge drugih.",
    "hu-HU" => "Post your proposal on this platform, gather support and place it on the agenda. Or review the suggestions of others.",
    "it-IT"=>
      "Pubblica la tua proposta su questa piattaforma, raccogli il sostegno e mettila all'ordine del giorno. Oppure esamina i suggerimenti degli altri.",
    "kl-GL"=>
      "Isaaffimmut uunga siunnersuutit allassinnaavat, innuttaasunit allanit tapersersorneqarsinnaavutit aamma kommunimit oqallisigisassanngortissinnaavat. Aamma innuttaasut allat siunnersuutaat atuarsinnaavatit.",
    "lb-LU"=>
      "Verëffentlecht Äre Virschlag fir administrativ Vereinfachung op dëser Plattform, sammelt Ënnerstëtzung a setzt se op d’Agenda. Oder kuckt d’Virschléi vun anere Persounen.",
    "lv-LV"=>
      "Publicējiet savu priekšlikumu šajā platformā, iegūstiet atbalstu un iekļaujiet to darba kārtībā. Vai arī izskatiet citu personu ieteikumus.",
    "mi" => "Whakairia tō tono ki tēnei pūhara, me whai tautoko, ka whakauru ai ki te rārangi take. Tirohia ngā whakaaro a ētahi atu.",
    "nb-NO"=>
      "Publiser forslaget ditt på platformen. Hent støtte fra andre innbyggere og sett forslaget på agendaen. Du kan også se andres forslag.",
    "nl-BE"=>
      "Plaats jouw voorstel op dit platform, verzamel steun en breng het op de agenda. Of discussieer mee over de voorstellen van anderen.",
    "nl-NL" => "Samen maken we het hier mooier. We leveren allemaal een bijdrage aan. Heb jij een mooi plan? Laat het ons weten!",
    "pl-PL" => "Umieść swoją propozycję na tej platformie, zbierz poparcie i umieść ją w porządku dziennym lub zapoznaj się z sugestiami innych.",
    "pt-BR" => "Publique sua proposta nesta plataforma, obtenha suporte e coloque-a na agenda. Ou revise as sugestões de outras pessoas.",
    "ro-RO" => "Postează propunerea ta pe această platformă și pune-o astfel pe ordinea de zi a primăriei!",
    "sr-Latn" => "Objavite svoj predlog na ovoj platformi, prikupite podršku, stavite ga na dnevni red ili pregledajte predloge drugih.",
    "sr-SP" => "Објавите свој предлог на овој платформи, прикупите подршку и ставите га на дневни ред. Или прегледајте предлоге других.",
    "sv-SE" => "Publicera ditt förslag på den här plattformen, samla stöd och sätt upp det på dagordningen. Eller granska andras förslag.",
    "tr-TR" => "Önerinizi bu platformda yayınlayın, destek toplayın ve gündeme yerleştirin. Veya başkalarının önerilerini inceleyin."
  }

  case AppConfiguration.instance.name
  when 'KøbenhavnsKommune'
    multiloc['da-DK'] = 'Har du et forslag til ændringer i Københavns Kommune, som du ønsker at sætte på den politiske dagsorden, kan du stille et københavnerforslag her på platformen. Du kan også se og støtte andres forslag.'
  when 'RegionSjælland'
    multiloc['da-DK'] = 'Har du et forslag til ændringer i Region Sjælland, som du ønsker at sætte på den politiske dagsorden, kan du stille et borgerforslag her på platformen. Du kan også se og støtte andres forslag.'
  end

  multiloc
end
