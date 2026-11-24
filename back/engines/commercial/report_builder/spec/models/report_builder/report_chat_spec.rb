# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::ReportChat do
  subject(:chat) { create(:report_chat) }

  it 'is one per report' do
    expect { create(:report_chat, report: chat.report) }
      .to raise_error(ActiveRecord::RecordNotUnique)
  end

  it 'refuses a transcript that is not a list of turns' do
    chat.transcript = { 'role' => 'user' }

    expect(chat).not_to be_valid
    expect(chat.errors[:transcript]).to be_present
  end

  describe '#append_turn!' do
    it 'appends to an empty transcript' do
      chat.append_turn!({ 'role' => 'user', 'text' => 'hello' })

      expect(chat.transcript).to eq [{ 'role' => 'user', 'text' => 'hello' }]
    end

    it 'appends after the turns already there' do
      chat.append_turn!({ 'role' => 'user', 'text' => 'first' })
      chat.append_turn!({ 'role' => 'assistant', 'text' => 'second' })

      expect(chat.transcript.pluck('text')).to eq %w[first second]
    end

    it 'keeps a turn another writer appended since this instance read the transcript' do
      other_writer = described_class.find(chat.id)
      chat.transcript
      other_writer.append_turn!({ 'role' => 'user', 'text' => 'theirs' })

      chat.append_turn!({ 'role' => 'assistant', 'text' => 'ours' })

      expect(chat.transcript.pluck('text')).to eq %w[theirs ours]
    end
  end
end
