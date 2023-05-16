# frozen_string_literal: true

require 'rails_helper'

describe DocumentAnnotation::DocumentAnnotationParticipationContext do # rubocop:disable RSpec/EmptyExampleGroup
  # describe 'validate survey_embed_url for typeform' do
  #   it 'validates a survey_embed_url' do
  #     pc = build(:continuous_survey_project, survey_embed_url: 'https://citizenlabco.typeform.com/to/HKGaPV?source=xxxxx')
  #     expect(pc).to be_valid
  #   end

  #   it 'invalidates a survey_embed_url with a sole email parameter' do
  #     pc = build(:continuous_survey_project, survey_embed_url: 'https://citizenlabco.typeform.com/to/HKGaPV?email=xxxxx')
  #     expect(pc).to be_invalid
  #   end

  #   it 'invalidates a survey_embed_url with email as one of the parameters' do
  #     pc = build(:continuous_survey_project, survey_embed_url: 'https://citizenlabco.typeform.com/to/HKGaPV?email=xxxxx&source=yyyyyy')
  #     expect(pc).to be_invalid
  #   end
  # end

  # describe 'typeform_form_id method' do
  #   it 'returns correct ID for basic URL' do
  #     pc = build(:continuous_survey_project, survey_embed_url: 'https://citizenlabco.typeform.com/to/HKGaPV')
  #     expect(pc.typeform_form_id).to eq 'HKGaPV'
  #   end

  #   it 'returns correct ID for URL with ? part' do
  #     pc = build(:continuous_survey_project, survey_embed_url: 'https://citizenlabco.typeform.com/to/HKGaPV?source=xxxxx')
  #     expect(pc.typeform_form_id).to eq 'HKGaPV'
  #   end

  #   it 'returns correct ID for URL with # part' do
  #     pc = build(:continuous_survey_project, survey_embed_url: 'https://citizenlabco.typeform.com/to/lVuW1Y18#user_id=xxxxx')
  #     expect(pc.typeform_form_id).to eq 'lVuW1Y18'
  #   end

  #   it 'returns correct ID for URL with # at the end' do
  #     pc = build(:continuous_survey_project, survey_embed_url: 'https://citizenlabco.typeform.com/to/lVuW1Y18#')
  #     expect(pc.typeform_form_id).to eq 'lVuW1Y18'
  #   end
  # end

  # describe 'validate survey_embed_url for Enalyzer' do
  #   it 'validates a survey_embed_url' do
  #     pc = build(:continuous_survey_project, survey_service: 'enalyzer', survey_embed_url: 'https://surveys.enalyzer.com/?pid=HKGaPV')
  #     expect(pc).to be_valid
  #     pc = build(:continuous_survey_project, survey_service: 'enalyzer', survey_embed_url: 'https://surveys.enalyzer.com?pid=HKGaPV')
  #     expect(pc).to be_valid
  #   end

  #   it 'invalidates a survey_embed_url' do
  #     pc = build(:continuous_survey_project, survey_service: 'enalyzer', survey_embed_url: 'https://surveys.enalyzer.com//?pid=HKGaPV')
  #     expect(pc).to be_invalid
  #   end
  # end
end
