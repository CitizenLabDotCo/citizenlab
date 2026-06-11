# frozen_string_literal: true

require 'rails_helper'

RSpec.describe McpServer::Tools::UpdateResource do
  let(:user) { create(:admin) }

  def run(type:, id:, attributes:)
    described_class::Runner.new(
      params: { type: type, id: id, attributes: attributes },
      server_context: {}, current_user: user, token_scopes: ['mcp:access']
    ).run
  end

  def text(response) = response.content.first[:text]

  describe 'updating a poll_option' do
    let(:option) { create(:poll_option, title_multiloc: { 'en' => 'Old', 'nl-BE' => 'Oud' }) }

    it 'merges multiloc fields per-locale (omitted locales are kept)' do
      response = run(type: 'poll_option', id: option.id, attributes: { title_multiloc: { 'en' => 'New' } })

      expect(response.error?).to be(false)
      expect(option.reload.title_multiloc).to eq({ 'en' => 'New', 'nl-BE' => 'Oud' })
    end

    it 'rejects an unknown field with a specific, pointered error' do
      response = run(type: 'poll_option', id: option.id, attributes: { foo: 'bar' })

      expect(response.error?).to be(true)
      expect(text(response)).to include('foo').and include('create_poll_option')
    end

    it 'returns a not-found error for an unknown id' do
      response = run(type: 'poll_option', id: 'does-not-exist', attributes: { title_multiloc: { 'en' => 'x' } })

      expect(response.error?).to be(true)
      expect(text(response)).to eq('poll_option not found: does-not-exist')
    end
  end

  describe 'updating a poll_question' do
    let(:phase) { create(:single_phase_poll_project).phases.first }

    it 'reorders via the ordering field, shifting siblings' do
      q0 = create(:poll_question, phase: phase)
      q1 = create(:poll_question, phase: phase)

      response = run(type: 'poll_question', id: q1.id, attributes: { ordering: 0 })

      expect(response.error?).to be(false)
      expect(q1.reload.ordering).to eq(0)
      expect(q0.reload.ordering).to eq(1)
    end

    it 'surfaces model validation errors' do
      question = create(:poll_question, phase: phase)

      response = run(type: 'poll_question', id: question.id, attributes: { question_type: 'bogus' })

      expect(response.error?).to be(true)
      expect(text(response)).to start_with('Validation failed')
    end

    it 'rejects re-parenting (phase_id is immutable)' do
      question = create(:poll_question, phase: phase)

      response = run(type: 'poll_question', id: question.id, attributes: { phase_id: 'other-phase' })

      expect(response.error?).to be(true)
      expect(text(response)).to include('phase_id')
    end
  end

  describe 'registry integrity' do
    described_class::RESOURCES.each do |type, config|
      it "#{type}: every updatable attr is a real model attribute" do
        model_attrs = config[:model].constantize.attribute_names.map(&:to_sym)
        expect(config[:attrs] - model_attrs).to be_empty
      end
    end
  end

  describe 'updating an event' do
    it 'updates multiloc + plain fields' do
      event = create(:event, title_multiloc: { 'en' => 'Old', 'nl-BE' => 'Oud' })

      response = run(
        type: 'event', id: event.id,
        attributes: { title_multiloc: { 'en' => 'New' }, online_link: 'https://example.test/x' }
      )

      expect(response.error?).to be(false)
      expect(event.reload.title_multiloc).to eq({ 'en' => 'New', 'nl-BE' => 'Oud' })
      expect(event.online_link).to eq('https://example.test/x')
    end

    it 'rejects ordering for a non-reorderable type' do
      event = create(:event)

      response = run(type: 'event', id: event.id, attributes: { ordering: 1 })

      expect(response.error?).to be(true)
      expect(text(response)).to include('ordering')
    end
  end
end
