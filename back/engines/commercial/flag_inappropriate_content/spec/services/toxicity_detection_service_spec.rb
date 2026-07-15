# frozen_string_literal: true

require 'rails_helper'

describe FlagInappropriateContent::ToxicityDetectionService do
  let(:service) { described_class.new }

  describe 'flag_toxicity!' do
    before do
      SettingsService.new.activate_feature! 'moderation'
      SettingsService.new.activate_feature! 'flag_inappropriate_content'
      stub_classify_toxicity! service
    end

    it 'creates and returns a new flag if toxicity was detected' do
      idea = create(:idea, title_multiloc: { 'en' => 'An idea for my fellow wankers' })

      flag = service.flag_toxicity! idea, attributes: [:title_multiloc]

      idea.reload
      expect(flag).to eq idea.inappropriate_content_flag
      expect(idea.inappropriate_content_flag.toxicity_label).to eq 'insult'
      expect(idea.inappropriate_content_flag.ai_reason).to be_present
    end

    it 'creates no flag and returns nil if no toxicity was detected' do
      idea = create(:idea, title_multiloc: { 'en' => 'My innocent idea' }, location_description: 'Wankerford')

      flag = service.flag_toxicity! idea, attributes: [:title_multiloc]

      expect(flag).to be_nil
      expect(idea.reload.inappropriate_content_flag).to be_nil
    end

    it 'reintroduces a deleted flag if no toxicity was detected' do
      comment = create(:comment, body_multiloc: { 'en' => 'wanker' })
      create(:inappropriate_content_flag, flaggable: comment, deleted_at: Time.now)
      service.flag_toxicity! comment, attributes: [:body_multiloc]
      comment.reload
      expect(comment.inappropriate_content_flag).to be_present
      expect(comment.inappropriate_content_flag.deleted_at).to be_blank
      expect(comment.inappropriate_content_flag.toxicity_label).to eq 'insult'
      expect(comment.inappropriate_content_flag.ai_reason).to be_present
    end

    it 'creates no flag if flagging feature is disabled' do
      SettingsService.new.deactivate_feature! 'flag_inappropriate_content'
      idea = create(:idea, title_multiloc: { 'en' => 'An idea for my fellow wankers' })
      service.flag_toxicity! idea, attributes: [:title_multiloc]
      idea.reload
      expect(idea.inappropriate_content_flag).to be_blank
    end
  end

  describe 'check_toxicity' do
    let(:llm) { instance_double(Analysis::LLM::ClaudeHaiku45) }

    before do
      SettingsService.new.activate_feature! 'moderation'
      SettingsService.new.activate_feature! 'flag_inappropriate_content'
      stub_const('ENV', ENV.to_h.merge('AWS_TOXICITY_DETECTION_REGION' => 'eu-central-1'))
      allow(Analysis::LLM::ClaudeHaiku45).to receive(:new).and_return(llm)
    end

    it 'classifies with the default categories when no custom guidelines are configured' do
      idea = create(:idea, title_multiloc: { 'en' => 'An idea for my fellow wankers' })

      expect(llm).to receive(:chat) do |prompt, response_schema:|
        expect(prompt).to include 'An idea for my fellow wankers'
        expect(prompt).not_to include '<guidelines>'
        expect(response_schema.dig(:properties, :category, :enum)).to eq %w[A B C D E]
        { 'category' => 'A', 'reason' => 'Contains an insult.' }
      end

      expect(service.check_toxicity(idea, attributes: [:title_multiloc]))
        .to eq({ toxicity_label: 'insult', ai_reason: 'Contains an insult.' })
    end

    it 'checks content against custom guidelines when configured' do
      config = AppConfiguration.instance
      config.settings['flag_inappropriate_content']['custom_guidelines'] = 'Messages may not contain links.'
      config.save!
      comment = create(:comment, body_multiloc: { 'en' => 'Visit https://spam.example.com' })

      expect(llm).to receive(:chat) do |prompt, response_schema:|
        expect(prompt).to include 'Messages may not contain links.'
        expect(response_schema.dig(:properties, :category, :enum)).to eq %w[A B C D E F]
        { 'category' => 'F', 'reason' => 'The message contains a link.' }
      end

      expect(service.check_toxicity(comment))
        .to eq({ toxicity_label: 'guideline_violation', ai_reason: 'The message contains a link.' })
    end

    it 'returns nil for non-toxic content' do
      comment = create(:comment, body_multiloc: { 'en' => 'What a nice idea' })
      allow(llm).to receive(:chat).and_return({ 'category' => 'E', 'reason' => 'Not toxic.' })

      expect(service.check_toxicity(comment)).to be_nil
    end
  end

  private

  def stub_classify_toxicity!(service)
    service.stub(:classify_toxicity) do |text|
      if text.downcase.include? 'wanker'
        {
          toxicity_label: 'insult',
          ai_reason: 'Insulting or a threat. The user\'s message contains insults directed at the AI, calling it a "wanker", "crybaby", and questioning its intellect in a sarcastic manner. While no direct threats are made, the tone is antagonistic and meant to provoke a negative response. The message does not contain any harmful, illegal, pornographic or spam content.'
        }
      end
    end
  end
end
