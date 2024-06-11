require 'rails_helper'

describe 'rake substitute_cl_gv' do
  before { load_rake_tasks_if_not_loaded }

  describe 'rake_20240531_substitute_gv' do
    it 'works or something' do
      [
        'test Go Vocal text',
        'citizenlab.co/citizenlab-test',
        'https://citizenlabco.typeform.com/to/z7baRP?source={url}',
        'https://support.citizenlab.co/fr/articles/8512834-utilisez-les-donnees-de-citizenlab-dans-powerbi',
        'https://support.citizenlab.co/en/articles/1346397-what-are-the-recommended-dimensions-and-sizes-of-the-platform-images',
        'https://developers.citizenlab.co/api',
        'https://academy.citizenlab.co/',
        'https://community.citizenlab.co',
        '{citizenLabLink} is committed to',
        'хттпс://суппорт.цитизенлаб.цо/артицлес/1771605'

     ].each do |original|
        expect(rake_20240531_substitute_gv(original)).to eq(original)
      end

      {
        'citizenLabAddress2022' => 'govocalAddress2022',
        'citizenlabExpert' => 'govocalExpert', 
        'Log into the CitizenLab platform of {tenantName} | CitizenLab' => 'Log into the Go Vocal platform of {tenantName} | Go Vocal',
        'datos de CitizenLab. Configurará todas' => 'datos de Go Vocal. Configurará todas',
        'CitizenLab lähetti' => 'Go Vocal lähetti',
        '<p>Citizenlab ha' => '<p>Go Vocal ha',
        '<p> CitizenLab’s platform' => '<p> Go Vocal’s platform',
        '<p>CitizenLab, Kullanıcıları' => '<p>Go Vocal, Kullanıcıları',
        'durch CitizenLab.</p>' => 'durch Go Vocal.</p>',
        '<h2>Eigentumsrechte CitizenLab</h2>' => '<h2>Eigentumsrechte Go Vocal</h2>',
        "TMG:\nCitizenLab (Hauptgeschäftsstelle)" => "TMG:\nGo Vocal (Hauptgeschäftsstelle)",
        'την Citizenlab, είτε' => 'την Go Vocal, είτε',
        'η CitizenLab: Drukpersstraat' => 'η Go Vocal: Drukpersstraat',
        'test support@citizenlab.co to CitizenLab text' => 'test support@govocal.com to Go Vocal text',
        '<p>Kontakt-E-Mail-Adresse: support@citizenlab.co</p>' => '<p>Kontakt-E-Mail-Adresse: support@govocal.com</p>',
        '<a href="mailto:support@citizenlab.co" target="_blank">Contactez-nous</a>' => '<a href="mailto:support@govocal.com" target="_blank">Contactez-nous</a>',
        'volgend e-mailadres: hello@citizenlab.co.</p>' => 'volgend e-mailadres: hello@govocal.com.</p>',
        'The citizenlab address is: <p>CitizenLab NV - Anspachlaan 65 - 1000 Brussels - Belgium</p>' => 'The Go Vocal address is: <p>CitizenLab NV - Pachecolaan 34 - 1000 Brussels - Belgium</p>',
        'citizenlab.co/citizenlab-test' => 'citizenlab.co/citizenlab-test',
        "(<a href=\"https://www.citizenlab.co/en\" target=\"_blank\">CitizenLab</a>," => "(<a href=\"https://www.govocal.com/en\" target=\"_blank\">Go Vocal</a>,",
        "(<a href=\"https://www.citizenlab.co/en\" target=\"_blank\">CitizenLab,</a>" => "(<a href=\"https://www.govocal.com/en\" target=\"_blank\">Go Vocal</a>,",
        'provide your personal data to Citizenlab.' => 'provide your personal data to Go Vocal.',
        'CitizenLab-ekspert' => 'Go Vocal-ekspert',
        'dine CitizenLab-data.' => 'dine Go Vocal-data.',
        'din CitizenLab-platform,' => 'din Go Vocal-platform,',
        'omistajan ja CitizenLabin kaikista' => 'omistajan ja Go Vocalin kaikista',
        'um auf Citizenlab-Daten in' => 'um auf Go Vocal-Daten in',
        'između CitizenLaba i' => 'između Go Vocala i',
        'dati Citizenlabu ili' => 'dati Go Vocalu ili',
        'at CitizenLabs suspenderer' => 'at Go Vocals suspenderer',
        'Paasissutissat CitizenLabip aammalu' => 'Paasissutissat Go Vocalip aammalu',
        "sahibini ve CitizenLab'i, yüklediğiniz" => "sahibini ve Go Vocal'i, yüklediğiniz",
        "ve Citizenlab'in kişisel" => "ve Go Vocal'in kişisel",
        "verilerinizi Citizenlab'e verip" => "verilerinizi Go Vocal'e verip",
        "Ayrıca, Citizenlab'den kişisel" => "Ayrıca, Go Vocal'den kişisel",
        "<p>Citizenlab'e sağladığınız" => "<p>Go Vocal'e sağladığınız",
        'käyttää CitizenLab-tietojasi Power BI' => 'käyttää Go Vocal-tietojasi Power BI',
        'tietoyhteydet CitizenLab-alustallesi, luo' => 'tietoyhteydet Go Vocal-alustallesi, luo',
        'bruke CitizenLab-dataene dine' => 'bruke Go Vocal-dataene dine',
        'til CitizenLab-plattformen din,' => 'til Go Vocal-plattformen din,',
        "خبير CitizenLab" => "خبير Go Vocal",
        'платформе и ЦитизенЛаб од било' => 'платформе и Go Vocal од било',
        'суппорт@цитизенлаб.цо' => 'support@govocal.com',
        'soren@citizenlab.dk' => 'soren@govocal.dk',
        'teil.\n\n‍\n\nKontakt: eva.mayer@citizenlab.de\n\n‍\n\nHaftungsausschluss' => 'teil.\n\n‍\n\nKontakt: eva.mayer@go-vocal.de\n\n‍\n\nHaftungsausschluss'
      }.each do |old_v, new_v|
        expect(rake_20240531_substitute_gv(old_v)).to eq(new_v)
      end
    end
  end
end
