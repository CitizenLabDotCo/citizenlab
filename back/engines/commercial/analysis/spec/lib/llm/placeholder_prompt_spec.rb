# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::LLM::PlaceholderPrompt do
  let(:service) { described_class.new }

  describe 'render' do
    it 'substitutes the placeholders it is given' do
      expect(service.render('Project %{project_title}: %{question}', project_title: 'Bike lanes', question: 'Why?'))
        .to eq 'Project Bike lanes: Why?'
    end

    it 'substitutes every occurrence of a placeholder' do
      expect(service.render('%{a} then %{a}', a: 'x')).to eq 'x then x'
    end

    it 'leaves unknown placeholders untouched' do
      expect(service.render('%{project_title} %{typo}', project_title: 'Bike lanes'))
        .to eq 'Bike lanes %{typo}'
    end

    it 'leaves stray percent signs untouched' do
      expect(service.render('50% of respondents %{q}', q: 'agree')).to eq '50% of respondents agree'
    end

    it 'does not evaluate ERB tags' do
      expect(service.render("<%= raise 'boom' %> <% $stdout.puts 1 %>")).to eq "<%= raise 'boom' %> <% $stdout.puts 1 %>"
    end

    it 'does not evaluate placeholders coming from a substituted value' do
      expect(service.render('%{inputs_text}', inputs_text: '%{secret}', secret: 'leaked')).to eq '%{secret}'
    end

    it 'does not interpret backslash sequences in a substituted value' do
      expect(service.render('%{inputs_text}', inputs_text: '\0 \1 \\')).to eq '\0 \1 \\'
    end

    it 'renders a nil value as an empty string' do
      expect(service.render('in %{language}.', language: nil)).to eq 'in .'
    end
  end
end
