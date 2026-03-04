# frozen_string_literal: true

CANNONICAL_TRANSLATION_ID_MASK = 'app.components.app.containers.AdminPage.ProjectEdit.__TERM__Term'

TRANSLATION_ID_MASKS = [
  'app.components.app.containers.AdminPage.ProjectEdit.__TERM__Term',
  'app.containers.IdeaCards.__TERM__Term',
  'app.containers.IdeaButton.addA__TERM__',
  'app.components.ProjectCard.x__TERM__s',
  'app.components.ProjectCard.submitYour__TERM__',
  'app.components.ProjectCard.viewThe__TERM__s',
  'app.containers.Projects.__TERM__s',
  'app.containers.Projects.seeThe__TERM__s',
  'app.containers.IdeasFeedPage.showAll__TERM__s',
  'app.containers.IdeasFeedPage.seeAll__TERM__s',
  'app.containers.IdeasFeedPage.addA__TERM__',
  'app.containers.IdeasNewPage.__TERM__MetaTitle1',
  'app.containers.IdeasNewPage.api_error___TERM___title_multiloc_too_long',
  'app.containers.IdeasNewPage.api_error___TERM___title_multiloc_too_short',
  'app.containers.IdeasNewPage.api_error___TERM___description_multiloc_too_long',
  'app.containers.IdeasNewPage.api_error___TERM___description_multiloc_too_short',
  'app.containers.IdeasNewPage.ajv_error___TERM___title_multiloc_maxLength',
  'app.containers.IdeasNewPage.ajv_error___TERM___title_multiloc_minLength',
  'app.containers.IdeasNewPage.ajv_error___TERM___body_multiloc_maxLength',
  'app.containers.IdeasNewPage.ajv_error___TERM___body_multiloc_minLength',
  'app.containers.IdeasShow.__TERM__TwitterMessage',
  'app.containers.IdeasShow.__TERM__WhatsAppMessage',
  'app.containers.IdeasShow.__TERM__EmailSharingSubject',
  'app.containers.IdeasShow.__TERM__EmailSharingBody',
  'app.containers.IdeasShow.__TERM__SharingModalTitle',
  'app.components.PostComponents.SharingModalContent.__TERM__EmailSharingSubject',
  'app.components.PostComponents.SharingModalContent.__TERM__EmailSharingBody',
  'app.components.PostComponents.SharingModalContent.__TERM__WhatsAppMessage',
  'app.containers.NotificationMenu.userCommentedOn__TERM__YouFollow',
  'app.containers.NotificationMenu.invitationToCosponsor__TERM__',
  'app.containers.NotificationMenu.officialFeedbackOn__TERM__YouFollow',
  'app.containers.AdminPage.ProjectEdit.new__TERM__',
  'app.containers.IdeasEditPage.__TERM__FormTitle',
  'app.components.admin.PostManager.__TERM__FormTitle',
  'app.utils.IdeasNewPage.__TERM__FormTitle',
  'app.components.ParticipationCTABars.see__TERM__s',
  'app.utils.IdeasNewPage.viewYour__TERM__'
]

