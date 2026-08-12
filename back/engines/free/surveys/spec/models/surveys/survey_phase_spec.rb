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
