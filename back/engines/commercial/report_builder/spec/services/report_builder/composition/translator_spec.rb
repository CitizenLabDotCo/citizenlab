# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::Translator do
  subject(:translator) { described_class.new(locale: 'en', locales: %w[en nl-BE fr-FR], chat: chat) }

  let(:reply_class) { Struct.new(:content) }
  let(:answer) do
    {
      'nl-BE' => { 't0' => 'Elke bijdrage.' },
      'fr-FR' => { 't0' => 'Chaque contribution.' }
    }.to_json
  end
  let(:chat) do
    instance_double(RubyLLM::Chat).tap do |double|
      allow(double).to receive(:ask) { reply_class.new(answer) }
    end
  end

  it 'gives every text the locale it was written in, alongside the rest' do
    expect(translator.call('t0' => 'Every contribution.')).to eq(
      't0' => {
        'en' => 'Every contribution.',
        'nl-BE' => 'Elke bijdrage.',
        'fr-FR' => 'Chaque contribution.'
      }
    )
  end

  it 'reads an answer the model wrapped in a code fence' do
    allow(chat).to receive(:ask).and_return(reply_class.new("```json\n#{answer}\n```"))

    expect(translator.call('t0' => 'Every contribution.')).to include(
      't0' => hash_including('nl-BE' => 'Elke bijdrage.')
    )
  end

  # A reader who gets the language the run was written in has silently lost the
  # translation, so a tag that is nearly right still counts.
  it 'takes an answer the model tagged with the language rather than the locale' do
    allow(chat).to receive(:ask)
      .and_return(reply_class.new({ 'nl' => { 't0' => 'Elke bijdrage.' } }.to_json))

    expect(translator.call('t0' => 'Every contribution.'))
      .to eq('t0' => { 'en' => 'Every contribution.', 'nl-BE' => 'Elke bijdrage.' })
  end

  it 'ignores a locale the platform does not publish in' do
    allow(chat).to receive(:ask)
      .and_return(reply_class.new({ 'de-DE' => { 't0' => 'Jeder Beitrag.' } }.to_json))

    expect(translator.call('t0' => 'Every contribution.')).to eq('t0' => { 'en' => 'Every contribution.' })
  end

  # A composition takes minutes and costs real money; losing it to a translation that
  # did not come back would be the worse failure.
  it 'leaves the text as it was written when the model cannot be reached' do
    allow(chat).to receive(:ask).and_raise(StandardError, 'bedrock is down')
    allow(ErrorReporter).to receive(:report)

    expect(translator.call('t0' => 'Every contribution.')).to eq('t0' => { 'en' => 'Every contribution.' })
    expect(ErrorReporter).to have_received(:report)
  end

  it 'leaves out the texts that are blank' do
    expect(translator.call('t0' => '  ', 't1' => nil)).to eq({})
  end

  it 'asks for nothing when the platform publishes in one language' do
    single = described_class.new(locale: 'en', locales: ['en'], chat: chat)

    expect(single.call('t0' => 'Every contribution.')).to eq('t0' => { 'en' => 'Every contribution.' })
    expect(chat).not_to have_received(:ask)
  end
end
