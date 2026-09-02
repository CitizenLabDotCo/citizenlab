# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::BuildableDescriptionService do
  subject(:service) { described_class.new }

  describe '#description_multiloc' do
    context 'for a project' do
      let(:project) { create(:project) }

      it 'returns the text on the project page' do
        author_description(project, { 'en' => '<p>Renew the parc</p>' })

        expect(service.description_multiloc(project)).to eq({ 'en' => '<p>Renew the parc</p>' })
      end

      it 'keeps an inline image held by a rich text widget' do
        gif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        author_description(project, { 'en' => %(<p>Renew the parc</p><img src="#{gif}" />) }, widget: 'RichTextMultiloc')

        description = service.description_multiloc(project)['en']

        expect(description).to include('<p>Renew the parc</p>')
        expect(description).to include('<img')
      end

      it 'ignores a superseded project_description layout' do
        ContentBuilder::Layout.create!(
          content_buildable: project,
          code: 'project_description',
          enabled: true,
          craftjs_json: {
            'ROOT' => craftjs_root(['TEXT']),
            'TEXT' => craftjs_node('TextMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => '<p>Superseded</p>' } })
          }
        )
        author_description(project, { 'en' => '<p>Edited on the page builder</p>' })

        expect(service.description_multiloc(project)).to eq({ 'en' => '<p>Edited on the page builder</p>' })
      end

      it 'returns an empty multiloc when the project has no page' do
        expect(service.description_multiloc(project)).to eq({})
      end

      it 'ignores a disabled page' do
        author_description(project, { 'en' => '<p>Renew the parc</p>' }).update!(enabled: false)

        expect(service.description_multiloc(project.reload)).to eq({})
      end

      it 'drops the locales the page has no text for, so a lookup still falls back' do
        author_description(project, { 'en' => '<p>Renew the parc</p>' })

        multiloc = service.description_multiloc(project)

        expect(multiloc.keys).to eq(['en'])
        expect(MultilocService.new.t(multiloc, 'nl-NL')).to eq('<p>Renew the parc</p>')
      end

      it 'returns each locale the page holds text for' do
        author_description(project, { 'en' => '<p>Renew the parc</p>', 'nl-NL' => '<p>Vernieuw het park</p>' })

        expect(service.description_multiloc(project)).to eq({
          'en' => '<p>Renew the parc</p>', 'nl-NL' => '<p>Vernieuw het park</p>'
        })
      end
    end

    context 'for a folder' do
      let(:folder) { create(:project_folder) }

      it 'returns the text of the folder description layout' do
        author_description(folder, { 'en' => '<p>All things pools</p>' })

        expect(service.description_multiloc(folder)).to eq({ 'en' => '<p>All things pools</p>' })
      end

      it 'leaves out the folder title and published projects widgets around it' do
        author_description(folder, { 'en' => '<p>All things pools</p>' })

        expect(service.description_multiloc(folder)['en']).not_to include(folder.title_multiloc['en'])
      end
    end

    it 'raises for a buildable it has no description layout for' do
      expect { service.description_multiloc(create(:phase)) }
        .to raise_error(ArgumentError, /Phase/)
    end
  end
end
