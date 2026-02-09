# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'rake demos:translate_missing_locales' do
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['demos:translate_missing_locales'].reenable }

  let(:task) { Rake::Task['demos:translate_missing_locales'] }

  # Shared helper methods for craftjs_json structures
  def craftjs_with_text_multiloc(text_multiloc)
    {
      'ROOT' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['text-node-1'],
        'props' => {},
        'parent' => nil
      },
      'text-node-1' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => text_multiloc },
        'parent' => 'ROOT'
      }
    }
  end

  def craftjs_with_accordion(title_multiloc, text_multiloc)
    {
      'ROOT' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['accordion-node-1'],
        'props' => {},
        'parent' => nil
      },
      'accordion-node-1' => {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'nodes' => [],
        'props' => { 'title' => title_multiloc, 'text' => text_multiloc },
        'parent' => 'ROOT'
      }
    }
  end

  def capture_stdout(&)
    original_stdout = $stdout
    $stdout = StringIO.new
    yield
    $stdout.string
  ensure
    $stdout = original_stdout
  end

  describe 'parameter validation' do
    it 'requires host and source_locale parameters' do
      aggregate_failures do
        expect { task.invoke }.to output(/Host and source_locale parameters are required/).to_stdout

        task.reenable
        expect { task.invoke('demo-platform.com') }.to output(/Host and source_locale parameters are required/).to_stdout

        task.reenable
        expect { task.invoke('nonexistent.host.com', 'en') }.to output(/Tenant not found/).to_stdout
      end
    end
  end

  describe 'locale and lifecycle validation' do
    let_it_be(:demo_tenant) { create(:tenant, host: 'demo-platform.com', lifecycle: 'demo', locales: %w[en fr-FR]) }
    let_it_be(:active_tenant) { create(:tenant, host: 'active-platform.com', lifecycle: 'active') }

    it 'validates source locale and lifecycle stage' do
      aggregate_failures do
        # Source locale must be in configured locales
        expect { task.invoke('demo-platform.com', 'de') }
          .to output(/ERROR: Source locale 'de' is not in configured locales/).to_stdout

        task.reenable
        # Cannot translate on non-demo platforms
        expect { task.invoke('active-platform.com', 'en', 'true') }
          .to output(/ERROR: Translations can only be run on demo platforms/).to_stdout

        task.reenable
        # Audit allowed on non-demo platforms
        expect { task.invoke('active-platform.com', 'en') }
          .to output(/Lifecycle stage: active/).to_stdout
      end
    end
  end

  describe 'extra locales' do
    let_it_be(:tenant) { create(:tenant, host: 'extra-locale-test.com', lifecycle: 'demo', locales: %w[en fr-FR]) }

    before do
      translation_service = instance_double(MachineTranslations::MachineTranslationService)
      allow(MachineTranslations::MachineTranslationService).to receive(:new).and_return(translation_service)
      allow(translation_service).to receive(:translate) { |text, _from, _to| "translated: #{text}" }
    end

    it 'handles extra locales for audit and translation' do
      project = nil
      tenant.switch do
        project = create(:project,
          title_multiloc: { 'en' => 'English title', 'fr-FR' => 'Titre' },
          description_multiloc: { 'en' => 'Desc', 'fr-FR' => 'Desc FR' },
          description_preview_multiloc: { 'en' => 'Preview', 'fr-FR' => 'Preview FR' })
      end

      # Without extra locales, no issues
      expect { task.invoke('extra-locale-test.com', 'en') }
        .to output(/No issues found/).to_stdout

      task.reenable
      # With extra locales, should report as missing and display in header
      output = capture_stdout { task.invoke('extra-locale-test.com', 'en', 'false', 'nl-NL:de-DE') }
      aggregate_failures do
        expect(output).to include('missing: nl-NL, de-DE')
        expect(output).to include('Extra locales: nl-NL, de-DE')
      end

      task.reenable
      # Translates to extra locales
      task.invoke('extra-locale-test.com', 'en', 'true', 'nl-NL')

      tenant.switch do
        project.reload
        expect(project.title_multiloc['nl-NL']).to eq('translated: English title')
      end
    end

    it 'copies from same language when extra locale matches existing language' do
      project = nil
      tenant.switch do
        project = create(:project, title_multiloc: { 'en' => 'English', 'fr-FR' => 'Titre' })
      end

      # fr-BE should copy from fr-FR instead of translating
      expect { task.invoke('extra-locale-test.com', 'en', 'true', 'fr-BE') }
        .to output(/Copied Project#.* from fr-FR to fr-BE \(same language\)/).to_stdout

      tenant.switch do
        project.reload
        expect(project.title_multiloc['fr-BE']).to eq('Titre')
      end
    end

    it 'supports multiple extra locales separated by colons' do
      multi_locale_tenant = create(:tenant, host: 'multi-locale.com', lifecycle: 'demo', locales: %w[en fr-FR nl-NL de-DE es-ES])

      project = nil
      multi_locale_tenant.switch do
        project = create(:project, title_multiloc: { 'en' => 'Title', 'fr-FR' => 'Titre' })
      end

      task.invoke('multi-locale.com', 'en', 'true', 'nl-NL:de-DE:es-ES')

      multi_locale_tenant.switch do
        project.reload
        aggregate_failures do
          expect(project.title_multiloc['nl-NL']).to eq('translated: Title')
          expect(project.title_multiloc['de-DE']).to eq('translated: Title')
          expect(project.title_multiloc['es-ES']).to eq('translated: Title')
        end
      end
    end
  end

  describe 'multiloc auditing and translation' do
    let_it_be(:tenant) { create(:tenant, host: 'audit-test.com', lifecycle: 'demo', locales: %w[en fr-FR nl-NL]) }

    before do
      translation_service = instance_double(MachineTranslations::MachineTranslationService)
      allow(MachineTranslations::MachineTranslationService).to receive(:new).and_return(translation_service)
      allow(translation_service).to receive(:translate) { |text, _from, _to| text }
    end

    it 'reports missing and empty locales with summary' do
      tenant.switch do
        project = create(:project, title_multiloc: { 'en' => 'Title' })
        # Create a project with empty values
        project2 = create(:project, title_multiloc: { 'en' => 'Title2' })
        project2.update_column(:title_multiloc, { 'en' => 'Title2', 'fr-FR' => '', 'nl-NL' => nil })
      end

      output = capture_stdout { task.invoke('audit-test.com', 'en') }

      aggregate_failures do
        expect(output).to include('missing: fr-FR, nl-NL')
        expect(output).to include('empty: fr-FR, nl-NL')
        expect(output).to include('SUMMARY FOR audit-test.com')
        expect(output).to include('Characters to translate:')
        expect(output).to include('Project')
      end
    end

    it 'translates missing locales and reports results' do
      project = nil
      tenant.switch do
        project = create(:project, title_multiloc: { 'en' => 'English title' })
      end

      output = capture_stdout { task.invoke('audit-test.com', 'en', 'true') }

      aggregate_failures do
        expect(output).to include('Translated Project#')
        expect(output).to include('from en to fr-FR')
        expect(output).to include('Translations made:')

        tenant.switch do
          project.reload
          expect(project.title_multiloc['fr-FR']).to eq('English title')
          expect(project.title_multiloc['nl-NL']).to eq('English title')
        end
      end
    end

    it 'skips records when source locale is not present' do
      project = nil
      tenant.switch do
        project = create(:project, title_multiloc: { 'nl-NL' => 'Dutch title' })
      end

      expect { task.invoke('audit-test.com', 'en', 'true') }
        .to output(/Skipped Project#.*: source locale 'en' not present/).to_stdout

      tenant.switch do
        project.reload
        expect(project.title_multiloc['fr-FR']).to be_nil
      end
    end

    it 'reports no issues when all locales are present' do
      tenant.switch do
        create(:project,
          title_multiloc: { 'en' => 'English', 'fr-FR' => 'French', 'nl-NL' => 'Dutch' },
          description_multiloc: { 'en' => 'Desc', 'fr-FR' => 'Desc FR', 'nl-NL' => 'Desc NL' },
          description_preview_multiloc: { 'en' => 'Preview', 'fr-FR' => 'Preview FR', 'nl-NL' => 'Preview NL' })
      end

      expect { task.invoke('audit-test.com', 'en') }
        .to output(/No issues found/).to_stdout
    end
  end

  describe 'same language copying' do
    let_it_be(:tenant) { create(:tenant, host: 'same-lang-test.com', lifecycle: 'demo', locales: %w[en fr-FR fr-BE nl-NL nl-BE]) }

    before do
      translation_service = instance_double(MachineTranslations::MachineTranslationService)
      allow(MachineTranslations::MachineTranslationService).to receive(:new).and_return(translation_service)
      allow(translation_service).to receive(:translate) { |text, _from, _to| "translated: #{text}" }
    end

    it 'copies from same language locale instead of translating' do
      project = nil
      tenant.switch do
        project = create(:project,
          title_multiloc: { 'en' => 'English', 'fr-FR' => 'Titre', 'nl-NL' => 'Nederlandse' })
      end

      output = capture_stdout { task.invoke('same-lang-test.com', 'en', 'true') }

      tenant.switch do
        project.reload
        aggregate_failures do
          # fr-BE copied from fr-FR
          expect(project.title_multiloc['fr-BE']).to eq('Titre')
          # nl-BE copied from nl-NL
          expect(project.title_multiloc['nl-BE']).to eq('Nederlandse')
          # Logs the copy
          expect(output).to include('Copied Project#')
          expect(output).to include('from fr-FR to fr-BE (same language)')
        end
      end
    end

    it 'prefers same language copy over translation even when source locale is available' do
      project = nil
      tenant.switch do
        project = create(:project, title_multiloc: { 'en' => 'English', 'fr-FR' => 'Titre' })
      end

      task.invoke('same-lang-test.com', 'en', 'true')

      tenant.switch do
        project.reload
        # Should copy from fr-FR, not translate from en
        expect(project.title_multiloc['fr-BE']).to eq('Titre')
        expect(project.title_multiloc['fr-BE']).not_to eq('translated: English')
      end
    end
  end

  describe 'craftjs_json auditing' do
    let_it_be(:tenant) { create(:tenant, host: 'craftjs-audit.com', lifecycle: 'demo', locales: %w[en fr-FR nl-NL]) }

    it 'reports missing and empty locales in craftjs_json nodes' do
      tenant.switch do
        project = create(:project)
        ContentBuilder::Layout.create!(
          content_buildable: project,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_text_multiloc({ 'en' => 'Text', 'fr-FR' => '', 'nl-NL' => nil })
        )
      end

      output = capture_stdout { task.invoke('craftjs-audit.com', 'en') }

      aggregate_failures do
        expect(output).to include('ContentBuilder::Layout craftjs_json')
        expect(output).to include('empty: fr-FR, nl-NL')
        expect(output).to include('ContentBuilder::Layout (craftjs_json)')
      end
    end

    it 'reports issues for AccordionMultiloc title and text separately' do
      tenant.switch do
        project = create(:project)
        ContentBuilder::Layout.create!(
          content_buildable: project,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_accordion(
            { 'en' => 'Accordion title' },
            { 'en' => 'Accordion text' }
          )
        )
      end

      output = capture_stdout { task.invoke('craftjs-audit.com', 'en') }
      aggregate_failures do
        expect(output).to include('title')
        expect(output).to include('text')
      end
    end

    it 'skips nodes that are not TextMultiloc or AccordionMultiloc' do
      tenant.switch do
        project = create(:project)
        ContentBuilder::Layout.create!(
          content_buildable: project,
          code: 'project_description',
          enabled: true,
          craftjs_json: {
            'ROOT' => { 'type' => { 'resolvedName' => 'Container' }, 'nodes' => ['image-node-1'], 'props' => {}, 'parent' => nil },
            'image-node-1' => { 'type' => { 'resolvedName' => 'ImageMultiloc' }, 'nodes' => [], 'props' => { 'alt' => { 'en' => 'Alt' } }, 'parent' => 'ROOT' }
          }
        )
      end

      expect { task.invoke('craftjs-audit.com', 'en') }
        .not_to output(/ContentBuilder::Layout craftjs_json/).to_stdout
    end
  end

  describe 'craftjs_json translation' do
    let_it_be(:tenant) { create(:tenant, host: 'craftjs-translate.com', lifecycle: 'demo', locales: %w[en fr-FR fr-BE]) }

    before do
      translation_service = instance_double(MachineTranslations::MachineTranslationService)
      allow(MachineTranslations::MachineTranslationService).to receive(:new).and_return(translation_service)
      allow(translation_service).to receive(:translate) { |text, _from, _to| "translated: #{text}" }
    end

    it 'translates TextMultiloc and AccordionMultiloc nodes' do
      text_layout = nil
      accordion_layout = nil
      tenant.switch do
        project1 = create(:project)
        text_layout = ContentBuilder::Layout.create!(
          content_buildable: project1,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_text_multiloc({ 'en' => 'English text' })
        )

        project2 = create(:project)
        accordion_layout = ContentBuilder::Layout.create!(
          content_buildable: project2,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_accordion({ 'en' => 'Title' }, { 'en' => 'Text' })
        )
      end

      output = capture_stdout { task.invoke('craftjs-translate.com', 'en', 'true') }

      tenant.switch do
        aggregate_failures do
          text_layout.reload
          expect(text_layout.craftjs_json['text-node-1']['props']['text']['fr-FR']).to eq('translated: English text')

          accordion_layout.reload
          accordion_props = accordion_layout.craftjs_json['accordion-node-1']['props']
          expect(accordion_props['title']['fr-FR']).to eq('translated: Title')
          expect(accordion_props['text']['fr-FR']).to eq('translated: Text')

          expect(output).to include('Translated craftjs_json text from en to fr-FR')
        end
      end
    end

    it 'skips and copies same language for craftjs_json' do
      layout_skip = nil
      layout_copy = nil
      tenant.switch do
        project1 = create(:project)
        layout_skip = ContentBuilder::Layout.create!(
          content_buildable: project1,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_text_multiloc({ 'nl-NL' => 'Dutch only' })
        )

        project2 = create(:project)
        layout_copy = ContentBuilder::Layout.create!(
          content_buildable: project2,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_text_multiloc({ 'en' => 'English', 'fr-FR' => 'Texte' })
        )
      end

      output = capture_stdout { task.invoke('craftjs-translate.com', 'en', 'true') }

      tenant.switch do
        aggregate_failures do
          # Skip when source locale missing
          expect(output).to include("Skipped craftjs_json text: source locale 'en' not present")
          layout_skip.reload
          expect(layout_skip.craftjs_json['text-node-1']['props']['text']['fr-FR']).to be_nil

          # Copy from same language
          expect(output).to include('Copied craftjs_json text from fr-FR to fr-BE (same language)')
          layout_copy.reload
          expect(layout_copy.craftjs_json['text-node-1']['props']['text']['fr-BE']).to eq('Texte')
        end
      end
    end
  end
end
# rubocop:enable RSpec/DescribeClass
