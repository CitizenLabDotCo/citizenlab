# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'rake demos:translate_missing_locales' do
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['demos:translate_missing_locales'].reenable }

  let(:task) { Rake::Task['demos:translate_missing_locales'] }

  describe 'parameter validation' do
    it 'requires a host parameter' do
      expect { task.invoke }.to output(/Host parameter is required/).to_stdout
    end

    it 'shows error if tenant not found' do
      expect { task.invoke('nonexistent.host.com') }.to output(/Tenant not found/).to_stdout
    end
  end

  describe 'lifecycle stage validation' do
    let!(:tenant) { create(:tenant, host: 'active-platform.com', lifecycle: 'active') }

    it 'prevents translations on non-demo platforms' do
      expect { task.invoke('active-platform.com', 'true') }
        .to output(/ERROR: Translations can only be run on demo platforms/).to_stdout
    end

    it 'allows audit without translate flag on non-demo platforms' do
      expect { task.invoke('active-platform.com') }
        .to output(/Lifecycle stage: active/).to_stdout
    end
  end

  describe 'multiloc auditing' do
    let!(:tenant) { create(:tenant, host: 'demo-platform.com', lifecycle: 'demo', locales: %w[en fr-FR nl-NL]) }

    it 'reports missing locales for multiloc fields' do
      tenant.switch do
        create(:project, title_multiloc: { 'en' => 'English title' })
      end

      expect { task.invoke('demo-platform.com') }
        .to output(/missing: fr-FR, nl-NL/).to_stdout
    end

    it 'reports empty locales for multiloc fields' do
      tenant.switch do
        project = create(:project, title_multiloc: { 'en' => 'English title' })
        # Manually set empty values to test empty locale detection
        project.update_column(:title_multiloc, { 'en' => 'English title', 'fr-FR' => '', 'nl-NL' => nil })
      end

      expect { task.invoke('demo-platform.com') }
        .to output(/empty: fr-FR, nl-NL/).to_stdout
    end

    it 'skips records where all locale values are empty' do
      tenant.switch do
        create(:project, title_multiloc: { 'en' => 'English title' })
        # Create a project with all empty values - this should be skipped
        project = create(:project, title_multiloc: { 'en' => 'temp' })
        project.update_column(:title_multiloc, { 'en' => '', 'fr-FR' => '' })
      end

      # Should only report 1 issue (from description_multiloc of the first project might also be counted)
      expect { task.invoke('demo-platform.com') }
        .to output(/Project \(/).to_stdout
    end

    it 'displays summary with model counts' do
      tenant.switch do
        create(:project, title_multiloc: { 'en' => 'English title' })
      end

      expect { task.invoke('demo-platform.com') }
        .to output(/SUMMARY FOR demo-platform.com/).to_stdout
    end

    it 'displays character count for translation estimation' do
      tenant.switch do
        create(:project, title_multiloc: { 'en' => 'Hello' }) # 5 chars × 2 missing locales = 10
      end

      expect { task.invoke('demo-platform.com') }
        .to output(/Characters to translate:/).to_stdout
    end
  end

  describe 'translation' do
    let!(:tenant) { create(:tenant, host: 'demo-platform.com', lifecycle: 'demo', locales: %w[en fr-FR]) }

    before do
      # Mock the translation service to return the source text (simulating translation)
      translation_service = instance_double(MachineTranslations::MachineTranslationService)
      allow(MachineTranslations::MachineTranslationService).to receive(:new).and_return(translation_service)
      allow(translation_service).to receive(:translate) { |text, _from, _to| text }
    end

    it 'translates missing locales' do
      project = nil
      tenant.switch do
        project = create(:project, title_multiloc: { 'en' => 'English title' })
      end

      task.invoke('demo-platform.com', 'true')

      tenant.switch do
        project.reload
        expect(project.title_multiloc['fr-FR']).to eq('English title')
      end
    end

    it 'uses main locale as source when available' do
      project = nil
      tenant.switch do
        project = create(:project, title_multiloc: { 'en' => 'English title', 'nl-NL' => 'Dutch title' })
      end

      task.invoke('demo-platform.com', 'true')

      tenant.switch do
        project.reload
        # Should use 'en' (main locale) as source
        expect(project.title_multiloc['fr-FR']).to eq('English title')
      end
    end

    it 'falls back to any available locale when main locale is empty' do
      project = nil
      tenant.switch do
        project = create(:project, title_multiloc: { 'nl-NL' => 'Dutch title' })
      end

      task.invoke('demo-platform.com', 'true')

      tenant.switch do
        project.reload
        expect(project.title_multiloc['fr-FR']).to eq('Dutch title')
      end
    end

    it 'reports translations made count' do
      tenant.switch do
        create(:project, title_multiloc: { 'en' => 'English title' })
      end

      expect { task.invoke('demo-platform.com', 'true') }
        .to output(/Translations made:/).to_stdout
    end

    it 'logs each translation' do
      tenant.switch do
        create(:project, title_multiloc: { 'en' => 'English title' })
      end

      expect { task.invoke('demo-platform.com', 'true') }
        .to output(/Translated Project#.* from en to fr-FR/).to_stdout
    end
  end

  describe 'no issues found' do
    let!(:tenant) { create(:tenant, host: 'demo-platform.com', lifecycle: 'demo', locales: %w[en fr-FR]) }

    it 'reports no issues when all locales are present' do
      tenant.switch do
        create(:project, title_multiloc: { 'en' => 'English', 'fr-FR' => 'French' },
          description_multiloc: { 'en' => 'Desc', 'fr-FR' => 'Desc FR' },
          description_preview_multiloc: { 'en' => 'Preview', 'fr-FR' => 'Preview FR' })
      end

      expect { task.invoke('demo-platform.com') }
        .to output(/No issues found/).to_stdout
    end
  end

  describe 'craftjs_json auditing' do
    let!(:tenant) { create(:tenant, host: 'demo-platform.com', lifecycle: 'demo', locales: %w[en fr-FR nl-NL]) }

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

    it 'reports missing locales in craftjs_json TextMultiloc nodes' do
      tenant.switch do
        project = create(:project)
        ContentBuilder::Layout.create!(
          content_buildable: project,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_text_multiloc({ 'en' => 'English text' })
        )
      end

      expect { task.invoke('demo-platform.com') }
        .to output(/ContentBuilder::Layout craftjs_json.*missing: fr-FR, nl-NL/m).to_stdout
    end

    it 'reports empty locales in craftjs_json TextMultiloc nodes' do
      tenant.switch do
        project = create(:project)
        ContentBuilder::Layout.create!(
          content_buildable: project,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_text_multiloc({ 'en' => 'English text', 'fr-FR' => '', 'nl-NL' => nil })
        )
      end

      expect { task.invoke('demo-platform.com') }
        .to output(/ContentBuilder::Layout craftjs_json.*empty: fr-FR, nl-NL/m).to_stdout
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

      output = capture_stdout { task.invoke('demo-platform.com') }
      # Should report issues for both title and text props
      expect(output).to include('title')
      expect(output).to include('text')
    end

    it 'includes craftjs_json issues in summary' do
      tenant.switch do
        project = create(:project)
        ContentBuilder::Layout.create!(
          content_buildable: project,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_text_multiloc({ 'en' => 'English text' })
        )
      end

      expect { task.invoke('demo-platform.com') }
        .to output(/ContentBuilder::Layout \(craftjs_json\)/).to_stdout
    end

    it 'skips nodes that are not TextMultiloc or AccordionMultiloc' do
      tenant.switch do
        project = create(:project)
        # Create a layout with only ImageMultiloc (should be skipped)
        ContentBuilder::Layout.create!(
          content_buildable: project,
          code: 'project_description',
          enabled: true,
          craftjs_json: {
            'ROOT' => {
              'type' => { 'resolvedName' => 'Container' },
              'nodes' => ['image-node-1'],
              'props' => {},
              'parent' => nil
            },
            'image-node-1' => {
              'type' => { 'resolvedName' => 'ImageMultiloc' },
              'nodes' => [],
              'props' => { 'alt' => { 'en' => 'Alt text' } },
              'parent' => 'ROOT'
            }
          }
        )
      end

      # Should not report any craftjs_json issues
      expect { task.invoke('demo-platform.com') }
        .not_to output(/ContentBuilder::Layout craftjs_json/).to_stdout
    end

    def capture_stdout(&)
      original_stdout = $stdout
      $stdout = StringIO.new
      yield
      $stdout.string
    ensure
      $stdout = original_stdout
    end
  end

  describe 'craftjs_json translation' do
    let!(:tenant) { create(:tenant, host: 'demo-platform.com', lifecycle: 'demo', locales: %w[en fr-FR]) }

    before do
      translation_service = instance_double(MachineTranslations::MachineTranslationService)
      allow(MachineTranslations::MachineTranslationService).to receive(:new).and_return(translation_service)
      allow(translation_service).to receive(:translate) { |text, _from, _to| "translated: #{text}" }
    end

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

    it 'translates missing locales in craftjs_json TextMultiloc nodes' do
      layout = nil
      tenant.switch do
        project = create(:project)
        layout = ContentBuilder::Layout.create!(
          content_buildable: project,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_text_multiloc({ 'en' => 'English text' })
        )
      end

      task.invoke('demo-platform.com', 'true')

      tenant.switch do
        layout.reload
        text_multiloc = layout.craftjs_json['text-node-1']['props']['text']
        expect(text_multiloc['fr-FR']).to eq('translated: English text')
      end
    end

    it 'translates AccordionMultiloc title and text props' do
      layout = nil
      tenant.switch do
        project = create(:project)
        layout = ContentBuilder::Layout.create!(
          content_buildable: project,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_accordion(
            { 'en' => 'Accordion title' },
            { 'en' => 'Accordion text' }
          )
        )
      end

      task.invoke('demo-platform.com', 'true')

      tenant.switch do
        layout.reload
        accordion_node = layout.craftjs_json['accordion-node-1']['props']
        expect(accordion_node['title']['fr-FR']).to eq('translated: Accordion title')
        expect(accordion_node['text']['fr-FR']).to eq('translated: Accordion text')
      end
    end

    it 'uses main locale as source when available' do
      layout = nil
      tenant.switch do
        project = create(:project)
        layout = ContentBuilder::Layout.create!(
          content_buildable: project,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_text_multiloc({ 'en' => 'English text', 'nl-NL' => 'Dutch text' })
        )
      end

      task.invoke('demo-platform.com', 'true')

      tenant.switch do
        layout.reload
        text_multiloc = layout.craftjs_json['text-node-1']['props']['text']
        # Should translate from 'en' (main locale) not 'nl-NL'
        expect(text_multiloc['fr-FR']).to eq('translated: English text')
      end
    end

    it 'falls back to any available locale when main locale is empty' do
      layout = nil
      tenant.switch do
        project = create(:project)
        layout = ContentBuilder::Layout.create!(
          content_buildable: project,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_text_multiloc({ 'nl-NL' => 'Dutch text' })
        )
      end

      task.invoke('demo-platform.com', 'true')

      tenant.switch do
        layout.reload
        text_multiloc = layout.craftjs_json['text-node-1']['props']['text']
        expect(text_multiloc['fr-FR']).to eq('translated: Dutch text')
      end
    end

    it 'logs craftjs_json translation' do
      tenant.switch do
        project = create(:project)
        ContentBuilder::Layout.create!(
          content_buildable: project,
          code: 'project_description',
          enabled: true,
          craftjs_json: craftjs_with_text_multiloc({ 'en' => 'English text' })
        )
      end

      expect { task.invoke('demo-platform.com', 'true') }
        .to output(/Translated craftjs_json text from en to fr-FR/).to_stdout
    end
  end
end
# rubocop:enable RSpec/DescribeClass
