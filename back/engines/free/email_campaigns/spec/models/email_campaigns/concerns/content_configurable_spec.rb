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
    let_it_be(:global_campaign) { AutomatedContentConfigurableCampaign.create }
    let_it_be(:campaign) { AutomatedContentConfigurableCampaign.create(context: create(:project)) }

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

      it 'does not save multilocs that match global campaign values' do
        global_campaign.update!(subject_multiloc: { 'en' => 'Global campaign subject', 'fr-FR' => 'Sujet global champagne' })
        campaign = AutomatedContentConfigurableCampaign.where.not(context: nil).first # reload will not reload the memoized global campaign instance variable of the context campaign
        campaign.update!(subject_multiloc: { 'en' => 'Global campaign subject', 'fr-FR' => 'Sujet global champagne' })
        global_campaign.update!(subject_multiloc: { 'en' => 'Updated global campaign subject', 'fr-FR' => 'Sujet global champagne mis à jour' })
        campaign = AutomatedContentConfigurableCampaign.where.not(context: nil).first
        expect(campaign[:subject_multiloc]).to eq({})
        expect(campaign.subject_multiloc).to eq({ 'en' => 'Updated global campaign subject', 'fr-FR' => 'Sujet global champagne mis à jour' })
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

      it 'does not save multilocs that match global campaign values' do
        global_campaign.update!(title_multiloc: { 'en' => 'Global campaign title', 'fr-FR' => 'TITRE' })
        campaign = AutomatedContentConfigurableCampaign.where.not(context: nil).first # reload will not reload the memoized global campaign instance variable of the context campaign
        campaign.update!(title_multiloc: { 'en' => 'Global campaign title', 'fr-FR' => 'TITRE' })
        global_campaign.update!(title_multiloc: { 'en' => 'Updated global campaign title', 'fr-FR' => 'TITRE' })
        campaign = AutomatedContentConfigurableCampaign.where.not(context: nil).first
        expect(campaign[:title_multiloc]).to eq({})
        expect(campaign.title_multiloc).to eq({ 'en' => 'Updated global campaign title', 'fr-FR' => 'TITRE' })
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

      it 'does not save multilocs that match global campaign values' do
        global_campaign.update!(intro_multiloc: { 'en' => 'Global campaign intro', 'fr-FR' => 'INTRO' })
        campaign = AutomatedContentConfigurableCampaign.where.not(context: nil).first # reload will not reload the memoized global campaign instance variable of the context campaign
        campaign.update!(intro_multiloc: { 'en' => 'Global campaign intro', 'fr-FR' => 'INTRO' })
        global_campaign.update!(intro_multiloc: { 'en' => 'Updated global campaign intro', 'fr-FR' => 'INTRO' })
        campaign = AutomatedContentConfigurableCampaign.where.not(context: nil).first
        expect(campaign[:intro_multiloc]).to eq({})
        expect(campaign.intro_multiloc).to eq({ 'en' => 'Updated global campaign intro', 'fr-FR' => 'INTRO' })
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

      it 'does not save multilocs that match global campaign values' do
        global_campaign.update!(button_text_multiloc: { 'en' => 'Global campaign button', 'fr-FR' => 'BOUTON' })
        campaign = AutomatedContentConfigurableCampaign.where.not(context: nil).first # reload will not reload the memoized global campaign instance variable of the context campaign
        campaign.update!(button_text_multiloc: { 'en' => 'Global campaign button', 'fr-FR' => 'BOUTON' })
        global_campaign.update!(button_text_multiloc: { 'en' => 'Updated global campaign button', 'fr-FR' => 'BOUTON' })
        campaign = AutomatedContentConfigurableCampaign.where.not(context: nil).first
        expect(campaign[:button_text_multiloc]).to eq({})
        expect(campaign.button_text_multiloc).to eq({ 'en' => 'Updated global campaign button', 'fr-FR' => 'BOUTON' })
      end
    end
  end
end