# Explicit overrides for translation IDs that deviate from the mask pattern.
# The mask convention: __TERM__ is replaced with the term, capitalized when
# in a camelCase middle position (after a lowercase letter), lowercase otherwise.
# Only deviating terms are listed here.
TRANSLATION_IDS = {
  'app.components.app.containers.AdminPage.ProjectEdit.__TERM__Term' => {
    'issue' => 'app.components.app.containers.AdminPage.ProjectEdit.issueTerm1'
  },
  'app.containers.IdeaCards.__TERM__Term' => {
    'contribution' => 'app.containers.IdeaCards.contributions',
    'proposal' => 'app.containers.IdeaCards.proposals',
    'initiative' => 'app.containers.IdeaCards.initiatives',
    'petition' => 'app.containers.IdeaCards.petitions'
  },
  'app.containers.IdeaButton.addA__TERM__' => {
    'idea' => 'app.containers.IdeaButton.submitYourIdea',
    'option' => 'app.containers.IdeaButton.addAnOption',
    'issue' => 'app.containers.IdeaButton.submitAnIssue',
    'initiative' => 'app.containers.IdeaButton.addAnInitiative'
  },
  'app.components.ProjectCard.x__TERM__s' => {
    'comment' => 'app.components.ProjectCard.xCommentsTerm',
    'story' => 'app.components.ProjectCard.xStories'
  },
  'app.components.ProjectCard.submitYour__TERM__' => {
    'question' => 'app.components.ProjectCard.joinDiscussion',
    'contribution' => 'app.components.ProjectCard.contributeYourInput',
    'issue' => 'app.components.ProjectCard.submitAnIssue',
    'option' => 'app.components.ProjectCard.addYourOption'
  },
  'app.components.ProjectCard.viewThe__TERM__s' => {
    'story' => 'app.components.ProjectCard.viewTheStories'
  },
  'app.containers.Projects.__TERM__s' => {
    'issue' => 'app.containers.Projects.issues1',
    'comment' => 'app.containers.Projects.commentsTerm',
    'response' => 'app.containers.Projects.responsesTerm',
    'suggestion' => 'app.containers.Projects.suggestionsTerm',
    'topic' => 'app.containers.Projects.topicsTerm',
    'post' => 'app.containers.Projects.postsTerm',
    'story' => 'app.containers.Projects.storiesTerm'
  },
  'app.containers.Projects.seeThe__TERM__s' => {
    'story' => 'app.containers.Projects.seeTheStories'
  },
  'app.containers.IdeasFeedPage.showAll__TERM__s' => {
    'story' => 'app.containers.IdeasFeedPage.showAllStories'
  },
  'app.containers.IdeasFeedPage.seeAll__TERM__s' => {
    'idea' => 'app.containers.IdeasFeedPage.seeAllIdeas2',
    'topic' => 'app.containers.IdeasFeedPage.seeAllTopicsTerm',
    'story' => 'app.containers.IdeasFeedPage.seeAllStories'
  },
  'app.containers.IdeasFeedPage.addA__TERM__' => {
    'idea' => 'app.containers.IdeasFeedPage.addAnIdea',
    'issue' => 'app.containers.IdeasFeedPage.addAnIssue',
    'option' => 'app.containers.IdeasFeedPage.addAnOption',
    'initiative' => 'app.containers.IdeasFeedPage.addAnInitiative'
  },
  'app.containers.IdeasNewPage.__TERM__MetaTitle1' => {
    'idea' => 'app.containers.IdeasNewPage.ideaNewMetaTitle1'
  },
  'app.containers.IdeasNewPage.ajv_error___TERM___title_multiloc_maxLength' => {
    'idea' => 'app.containers.IdeasNewPage.ajv_error_idea_title_multiloc_maxLength1'
  },
  'app.containers.IdeasNewPage.ajv_error___TERM___title_multiloc_minLength' => {
    'question' => 'app.containers.IdeasNewPage.ajv_error_question_title_multiloc_minLength1',
    'contribution' => 'app.containers.IdeasNewPage.ajv_error_contribution_title_multiloc_minLength1',
    'project' => 'app.containers.IdeasNewPage.ajv_error_project_title_multiloc_minLength1',
    'option' => 'app.containers.IdeasNewPage.ajv_error_option_title_multiloc_minLength1',
    'proposal' => 'app.containers.IdeasNewPage.ajv_error_proposal_title_multiloc_minLength1',
    'initiative' => 'app.containers.IdeasNewPage.ajv_error_initiative_title_multiloc_minLength1',
    'petition' => 'app.containers.IdeasNewPage.ajv_error_petition_title_multiloc_minLength1'
  },
  'app.containers.IdeasNewPage.ajv_error___TERM___body_multiloc_minLength' => {
    'option' => 'app.containers.IdeasNewPage.ajv_error_option_body_multiloc_minLength1'
  },
  'app.containers.IdeasShow.__TERM__TwitterMessage' => {
    'issue' => 'app.containers.IdeasShow.issueTwitterMessage1'
  },
  'app.containers.IdeasShow.__TERM__WhatsAppMessage' => {
    'issue' => 'app.containers.IdeasShow.issueWhatsAppMessage1'
  },
  'app.containers.IdeasShow.__TERM__EmailSharingSubject' => {
    'issue' => 'app.containers.IdeasShow.issueEmailSharingSubject1'
  },
  'app.containers.IdeasShow.__TERM__EmailSharingBody' => {
    'issue' => 'app.containers.IdeasShow.issueEmailSharingBody1'
  },
  'app.containers.IdeasShow.__TERM__SharingModalTitle' => {
    'idea' => 'app.containers.IdeasShow.sharingModalTitle',
    'issue' => 'app.containers.IdeasShow.issueSharingModalTitle1'
  },
  'app.components.PostComponents.SharingModalContent.__TERM__EmailSharingSubject' => {
    'idea' => 'app.components.PostComponents.SharingModalContent.ideaEmailSharingSubjectText',
    'issue' => 'app.components.PostComponents.SharingModalContent.issueEmailSharingSubject1'
  },
  'app.components.PostComponents.SharingModalContent.__TERM__EmailSharingBody' => {
    'question' => 'app.components.PostComponents.SharingModalContent.questionEmailSharingModalContentBody',
    'issue' => 'app.components.PostComponents.SharingModalContent.issueEmailSharingBody1'
  },
  'app.components.PostComponents.SharingModalContent.__TERM__WhatsAppMessage' => {
    'issue' => 'app.components.PostComponents.SharingModalContent.issueWhatsAppMessage1'
  },
  'app.containers.IdeasEditPage.__TERM__FormTitle' => {
    'idea' => 'app.containers.IdeasEditPage.formTitle',
    'issue' => 'app.containers.IdeasEditPage.issueFormTitle1'
  },
  'app.components.admin.PostManager.__TERM__FormTitle' => {
    'idea' => 'app.components.admin.PostManager.formTitle'
  },
  'app.utils.IdeasNewPage.__TERM__FormTitle' => {
    'issue' => 'app.utils.IdeasNewPage.issueFormTitle2'
  },
  'app.components.ParticipationCTABars.see__TERM__s' => {
    'story' => 'app.components.ParticipationCTABars.seeStories'
  }
}.freeze

