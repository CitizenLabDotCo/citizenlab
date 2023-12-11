# frozen_string_literal: true

require 'rails_helper'

def call_pcc(phase, service, from, to)
  service.participation_context_changed(
    phase,
    from.participation_method,
    to.participation_method,
    from.survey_service,
    to.survey_service,
    from.survey_embed_url,
    to.survey_embed_url
  )
end

describe Surveys::TypeformWebhookManager do
  let(:api_response) { instance_double(HTTParty::Response, success?: true) }
  let(:tf_api) { instance_double(Surveys::Typeform::Api, create_or_update_webhook: api_response) }
  let(:service) { described_class.new(tf_api, 'dummy_secret_token') }

  describe 'participation_context_changed' do
    let(:from) { build(:typeform_survey_phase) }
    let(:to) { build(:typeform_survey_phase) }

    it "doesn't call tf api when no phase is survey related" do
      from = build(:phase)
      to = build(:phase)
      call_pcc(to, service, from, to)
    end

    it "doesn't call tf api when no phase is typeform related" do
      from = build(:google_survey_phase)
      to = build(:google_survey_phase, survey_embed_url: 'https://docs.google.com/forms/d/e/changedfake/viewform?embedded=true')
      call_pcc(to, service, from, to)
    end

    it 'creates a webhook when the participation_method goes from ideation to survey' do
      from = build(:phase)
      to = build(:typeform_survey_phase)
      expect(tf_api).to receive(:create_or_update_webhook)
      call_pcc(to, service, from, to)
    end

    it 'deletes a webhook when the participation_method goes from survey to information' do
      from = build(:typeform_survey_phase)
      to = build(:phase)
      expect(tf_api).to receive(:delete_webhook)
      call_pcc(to, service, from, to)
    end

    it 'creates a webhook when the survey_service goes from google_forms to typeform' do
      from = build(:google_survey_phase)
      to = build(:typeform_survey_phase)
      expect(tf_api).to receive(:create_or_update_webhook)
      call_pcc(to, service, from, to)
    end

    it 'deletes a webhook when the survey_service goes from typeform to google_forms' do
      from = build(:typeform_survey_phase)
      to = build(:google_survey_phase)
      expect(tf_api).to receive(:delete_webhook)
      call_pcc(to, service, from, to)
    end

    it 'updates a webhook when the survey_embed_url changes' do
      from = build(:typeform_survey_phase)
      to = build(:typeform_survey_phase, survey_embed_url: 'https://citizenlabco.typeform.com/to/Lr57Iz')
      expect(tf_api).to receive(:create_or_update_webhook)
      call_pcc(to, service, from, to)
    end
  end

  describe 'participation_context_created' do
    it "doesn't create a webhook when it's not typeform" do
      phase = create(:google_survey_phase)
      service.participation_context_created(phase, phase.participation_method, phase.survey_service, phase.survey_embed_url)
    end

    it "creates a webhook when it's typeform" do
      phase = create(:typeform_survey_phase)
      expect(tf_api).to receive(:create_or_update_webhook)
      service.participation_context_created(phase, phase.participation_method, phase.survey_service, phase.survey_embed_url)
    end
  end

  describe 'participation_context_to_be_deleted' do
    it "doesn't delete a webhook when it's not typeform" do
      phase = create(:google_survey_phase)
      service.participation_context_to_be_deleted(phase.id, phase.participation_method, phase.survey_service, phase.survey_embed_url)
    end

    it "deletes a webhook when it's typeform" do
      phase = create(:typeform_survey_phase)
      expect(tf_api).to receive(:delete_webhook)
      service.participation_context_to_be_deleted(phase.id, phase.participation_method, phase.survey_service, phase.survey_embed_url)
    end
  end

  describe 'delete_all_webhooks' do
    it 'deletes all typeform survey webhooks' do
      create(:project_with_phases)
      create_list(:single_phase_typeform_survey_project, 2)
      create(:phase, participation_method: 'survey', survey_service: 'typeform', survey_embed_url: 'https://citizenlabco.typeform.com/to/Lr57Iz')
      expect(tf_api).to receive(:delete_webhook).exactly(3).times
      service.delete_all_webhooks
    end
  end

  describe 'embed_url_to_form_id' do
    it 'parses simple url correctly' do
      form_id = service.send(:embed_url_to_form_id, 'https://citizenlabco.typeform.com/to/abcdef')
      expect(form_id).to eq('abcdef')
    end

    it "parses url with trailing '?' correctly" do
      form_id = service.send(:embed_url_to_form_id, 'https://citizenlabco.typeform.com/to/abcdef?')
      expect(form_id).to eq('abcdef')
    end

    it 'parses url with query parameters correctly' do
      form_id = service.send(:embed_url_to_form_id, 'https://citizenlabco.typeform.com/to/abcdef?name=xxxxx&sexe=xxxxx')
      expect(form_id).to eq('abcdef')
    end

    it 'parses url with a fragment correctly' do
      form_id = service.send(:embed_url_to_form_id, 'https://citizenlabco.typeform.com/to/abcdef#name=xxxxx&sexe=xxxxx')
      expect(form_id).to eq('abcdef')
    end
  end
end
