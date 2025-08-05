# frozen_string_literal: true

require 'rails_helper'

class AutomatedContentConfigurableCampaign < EmailCampaigns::Campaign
  include EmailCampaigns::ContentConfigurable

  def mailer_class
    AutomatedContentConfigurableCampaignMailer
  end
end

class AutomatedContentConfigurableCampaignMailer < ApplicationMailer
  include EmailCampaigns::EditableWithPreview

  def editable_regions
    [
      {
        key: :subject_multiloc,
        type: 'text',
        variables: [],
        default_value_multiloc: { 'en' => 'SUBJECT', 'fr-FR' => 'SUJET' },
        allow_blank_locales: false
      },
      {
        key: :title_multiloc,
        type: 'text',
        variables: [],
        default_value_multiloc: { 'en' => 'TITLE', 'fr-FR' => 'TITRE' },
        allow_blank_locales: false
      },
      {
        key: :intro_multiloc,
        type: 'html',
        variables: [],
        default_value_multiloc: { 'en' => 'INTRO', 'fr-FR' => 'INTRO' },
        allow_blank_locales: true
      },
      {
        key: :button_text_multiloc,
        type: 'text',
        variables: [],
        default_value_multiloc: { 'en' => 'BUTTON', 'fr-FR' => 'BOUTON' },
        allow_blank_locales: false
      }
    ]
  end
end

RSpec.describe EmailCampaigns::ContentConfigurable do
  context 'Automated Campaign' do
    let_it_be(:campaign) { AutomatedContentConfigurableCampaign.create }

    describe '#subject_multiloc' do
      it 'returns default values when no values' do
        expect(campaign[:subject_multiloc]).to eq({})
        expect(campaign.subject_multiloc).to eq({ 'en' => 'SUBJECT', 'fr-FR' => 'SUJET' })
      end

      it 'merges default values when no values' do
        campaign[:subject_multiloc] = { 'en' => 'Custom Subject' }
        expect(campaign.subject_multiloc).to eq({ 'en' => 'Custom Subject', 'fr-FR' => 'SUJET' })
      end

      it 'returns defaults for blank values' do
        campaign[:subject_multiloc] = { 'en' => 'Custom Subject', 'fr-FR' => '' }
        expect(campaign.subject_multiloc).to eq({ 'en' => 'Custom Subject', 'fr-FR' => 'SUJET' })
      end

      it 'does not save any locales that match default region values' do
        campaign.update! subject_multiloc: { 'en' => 'SUBJECT', 'fr-FR' => 'Bonjour' }
        expect(campaign[:subject_multiloc]).to eq({ 'fr-FR' => 'Bonjour' })
        expect(campaign.subject_multiloc).to eq({ 'en' => 'SUBJECT', 'fr-FR' => 'Bonjour' })
      end
    end

    describe '#title_multiloc' do
      it 'returns default values when no values' do
        expect(campaign[:title_multiloc]).to eq({})
        expect(campaign.title_multiloc).to eq({ 'en' => 'TITLE', 'fr-FR' => 'TITRE' })
      end

      it 'merges default values when no values' do
        campaign[:title_multiloc] = { 'en' => 'Custom Title' }
        expect(campaign.title_multiloc).to eq({ 'en' => 'Custom Title', 'fr-FR' => 'TITRE' })
      end

      it 'returns defaults for blank values' do
        campaign[:title_multiloc] = { 'en' => 'Custom title', 'fr-FR' => '' }
        expect(campaign.title_multiloc).to eq({ 'en' => 'Custom title', 'fr-FR' => 'TITRE' })
      end

      it 'does not save any locales that match default region values' do
        campaign.update! title_multiloc: { 'en' => 'Hello there', 'fr-FR' => 'TITRE' }
        expect(campaign[:title_multiloc]).to eq({ 'en' => 'Hello there' })
        expect(campaign.title_multiloc).to eq({ 'en' => 'Hello there', 'fr-FR' => 'TITRE' })
      end
    end

    describe '#intro_multiloc' do
      it 'returns default values when no values' do
        expect(campaign[:intro_multiloc]).to eq({})
        expect(campaign.intro_multiloc).to eq({ 'en' => 'INTRO', 'fr-FR' => 'INTRO' })
      end

      it 'merges default values when no values' do
        campaign[:intro_multiloc] = { 'en' => 'Custom intro' }
        expect(campaign.intro_multiloc).to eq({ 'en' => 'Custom intro', 'fr-FR' => 'INTRO' })
      end

      it 'allows blank values' do
        campaign[:intro_multiloc] = { 'en' => 'Custom intro', 'fr-FR' => '' }
        expect(campaign.intro_multiloc).to eq({ 'en' => 'Custom intro', 'fr-FR' => '' })
      end

      it 'does not save any locales that match default region values' do
        campaign.update! intro_multiloc: { 'en' => 'Hello there', 'fr-FR' => 'INTRO' }
        expect(campaign[:intro_multiloc]).to eq({ 'en' => 'Hello there' })
        expect(campaign.intro_multiloc).to eq({ 'en' => 'Hello there', 'fr-FR' => 'INTRO' })
      end

      it 'santizes HTML tags' do
        campaign.update!(intro_multiloc: { 'en' => '<p><script>REMOVE ME</script> Custom intro with <strong>HTML</strong></p>' })
        expect(campaign[:intro_multiloc]).to eq({ 'en' => '<p>REMOVE ME Custom intro with <strong>HTML</strong></p>' })
      end
    end

    describe '#button_text_multiloc' do
      it 'returns default values when no values' do
        expect(campaign[:button_text_multiloc]).to eq({})
        expect(campaign.button_text_multiloc).to eq({ 'en' => 'BUTTON', 'fr-FR' => 'BOUTON' })
      end

      it 'merges default values when no values' do
        campaign[:button_text_multiloc] = { 'en' => 'Custom button' }
        expect(campaign.button_text_multiloc).to eq({ 'en' => 'Custom button', 'fr-FR' => 'BOUTON' })
      end

      it 'returns defaults for blank values' do
        campaign[:button_text_multiloc] = { 'en' => 'Custom button', 'fr-FR' => '' }
        expect(campaign.button_text_multiloc).to eq({ 'en' => 'Custom button', 'fr-FR' => 'BOUTON' })
      end

      it 'does not save any locales that match default region values' do
        campaign.update! button_text_multiloc: { 'en' => 'Hello there', 'fr-FR' => 'BOUTON' }
        expect(campaign[:button_text_multiloc]).to eq({ 'en' => 'Hello there' })
        expect(campaign.button_text_multiloc).to eq({ 'en' => 'Hello there', 'fr-FR' => 'BOUTON' })
      end
    end
  end
end
