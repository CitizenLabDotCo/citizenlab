# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::BuildableDescriptionService do
  subject(:service) { described_class.new }

  def provision(buildable)
    ContentBuilder::DescriptionLayoutService.new.provision_for(buildable)
    buildable
  end

  describe '#description_multiloc' do
    context 'for a project' do
      it 'returns the description held by the project page layout' do
        project = provision(create(:project, description_multiloc: { 'en' => '<p>Renew the parc</p>' }))

        expect(service.description_multiloc(project)).to eq({ 'en' => '<p>Renew the parc</p>' })
      end

      it 'keeps an inline image reference on the bridge widget' do
        gif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        project = provision(create(:project, description_multiloc: {
          'en' => %(<p>Renew the parc</p><img src="#{gif}" />)
        }))
        text_reference = project.text_images.sole.text_reference

        expect(service.description_multiloc(project)).to eq({
          'en' => %(<p>Renew the parc</p><img data-cl2-text-image-text-reference="#{text_reference}">)
        })
      end

      it 'reads the project page layout rather than the description layout it superseded' do
        project = provision(create(:project, description_multiloc: { 'en' => '<p>Superseded</p>' }))
        page = project.content_builder_layouts.find_by!(code: 'project_page')
        node_id = page.craftjs_json['PROJECT_PAGE_INTRO_LEFT']['nodes'].first
        page.craftjs_json[node_id]['props']['text'] = { 'en' => '<p>Edited on the page builder</p>' }
        page.save!

        expect(service.description_multiloc(project)).to eq({ 'en' => '<p>Edited on the page builder</p>' })
      end

      # An HTML block keeps its body in `props.html`, not `props.text`.
      it 'returns the raw HTML of an HTML block widget on the page' do
        project = provision(create(:project, description_multiloc: { 'en' => '<p>Renew the parc</p>' }))
        page = project.content_builder_layouts.find_by!(code: 'project_page')
        node_id = page.craftjs_json['PROJECT_PAGE_INTRO_LEFT']['nodes'].first
        page.craftjs_json[node_id] = craftjs_node(
          'HtmlBlockMultiloc',
          parent: 'PROJECT_PAGE_INTRO_LEFT',
          props: { 'html' => { 'en' => '<p>Raw block</p>' } }
        )
        page.save!

        expect(service.description_multiloc(project)).to eq({ 'en' => '<p>Raw block</p>' })
      end

      it 'returns an empty multiloc when the project has no layout' do
        expect(service.description_multiloc(create(:project))).to eq({})
      end

      it 'ignores a disabled layout' do
        project = provision(create(:project, description_multiloc: { 'en' => '<p>Renew the parc</p>' }))
        project.content_builder_layouts.find_by!(code: 'project_page').update!(enabled: false)

        expect(service.description_multiloc(project.reload)).to eq({})
      end

      it 'drops the locales the layout has no text for, so a lookup still falls back' do
        project = provision(create(:project, description_multiloc: { 'en' => '<p>Renew the parc</p>' }))

        multiloc = service.description_multiloc(project)

        expect(multiloc.keys).to eq(['en'])
        expect(MultilocService.new.t(multiloc, 'nl-NL')).to eq('<p>Renew the parc</p>')
      end

      it 'returns each locale the layout holds text for' do
        project = provision(create(:project, description_multiloc: {
          'en' => '<p>Renew the parc</p>', 'nl-NL' => '<p>Vernieuw het park</p>'
        }))

        expect(service.description_multiloc(project)).to eq({
          'en' => '<p>Renew the parc</p>', 'nl-NL' => '<p>Vernieuw het park</p>'
        })
      end
    end

    context 'for a folder' do
      it 'returns the description held by the folder layout' do
        folder = provision(create(:project_folder, description_multiloc: { 'en' => '<p>All things pools</p>' }))

        expect(service.description_multiloc(folder)).to eq({ 'en' => '<p>All things pools</p>' })
      end

      it 'leaves out the folder title and published projects widgets around it' do
        folder = provision(create(:project_folder, description_multiloc: { 'en' => '<p>All things pools</p>' }))

        expect(service.description_multiloc(folder)['en']).not_to include(folder.title_multiloc['en'])
      end
    end

    it 'raises for a buildable it has no description layout for' do
      expect { service.description_multiloc(create(:phase)) }
        .to raise_error(ArgumentError, /Phase/)
    end
  end
end