CANNONICAL_TRANSLATION_IDS = {
  'issue' => 'app.components.app.containers.AdminPage.ProjectEdit.issueTerm1'
}.freeze

# Source of truth for canonical input term translations per locale.
# Sourced from doc/Cannonical input terms.csv. Looked up first; falls back
# to the translation file value of CANNONICAL_TRANSLATION_ID_MASK when absent.
CANNONICAL_TERMS = {
  'ar-MA' => { 'idea' => 'الفكرة', 'question' => 'سؤال', 'contribution' => 'مساهمة', 'project' => 'مشروع', 'option' => 'خيار' },
  'ar-SA' => { 'idea' => 'الفكرة', 'question' => 'سؤال', 'contribution' => 'مساهمة', 'project' => 'مشروع', 'option' => 'خيار', 'proposal' => 'عرض', 'initiative' => 'مبادرة', 'petition' => 'التماس' },
  'ca-ES' => { 'idea' => 'Idea', 'question' => 'Pregunta', 'contribution' => 'Contribució', 'project' => 'Project', 'option' => 'Opció' },
  'cy-GB' => { 'idea' => 'Syniad', 'question' => 'Cwestiwn', 'contribution' => 'Cyfraniad', 'project' => 'Prosiect', 'option' => 'Opsiwn', 'proposal' => 'Cynnig', 'initiative' => 'Menter', 'petition' => 'Deiseb' },
  'da-DK' => { 'idea' => 'Idé', 'question' => 'Spørgsmål', 'contribution' => 'Bidrag', 'project' => 'Projekt', 'issue' => 'Problem', 'option' => 'Mulighed', 'proposal' => 'Forslag', 'initiative' => 'Initiativ', 'petition' => 'Underskrift', 'comment' => 'Kommentar', 'response' => 'Svar', 'suggestion' => 'Udspil', 'topic' => 'Emne', 'post' => 'Opslag', 'story' => 'Historie' },
  'de-DE' => { 'idea' => 'Idee', 'question' => 'Frage', 'contribution' => 'Beitrag', 'project' => 'Projekt', 'issue' => 'Mängel', 'option' => 'Option', 'proposal' => 'Vorschlag', 'initiative' => 'Initiative', 'petition' => 'Petition', 'comment' => 'Kommentar', 'response' => 'Antwort', 'suggestion' => 'Vorschlag', 'topic' => 'Thema', 'post' => 'Beitrag', 'story' => 'Story' },
  'el-GR' => { 'idea' => 'Ιδέα', 'question' => 'Ερώτηση', 'contribution' => 'Συνεισφορά', 'project' => 'Project', 'option' => 'Επιλογή' },
  'en-CA' => { 'idea' => 'Idea', 'question' => 'Question', 'contribution' => 'Contribution', 'project' => 'Project', 'option' => 'Option', 'proposal' => 'Proposal', 'initiative' => 'Initiative', 'petition' => 'Petition' },
  'en-GB' => { 'idea' => 'Idea', 'question' => 'Question', 'contribution' => 'Contribution', 'project' => 'Project', 'option' => 'Option', 'proposal' => 'Proposal', 'initiative' => 'Initiative', 'petition' => 'Petition' },
  'en-IE' => { 'idea' => 'Idea', 'question' => 'Question', 'contribution' => 'Contribution', 'project' => 'Project', 'option' => 'Option', 'proposal' => 'Proposal', 'initiative' => 'Initiative', 'petition' => 'Petition' },
  'en' => { 'idea' => 'Idea', 'question' => 'Question', 'contribution' => 'Contribution', 'project' => 'Project', 'issue' => 'Issue', 'option' => 'Option', 'proposal' => 'Proposal', 'initiative' => 'Initiative', 'petition' => 'Petition', 'comment' => 'Comment', 'response' => 'Response', 'suggestion' => 'Suggestion', 'topic' => 'Topic', 'post' => 'Post', 'story' => 'Story' },
  'es-CL' => { 'idea' => 'Idea', 'question' => 'Pregunta', 'contribution' => 'Propuesta', 'project' => 'Proyecto', 'issue' => 'Asunto', 'option' => 'Opción', 'proposal' => 'Propuesta', 'initiative' => 'Iniciativa', 'petition' => 'Petición', 'comment' => 'Comentario', 'response' => 'Respuesta', 'suggestion' => 'Sugerencia', 'topic' => 'Tema', 'post' => 'Publicación', 'story' => 'Experiencia' },
  'es-ES' => { 'idea' => 'Idea', 'question' => 'Pregunta', 'contribution' => 'Propuesta', 'project' => 'Proyecto', 'issue' => 'Asunto', 'option' => 'Opción', 'proposal' => 'Propuesta', 'initiative' => 'Iniciativa', 'petition' => 'Petición', 'comment' => 'Comentario', 'response' => 'Respuesta', 'suggestion' => 'Sugerencia', 'topic' => 'Tema', 'post' => 'Publicación', 'story' => 'Experiencia' },
  'fi-FI' => { 'idea' => 'Idea', 'question' => 'Kysymys', 'contribution' => 'Osallistuminen', 'project' => 'Projekti', 'issue' => 'Kysymys', 'option' => 'Vaihtoehto', 'proposal' => 'Ehdotus', 'initiative' => 'Aloite', 'petition' => 'Vetoomus', 'comment' => 'Kommentti', 'response' => 'Vastaus', 'suggestion' => 'Ehdotus', 'topic' => 'Aihe', 'post' => 'Julkaisu', 'story' => 'Tarina' },
  'fr-BE' => { 'idea' => 'Idée', 'question' => 'Question', 'contribution' => 'Contribution', 'project' => 'Projet', 'issue' => 'Problème', 'option' => 'Option', 'proposal' => 'Proposition', 'initiative' => 'Initiative', 'petition' => 'Pétition', 'comment' => 'Commentaire', 'response' => 'Réponse', 'suggestion' => 'Suggestion', 'topic' => 'Thème', 'post' => 'Publication', 'story' => 'Témoignage' },
  'fr-FR' => { 'idea' => 'Idée', 'question' => 'Question', 'contribution' => 'Contribution', 'project' => 'Projet', 'issue' => 'Problème', 'option' => 'Option', 'proposal' => 'Proposition', 'initiative' => 'Initiative', 'petition' => 'Pétition', 'comment' => 'Commentaire', 'response' => 'Réponse', 'suggestion' => 'Suggestion', 'topic' => 'Thème', 'post' => 'Publication', 'story' => 'Témoignage' },
  'hr-HR' => { 'idea' => 'Ideja', 'question' => 'Pitanje', 'contribution' => 'Doprinos', 'project' => 'Projekt', 'option' => 'Opcija', 'proposal' => 'Prijedlog', 'initiative' => 'Inicijativa', 'petition' => 'Peticija' },
  'hu-HU' => { 'idea' => 'Idea', 'question' => 'Question', 'contribution' => 'Contribution', 'project' => 'Project', 'option' => 'Option' },
  'it-IT' => { 'idea' => 'Idea', 'question' => 'Domanda', 'contribution' => 'Contributo', 'project' => 'Progetto', 'issue' => 'Problema', 'option' => 'Opzione', 'proposal' => 'Proposta', 'initiative' => 'Iniziativa', 'petition' => 'Petizione', 'comment' => 'Commento', 'response' => 'Parere', 'suggestion' => 'Suggerimento', 'topic' => 'Tema', 'post' => 'Post', 'story' => 'Esperienza' },
  'kl-GL' => { 'idea' => 'Isumassarsiaq', 'question' => 'Apeqqut', 'contribution' => 'Ilanngussaq', 'project' => 'Suliniut', 'option' => 'Qinigassaq' },
  'lb-LU' => { 'idea' => 'Iddi', 'question' => 'Fro', 'contribution' => 'Bäitrag', 'project' => 'Projet', 'option' => 'Optioun' },
  'lt-LT' => { 'idea' => 'Idėja', 'question' => 'Klausimas', 'contribution' => 'Įnašas', 'project' => 'Projektas', 'option' => 'Galimybė', 'proposal' => 'Pasiūlymas', 'initiative' => 'Iniciatyva', 'petition' => 'Peticija' },
  'lv-LV' => { 'idea' => 'Ideja', 'question' => 'Jautājums', 'contribution' => 'Ieguldījums', 'project' => 'Projekts', 'option' => 'Iespēja', 'proposal' => 'Priekšlikums', 'initiative' => 'Iniciatīva', 'petition' => 'Lūgumraksts' },
  'mi-NZ' => { 'idea' => 'Idea', 'question' => 'Question', 'contribution' => 'Contribution', 'project' => 'Project', 'option' => 'Option' },
  'mi' => { 'idea' => 'Idea', 'question' => 'Question', 'contribution' => 'Contribution', 'project' => 'Project', 'option' => 'Option' },
  'nb-NO' => { 'idea' => 'Idé', 'question' => 'Spørsmål', 'contribution' => 'Innspill', 'project' => 'Prosjekt', 'issue' => 'Problem', 'option' => 'Alternativ', 'proposal' => 'Forslag', 'initiative' => 'Initiativ', 'petition' => 'Underskrift', 'comment' => 'Kommentar', 'response' => 'Svar', 'suggestion' => 'Forslag', 'topic' => 'Tema', 'post' => 'Forum', 'story' => 'Historie' },
  'nl-BE' => { 'idea' => 'Idee', 'question' => 'Vraag', 'contribution' => 'Onderwerp', 'project' => 'Project', 'option' => 'Optie', 'proposal' => 'Voorstel', 'initiative' => 'Initiatief', 'petition' => 'Petitie' },
  'nl-NL' => { 'idea' => 'Idee', 'question' => 'Vraag', 'contribution' => 'Bijdrage', 'project' => 'Project', 'issue' => 'Probleem', 'option' => 'Optie', 'proposal' => 'Voorstel', 'initiative' => 'Initiatief', 'petition' => 'Petitie', 'comment' => 'Opmerking', 'response' => 'Reactie', 'suggestion' => 'Suggestie', 'topic' => 'Thema', 'post' => 'Bericht', 'story' => 'Verhaal' },
  'nn-NO' => { 'idea' => 'Idé', 'question' => 'Spørsmål', 'contribution' => 'Bidrag', 'project' => 'Prosjekt', 'option' => 'Alternativ' },
  'pa-IN' => { 'idea' => 'ਵਿਚਾਰ', 'question' => 'ਸਵਾਲ', 'contribution' => 'ਯੋਗਦਾਨ', 'project' => 'ਪ੍ਰੋਜੈਕਟ', 'option' => 'ਵਿਕਲਪ', 'proposal' => 'ਪ੍ਰਸਤਾਵ', 'initiative' => 'ਪਹਿਲ', 'petition' => 'ਪਟੀਸ਼ਨ' },
  'pl-PL' => { 'idea' => 'Pomysł', 'question' => 'Pytanie', 'contribution' => 'Wkład', 'project' => 'Projekt', 'option' => 'Opcja', 'proposal' => 'Propozycja', 'initiative' => 'Inicjatywa', 'petition' => 'Petycja' },
  'pt-BR' => { 'idea' => 'Ideia', 'question' => 'Pergunta', 'contribution' => 'Proposta', 'project' => 'Projeto', 'option' => 'Opcao', 'proposal' => 'Proposta', 'initiative' => 'Iniciativa', 'petition' => 'Petição' },
  'ro-RO' => { 'idea' => 'Ideea', 'question' => 'Întrebare', 'contribution' => 'Contribuție', 'project' => 'Proiect', 'option' => 'Opțiune' },
  'sr-Latn' => { 'idea' => 'Ideja', 'question' => 'Pitanje', 'contribution' => 'Doprinos', 'project' => 'Projekti', 'option' => 'Opcija', 'proposal' => 'Proposal', 'initiative' => 'Initiative', 'petition' => 'Petition' },
  'sr-SP' => { 'idea' => 'Идеја', 'question' => 'Питање', 'contribution' => 'Допринос', 'project' => 'Пројекат', 'option' => 'Опција', 'proposal' => 'Proposal', 'initiative' => 'Initiative', 'petition' => 'Petition' },
  'sv-SE' => { 'idea' => 'Idé', 'question' => 'Fråga', 'contribution' => 'Bidrag', 'project' => 'Projekt', 'issue' => 'Problem', 'option' => 'Alternativ', 'proposal' => 'Förslag', 'initiative' => 'Initiativ', 'petition' => 'Framställning', 'comment' => 'Kommentar', 'response' => 'Svar', 'suggestion' => 'Utspel', 'topic' => 'Ämne', 'post' => 'Inlägg', 'story' => 'Berättelse' },
  'tr-TR' => { 'idea' => 'Fikir', 'question' => 'Soru', 'contribution' => 'Katkı', 'project' => 'Proje', 'option' => 'Seçenek', 'proposal' => 'Teklif', 'initiative' => 'İnisiyatif', 'petition' => 'Dilekçe' },
  'ur-PK' => { 'idea' => 'خیال', 'question' => 'سوال', 'contribution' => 'شراکت', 'project' => 'پروجیکٹ', 'option' => 'آپشن', 'proposal' => 'تجویز', 'initiative' => 'پہل', 'petition' => 'پٹیشن' }
}.freeze

