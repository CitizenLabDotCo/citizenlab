# frozen_string_literal: true

require 'rails_helper'

describe 'fix_existing_tenants:change_tenant_locale rake task' do
  let(:task) { Rake::Task['fix_existing_tenants:change_tenant_locale'] }
  let(:host) { 'example.localhost' }
  let(:current_locale) { 'en' }
  let(:new_locale) { 'en-GB' }

  before do
    load_rake_tasks_if_not_loaded
    # Re-enable the task before each test (rake tasks are disabled after first run)
    task.reenable
  end

  describe 'parameter validation' do
    it 'outputs error when host is missing' do
      expect { task.invoke(nil, current_locale, new_locale) }
        .to output(/Host parameter is required/).to_stdout
    end

    it 'outputs error when current_locale is missing' do
      expect { task.invoke(host, nil, new_locale) }
        .to output(/Both current_locale and new_locale are required/).to_stdout
    end

    it 'outputs error when new_locale is missing' do
      expect { task.invoke(host, current_locale, nil) }
        .to output(/Both current_locale and new_locale are required/).to_stdout
    end

    it 'outputs error when current_locale equals new_locale' do
      expect { task.invoke(host, 'en', 'en') }
        .to output(/current_locale and new_locale cannot be the same/).to_stdout
    end

    it 'outputs error when tenant is not found' do
      expect { task.invoke('nonexistent.host', current_locale, new_locale) }
        .to output(/Tenant not found/).to_stdout
    end
  end

  describe 'locale validation' do
    let!(:tenant) { create(:tenant, host: host) }

    before do
      tenant.switch do
        settings = AppConfiguration.instance.settings
        settings['core']['locales'] = %w[en fr-FR]
        AppConfiguration.instance.update!(settings: settings)
      end
    end

    it 'outputs error when current_locale is not in configured locales' do
      expect { task.invoke(host, 'de-DE', new_locale) }
        .to output(/current_locale 'de-DE' is not in configured locales/).to_stdout
    end

    it 'outputs error when new_locale already exists in configured locales' do
      expect { task.invoke(host, 'en', 'fr-FR') }
        .to output(/new_locale 'fr-FR' already exists in configured locales/).to_stdout
    end
  end

  describe 'locale change execution' do
    let!(:tenant) { create(:tenant, host: host) }

    before do
      tenant.switch do
        settings = AppConfiguration.instance.settings
        settings['core']['locales'] = %w[en fr-FR]
        AppConfiguration.instance.update!(settings: settings)
      end
    end

    describe 'updating AppConfiguration settings' do
      it 'adds new locale and removes old locale from settings' do
        task.invoke(host, current_locale, new_locale)

        tenant.switch do
          locales = AppConfiguration.instance.settings('core', 'locales')
          expect(locales).to include(new_locale)
          expect(locales).not_to include(current_locale)
        end
      end

      it 'preserves the position of the locale in the list' do
        task.invoke(host, current_locale, new_locale)

        tenant.switch do
          locales = AppConfiguration.instance.settings('core', 'locales')
          expect(locales).to eq(%w[en-GB fr-FR])
        end
      end
    end

    describe 'updating user locales' do
      it 'updates users with the current locale to the new locale' do
        tenant.switch do
          user1 = create(:user, locale: 'en')
          user2 = create(:user, locale: 'fr-FR')

          task.reenable
          task.invoke(host, current_locale, new_locale)

          expect(user1.reload.locale).to eq(new_locale)
          expect(user2.reload.locale).to eq('fr-FR')
        end
      end
    end

    describe 'updating multiloc fields' do
      it 'renames locale keys in multiloc fields' do
        tenant.switch do
          project = create(:project, title_multiloc: { 'en' => 'English Title', 'fr-FR' => 'French Title' })

          task.reenable
          task.invoke(host, current_locale, new_locale)

          project.reload
          expect(project.title_multiloc).to eq({ 'en-GB' => 'English Title', 'fr-FR' => 'French Title' })
        end
      end

      it 'does not overwrite existing target locale in multiloc' do
        tenant.switch do
          # Create a project that already has both locales
          project = create(:project, title_multiloc: { 'en' => 'English', 'en-GB' => 'British English', 'fr-FR' => 'French' })

          # Add en-GB to configured locales first
          settings = AppConfiguration.instance.settings
          settings['core']['locales'] = %w[en en-GB fr-FR]
          AppConfiguration.instance.update!(settings: settings)

          task.reenable
          task.invoke(host, current_locale, new_locale)

          # en & en-GB should remain unchanged
          project.reload
          expect(project.title_multiloc['en']).to eq('English')
          expect(project.title_multiloc['en-GB']).to eq('British English')
        end
      end

      it 'handles multiloc fields with only the current locale' do
        tenant.switch do
          project = create(:project, title_multiloc: { 'en' => 'Only English' })

          task.reenable
          task.invoke(host, current_locale, new_locale)

          project.reload
          expect(project.title_multiloc).to eq({ 'en-GB' => 'Only English' })
        end
      end

      it 'skips records without the current locale key' do
        tenant.switch do
          project = create(:project, title_multiloc: { 'fr-FR' => 'Only French' })
          original_multiloc = project.title_multiloc.dup

          task.reenable
          task.invoke(host, current_locale, new_locale)

          project.reload
          expect(project.title_multiloc).to eq(original_multiloc)
        end
      end

      it 'does not update updated_at timestamps' do
        tenant.switch do
          project = create(:project, title_multiloc: { 'en' => 'English Title' })
          original_updated_at = project.updated_at

          task.reenable
          task.invoke(host, current_locale, new_locale)

          project.reload
          # Use be_within to handle microsecond precision differences from database
          expect(project.updated_at).to be_within(1.second).of(original_updated_at)
        end
      end
    end

    describe 'updating craftjs_json layouts' do
      it 'renames locale keys in craftjs_json text nodes' do
        tenant.switch do
          layout = create(:layout, craftjs_json: {
            'node1' => {
              'type' => { 'resolvedName' => 'TextMultiloc' },
              'props' => {
                'text' => { 'en' => 'English text', 'fr-FR' => 'French text' }
              }
            }
          })

          task.reenable
          task.invoke(host, current_locale, new_locale)

          layout.reload
          text_multiloc = layout.craftjs_json.dig('node1', 'props', 'text')
          expect(text_multiloc).to eq({ 'en-GB' => 'English text', 'fr-FR' => 'French text' })
        end
      end

      it 'renames locale keys in AccordionMultiloc title and text' do
        tenant.switch do
          layout = create(:layout, craftjs_json: {
            'node1' => {
              'type' => { 'resolvedName' => 'AccordionMultiloc' },
              'props' => {
                'text' => { 'en' => 'English text' },
                'title' => { 'en' => 'English title' }
              }
            }
          })

          task.reenable
          task.invoke(host, current_locale, new_locale)

          layout.reload
          props = layout.craftjs_json.dig('node1', 'props')
          expect(props['text']).to eq({ 'en-GB' => 'English text' })
          expect(props['title']).to eq({ 'en-GB' => 'English title' })
        end
      end

      it 'skips non-text craftjs nodes' do
        tenant.switch do
          layout = create(:layout, craftjs_json: {
            'node1' => {
              'type' => { 'resolvedName' => 'Container' },
              'props' => {
                'someData' => { 'en' => 'Should not change' }
              }
            }
          })
          original_json = layout.craftjs_json.deep_dup

          task.reenable
          task.invoke(host, current_locale, new_locale)

          layout.reload
          expect(layout.craftjs_json).to eq(original_json)
        end
      end
    end

    describe 'summary output' do
      it 'outputs a summary of changes made' do
        tenant.switch do
          create(:user, locale: 'en')
          create(:project, title_multiloc: { 'en' => 'Title' })
        end

        expect { task.invoke(host, current_locale, new_locale) }
          .to output(/SUMMARY.*Locale change complete: en -> en-GB/m).to_stdout
      end
    end
  end
end
