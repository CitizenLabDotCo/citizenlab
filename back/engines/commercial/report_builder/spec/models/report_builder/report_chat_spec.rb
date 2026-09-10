# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::ReportChat do
  subject(:chat) { create(:report_chat) }

  def turn(role, text)
    { 'role' => role, 'text' => text, 'at' => Time.current.iso8601 }
  end

  it 'is one per report' do
    expect { create(:report_chat, report: chat.report) }
      .to raise_error(ActiveRecord::RecordNotUnique)
  end

  it 'refuses a transcript that is not a list of turns' do
    chat.transcript = { 'role' => 'user' }

    expect(chat).not_to be_valid
    expect(chat.errors[:transcript]).to be_present
  end

  describe '#messages_for_model' do
    it 'is empty for a chat nobody has used' do
      expect(chat.messages_for_model).to eq []
    end

    it 'keeps a short conversation whole' do
      chat.update!(transcript: [turn('user', 'shorter please'), turn('assistant', 'done')])

      expect(chat.messages_for_model.map { |m| m['role'] }).to eq %w[user assistant]
    end

    it 'drops the oldest turns once the conversation is too long to resend' do
      chat.update!(transcript: Array.new(described_class::MAX_MESSAGES + 10) do |index|
        turn(index.even? ? 'user' : 'assistant', "turn #{index}")
      end)

      kept = chat.messages_for_model

      expect(kept.size).to be <= described_class::MAX_MESSAGES
      expect(kept.last['text']).to eq "turn #{described_class::MAX_MESSAGES + 9}"
    end

    it 'always starts on a user turn, so the model sees a well-formed conversation' do
      chat.update!(transcript: Array.new(described_class::MAX_MESSAGES + 1) do |index|
        turn(index.odd? ? 'user' : 'assistant', "turn #{index}")
      end)

      expect(chat.messages_for_model.first['role']).to eq 'user'
    end
  end
end
