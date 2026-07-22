# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::ProjectPageLayoutService do
  subject(:service) { described_class.new }

  def description_root(child_ids)
    {
      'type' => 'div',
      'nodes' => child_ids,
      'props' => { 'id' => 'e2e-content-builder-frame' },
      'custom' => {},
      'hidden' => false,
      'isCanvas' => true,
      'displayName' => 'div',
      'linkedNodes' => {}
    }
  end

  def node(resolved_name, parent:, nodes: [], props: {}, is_canvas: false, linked_nodes: {})
    {
      'type' => { 'resolvedName' => resolved_name },
      'nodes' => nodes,
      'props' => props,
      'custom' => {},
      'hidden' => false,
      'parent' => parent,
      'isCanvas' => is_canvas,
      'displayName' => resolved_name,
      'linkedNodes' => linked_nodes
    }
  end

  let(:plain_text_description) do
    {
      'ROOT' => description_root(['txt1']),
      'txt1' => node('TextMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => '<p>Hello</p>' } })
    }
  end

  let(:rich_description) do
    {
      'ROOT' => description_root(%w[img1 col1 acc1]),
      'img1' => node('ImageMultiloc', parent: 'ROOT', props: { 'image' => { 'dataCode' => 'abc' } }),
      'col1' => node('TwoColumn', parent: 'ROOT', nodes: %w[left1 right1], props: { 'columnLayout' => '1-1' }),
      'left1' => node('Container', parent: 'col1', nodes: ['nested1'], props: { 'id' => 'left' }, is_canvas: true),
      'right1' => node('Container', parent: 'col1', props: { 'id' => 'right' }, is_canvas: true),
      'nested1' => node('TextMultiloc', parent: 'left1', props: { 'text' => { 'en' => 'nested' } }),
      'acc1' => node('AccordionMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => 'accordion' } })
    }
  end

  let(:empty_description) { { 'ROOT' => description_root([]) } }

  let(:unsupported_description) do
    {
      'ROOT' => description_root(%w[pub1 col1 txt1]),
      'pub1' => node('Published', parent: 'ROOT'),
      # An unsupported widget nested inside a surviving column must be stripped too.
      'col1' => node('TwoColumn', parent: 'ROOT', nodes: %w[left1], props: { 'columnLayout' => '1-1' }),
      'left1' => node('Container', parent: 'col1', nodes: %w[sel1 keep1], props: { 'id' => 'left' }, is_canvas: true),
      'sel1' => node('Selection', parent: 'left1'),
      'keep1' => node('TextMultiloc', parent: 'left1', props: { 'text' => { 'en' => 'kept' } }),
      'txt1' => node('TextMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => 'top' } })
    }
  end

  let(:canonical_body) { %w[PROJECT_PAGE_DESCRIPTION PROJECT_PAGE_PHASES PROJECT_PAGE_EVENTS] }

  def resolved_names(json)
    json.values.filter_map do |n|
      type = n['type']
      type.is_a?(Hash) ? type['resolvedName'] : nil
    end
  end

  def canonical_names
    %w[
      ProjectPageRoot ProjectBanner ProjectTitle ProjectPageBody
      ProjectDescriptionSection PhasesWidget EventsWidget
    ]
  end

  describe '#from_description_craftjs' do
    def build(json)
      service.from_description_craftjs(json)
    end

    it 'produces the canonical frozen structure' do
      result = build(plain_text_description)

      expect(result['ROOT']['nodes']).to eq(%w[PROJECT_PAGE_BANNER PROJECT_PAGE_TITLE PROJECT_PAGE_BODY])
      expect(result['ROOT']['type']).to eq({ 'resolvedName' => 'ProjectPageRoot' })
      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq(canonical_body)
      canonical_names.each { |name| expect(resolved_names(result)).to include(name) }
    end

    it 're-keys the description content into the description section' do
      result = build(plain_text_description)

      expect(result['PROJECT_PAGE_DESCRIPTION']['nodes']).to eq(['d_txt1'])
      expect(result['d_txt1']['parent']).to eq('PROJECT_PAGE_DESCRIPTION')
      expect(result).not_to have_key('txt1')
    end

    it 'preserves nested content and remaps inner parent/child pointers' do
      result = build(rich_description)

      expect(result['PROJECT_PAGE_DESCRIPTION']['nodes']).to eq(%w[d_img1 d_col1 d_acc1])
      expect(result['d_col1']['nodes']).to eq(%w[d_left1 d_right1])
      expect(result['d_col1']['parent']).to eq('PROJECT_PAGE_DESCRIPTION')
      expect(result['d_left1']['nodes']).to eq(['d_nested1'])
      expect(result['d_nested1']['parent']).to eq('d_left1')
    end

    it 'strips unsupported widgets and their subtrees, keeping the rest' do
      result = build(unsupported_description)

      names = resolved_names(result)
      expect(names).not_to include('Published', 'Selection')
      expect(result['PROJECT_PAGE_DESCRIPTION']['nodes']).to eq(%w[d_col1 d_txt1])
      expect(result['d_left1']['nodes']).to eq(['d_keep1'])
      expect(result).not_to have_key('d_sel1')
      expect(result).not_to have_key('d_pub1')
    end

    it 'produces the full canonical structure with an empty section for an empty description' do
      result = build(empty_description)

      expect(result['PROJECT_PAGE_DESCRIPTION']['nodes']).to eq([])
      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq(canonical_body)
      canonical_names.each { |name| expect(resolved_names(result)).to include(name) }
    end

    it 'locks every fixed section (fixed point of normalizeProjectPageLayout)' do
      result = build(empty_description)

      expect(result['PROJECT_PAGE_PHASES']['custom']).to eq(
        'title' => {
          'id' => 'app.components.ProjectPageBuilder.Widgets.phasesWidgetTitle',
          'defaultMessage' => 'Phases'
        },
        'locked' => true,
        'noPointerEvents' => true
      )
      %w[PROJECT_PAGE_BANNER PROJECT_PAGE_TITLE PROJECT_PAGE_DESCRIPTION
        PROJECT_PAGE_PHASES PROJECT_PAGE_EVENTS].each do |id|
        expect(result[id]['custom']['locked']).to be(true)
      end
    end
  end

  describe '#from_description_multiloc' do
    it 'wraps a text-only description in a TextMultiloc inside the section' do
      result = service.from_description_multiloc({ 'en' => '<p>Hello</p>' })

      section_children = result['PROJECT_PAGE_DESCRIPTION']['nodes']
      expect(section_children.length).to eq(1)
      content = result[section_children.first]
      expect(content['type']).to eq({ 'resolvedName' => 'TextMultiloc' })
      expect(content['props']['text']).to eq({ 'en' => '<p>Hello</p>' })
      expect(content['parent']).to eq('PROJECT_PAGE_DESCRIPTION')
    end

    it 'wraps a description with media in the RichTextMultiloc bridge' do
      result = service.from_description_multiloc(
        { 'en' => '<p><img data-cl2-text-image-text-reference="abc"></p>' }
      )

      content = result[result['PROJECT_PAGE_DESCRIPTION']['nodes'].first]
      expect(content['type']).to eq({ 'resolvedName' => 'RichTextMultiloc' })
    end

    it 'leaves the section empty for a blank description' do
      result = service.from_description_multiloc({ 'en' => '<p></p>' })

      expect(result['PROJECT_PAGE_DESCRIPTION']['nodes']).to eq([])
      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq(canonical_body)
    end
  end

  describe '#craftjs_json_for' do
    it 'builds from the project_description layout when one exists' do
      project = create(:project, description_multiloc: { 'en' => '<p>Ignored</p>' })
      create(:layout, content_buildable: project, code: 'project_description', craftjs_json: plain_text_description)

      result = service.craftjs_json_for(project)

      expect(result['PROJECT_PAGE_DESCRIPTION']['nodes']).to eq(['d_txt1'])
    end

    it 'builds from the description_multiloc when there is no description layout' do
      project = create(:project, description_multiloc: { 'en' => '<p>Hello</p>' })

      result = service.craftjs_json_for(project)

      content = result[result['PROJECT_PAGE_DESCRIPTION']['nodes'].first]
      expect(content['props']['text']).to eq({ 'en' => '<p>Hello</p>' })
    end

    it 'includes a FileAttachment node for every project-attached file' do
      project = create(:project, description_multiloc: { 'en' => '<p>Hello</p>' })
      attachment = create(:file_attachment, attachable: project, file: create(:file, projects: [project]))

      result = service.craftjs_json_for(project)

      section_nodes = result['PROJECT_PAGE_DESCRIPTION']['nodes']
      expect(result[section_nodes.last]['props']).to eq({ 'fileId' => attachment.file_id })
    end
  end

  describe '#append_file_nodes' do
    let(:project) { create(:project) }

    def attach_file(project, position)
      file = create(:file, projects: [project])
      create(:file_attachment, file: file, attachable: project, position: position)
    end

    it 'appends a FileAttachment node per file at the bottom of the description section, ordered by position' do
      later = attach_file(project, 2)
      earlier = attach_file(project, 1)

      json = service.from_description_multiloc({ 'en' => '<p>Hello</p>' })
      result = service.append_file_nodes(json, project)

      file_node_ids = result['PROJECT_PAGE_DESCRIPTION']['nodes'].last(2)
      expect(result[file_node_ids[0]]['props']).to eq({ 'fileId' => earlier.file_id })
      expect(result[file_node_ids[1]]['props']).to eq({ 'fileId' => later.file_id })
      expect(result[file_node_ids[0]]).to include(
        'type' => { 'resolvedName' => 'FileAttachment' },
        'parent' => 'PROJECT_PAGE_DESCRIPTION',
        'isCanvas' => false
      )
      expect(result[file_node_ids[0]]['custom']['title']).to eq(
        'id' => 'app.containers.admin.ContentBuilder.fileAttachment',
        'defaultMessage' => 'File Attachment'
      )
    end

    it 'does not duplicate files the layout already references' do
      attach_file(project, 1)

      once = service.append_file_nodes(service.from_description_multiloc({}), project)
      twice = service.append_file_nodes(once, project)

      expect(twice).to eq(once)
    end

    it 'inserts before the phases widget when the description section is absent' do
      attachment = attach_file(project, 1)
      json = service.from_description_multiloc({})
      json.delete('PROJECT_PAGE_DESCRIPTION')
      json['PROJECT_PAGE_BODY']['nodes'] = %w[PROJECT_PAGE_PHASES PROJECT_PAGE_EVENTS]

      result = service.append_file_nodes(json, project)

      body_nodes = result['PROJECT_PAGE_BODY']['nodes']
      node_id = "d_file_#{attachment.file_id}"
      expect(body_nodes.index(node_id)).to eq(body_nodes.index('PROJECT_PAGE_PHASES') - 1)
      expect(result[node_id]['parent']).to eq('PROJECT_PAGE_BODY')
    end

    it 'returns the layout unchanged when the project has no files' do
      json = service.from_description_multiloc({ 'en' => '<p>Hello</p>' })

      expect(service.append_file_nodes(json, project)).to eq(json)
    end
  end
end