def admin_id?(id)
  id.include?('admin') || id.include?('Admin')
end

def get_frontend_translation(locale, key)
  if admin_id?(key)
    @admin_translations ||= {}
    @admin_translations[locale] ||= JSON.parse(File.read("../front/app/translations/admin/#{locale}.json"))
    @admin_translations[locale][key] || raise("Admin translation #{key} not found for locale #{locale}")
  else
    @translations ||= {}
    @translations[locale] ||= JSON.parse(File.read("../front/app/translations/#{locale}.json"))
    @translations[locale][key] || raise("Translation #{key} not found for locale #{locale}")
  end
end

# Resolves the actual translation ID for a given mask and term.
# Checks TRANSLATION_IDS for explicit overrides first, then falls back
# to smart replacement: capitalize term when in camelCase middle position.
def resolve_translation_id(mask, term)
  override = TRANSLATION_IDS.dig(mask, term)
  return override if override

  # If the character before term is a letter, we assume it's camelCase and capitalize the term, otherwise we use lowercase.
  if /[a-zA-Z]__TERM__/.match?(mask)
    mask.gsub('__TERM__', term.capitalize)
  else
    mask.gsub('__TERM__', term.downcase)
  end
end

namespace :input_term do
  desc 'Update all translations that depend on input_term to be consistent with the cannonical translation'
  # This tasks assumes that ../front is available within the environemnt, which is not the case from within the normal Docker development container.
  # To resolve, temporate add the following to docker-compose.yml, under web.volumes: `- "./front:/citizenlab/front"``
  task make_consistent: :environment do
    locales = (I18n.available_locales - %i[ar-MA ca-ES]).freeze

    locales.each do |locale|
      if File.exist?("../front/app/translations/corrections/#{locale}.json")
        puts "Skipping locale '#{locale}' because the correction files already exist'"
        next
      end
      Phase::INPUT_TERMS.each do |term|
        puts "Processing term '#{term}' for locale '#{locale}'"
        # Look up canonical term: CSV lookup table first, then fall back to translation file
        cannonical_translated_term = CANNONICAL_TERMS.dig(locale.to_s, term)
        if cannonical_translated_term.nil?
          begin
            cannonical_term_id = CANNONICAL_TRANSLATION_IDS[term] || CANNONICAL_TRANSLATION_ID_MASK.gsub('__TERM__', term)
            cannonical_translated_term = get_frontend_translation(locale.to_s, cannonical_term_id)
          rescue StandardError => e
            puts "Cannonical translation for term '#{term}' not found for locale '#{locale}', skipping..."
            next
          end
        end

        term_translations = TRANSLATION_ID_MASKS.each_with_object({}) do |mask, translations|
          translation_id = resolve_translation_id(mask, term)
          begin
            translation = get_frontend_translation(locale, translation_id)
          rescue StandardError => e
            puts "Translation for ID '#{translation_id}' not found for locale '#{locale}', skipping..."
            next
          end
          translations[translation_id] = translation
        end

        prompt = "
        The following is a list of translations for the term '#{term}' in the locale '#{locale}'. The cannonical translation in #{locale} should be '#{cannonical_translated_term}'.
        Please update all the translations to make use of the cannonical translation of '#{term}', while maintaining grammatical correctness and using the appropriate case (capitalize the first letter if necessary, otherwise use lowercase). If the term is not used, leave the translation as is. Here are the translations that need to be updated:
        ```
        #{JSON.pretty_generate(term_translations)}
        ```
        Return the updated translations in JSON, where the keys are the translation IDs and the values are the updated translations.
        "
        # puts prompt

        llm_output = Analysis::LLM::Gemini3Flash.new.chat(prompt, response_schema: {
          type: 'object',
          properties: term_translations.transform_values { |_translation| { type: 'string' } },
          required: term_translations.keys
        })

        # puts llm_output

        # parsed_output = JSON.parse(llm_output)
        parsed_output = llm_output # Assuming the LLM output is already a parsed JSON object as per the response schema
        # We append to ../front/app/translations/corrections/<locale>.json only those translations that have changed, so that we can easily review the changes and then manually apply them in crowdin
        changed_non_admin = parsed_output.select { |id, translation| term_translations[id] != translation && !admin_id?(id) }
        changed_admin = parsed_output.select { |id, translation| term_translations[id] != translation && admin_id?(id) }

        [
          ["../front/app/translations/corrections/#{locale}.json", changed_non_admin],
          ["../front/app/translations/corrections/admin/#{locale}.json", changed_admin]
        ].each do |path, new_entries|
          next if new_entries.empty?

          existing = File.exist?(path) && !File.empty?(path) ? JSON.parse(File.read(path)) : {}
          existing.merge!(new_entries)
          File.write(path, JSON.pretty_generate(existing))
        end

        # Print the corrections (original to updated) to the console for easy review
        parsed_output.each do |id, updated_translation|
          original_translation = term_translations[id]
          if original_translation != updated_translation
            puts "Correction: #{id}: '#{original_translation}' => '#{updated_translation}'"
          end
        end
      end
    end
  end
end
