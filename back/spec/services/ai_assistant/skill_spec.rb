# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Skill do
  let(:missing_root) { Rails.root.join('spec/fixtures/missing') }

  describe '.find' do
    using RSpec::Parameterized::TableSyntax

    where(:env, :copied, :name, :found, :reported) do
      'production'  | true  | 'example-skill' | true  | false
      'production'  | true  | 'unknown-skill' | false | true
      'development' | true  | 'unknown-skill' | false | false
      'test'        | true  | 'unknown-skill' | false | false
      'production'  | false | 'example-skill' | false | true
    end

    with_them do
      before do
        allow(Rails).to receive(:env).and_return(ActiveSupport::EnvironmentInquirer.new(env))
        stub_const("#{described_class}::ROOT", missing_root) unless copied
        allow(ErrorReporter).to receive(:report_msg)
      end

      it 'finds a copied skill, and reports a missing one outside development and test' do
        expect(described_class.find(name, ['SKILL.md']).present?).to be(found)

        if reported
          expect(ErrorReporter).to have_received(:report_msg).with('LLM skill not found', extra: { name: })
        else
          expect(ErrorReporter).not_to have_received(:report_msg)
        end
      end
    end
  end

  describe '#files' do
    it 'reads only the listed files, in their order, and drops the front matter of SKILL.md' do
      skill = described_class.find('example-skill', ['../../shared/style.md', 'SKILL.md'])

      expect(skill.name).to eq('example-skill')
      expect(skill.files.keys).to eq(['../../shared/style.md', 'SKILL.md'])
      expect(skill.files['../../shared/style.md']).to include('Fixture guidance on style.')
      expect(skill.files['SKILL.md']).to start_with('# Example skill')
    end

    context 'when a listed file is missing' do
      using RSpec::Parameterized::TableSyntax

      where(:env, :reported) do
        'production'  | true
        'development' | false
        'test'        | false
      end

      with_them do
        before do
          allow(Rails).to receive(:env).and_return(ActiveSupport::EnvironmentInquirer.new(env))
          allow(ErrorReporter).to receive(:report_msg)
        end

        it 'leaves it out, and reports it outside development and test' do
          skill = described_class.find('example-skill', ['references/unknown.md', 'references/guide.md'])

          expect(skill.files.keys).to eq(['references/guide.md'])

          if reported
            expect(ErrorReporter).to have_received(:report_msg)
              .with('LLM skill file not found', extra: { name: 'example-skill', path: 'references/unknown.md' })
          else
            expect(ErrorReporter).not_to have_received(:report_msg)
          end
        end
      end
    end
  end

  it 'gives the model the listed files as a skill' do
    prompt = described_class.find('example-skill', ['references/guide.md']).prompt

    expect(prompt).to include(
      '<skill name="example-skill">',
      '<file path="references/guide.md">',
      'Fixture guidance from the example skill.'
    )
    expect(prompt).not_to include('Fixture guidance on style.')
  end

  it 'lists the skill of every surface in the manifest, so CI puts it in the image' do
    manifest = YAML.load_file(Rails.root.join('config/llm_skills.yml'))

    expect(manifest['skills']).to include(*AIAssistant::Surface.all.filter_map(&:skill_name))
  end
end
