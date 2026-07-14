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

  let(:project_widgets) { %w[PROJECT_PAGE_PHASES PROJECT_PAGE_EVENTS] }

  def resolved_names(json)
    json.values.filter_map do |n|
      type = n['type']
      type.is_a?(Hash) ? type['resolvedName'] : nil
    end
  end

  def canonical_names
    %w[
      ProjectPageRoot ProjectBanner ProjectTitle ProjectPageBody
      PhasesWidget EventsWidget
    ]
  end

  describe '#from_description_craftjs' do
    def build(json)
      service.from_description_craftjs(json)
    end

    it 'produces the canonical structure' do
      result = build(plain_text_description)

      expect(result['ROOT']['nodes']).to eq(%w[PROJECT_PAGE_BANNER PROJECT_PAGE_TITLE PROJECT_PAGE_BODY])
      expect(result['ROOT']['type']).to eq({ 'resolvedName' => 'ProjectPageRoot' })
      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq(['d_txt1'] + project_widgets)
      canonical_names.each { |name| expect(resolved_names(result)).to include(name) }
    end

    it 're-keys the description content into the body' do
      result = build(plain_text_description)

      expect(result['d_txt1']['parent']).to eq('PROJECT_PAGE_BODY')
      expect(result).not_to have_key('txt1')
    end

    it 'preserves nested content and remaps inner parent/child pointers' do
      result = build(rich_description)

      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq(%w[d_img1 d_col1 d_acc1] + project_widgets)
      expect(result['d_col1']['nodes']).to eq(%w[d_left1 d_right1])
      expect(result['d_col1']['parent']).to eq('PROJECT_PAGE_BODY')
      expect(result['d_left1']['nodes']).to eq(['d_nested1'])
      expect(result['d_nested1']['parent']).to eq('d_left1')
    end

    it 'strips unsupported widgets and their subtrees, keeping the rest' do
      result = build(unsupported_description)

      names = resolved_names(result)
      expect(names).not_to include('Published', 'Selection')
      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq(%w[d_col1 d_txt1] + project_widgets)
      expect(result['d_left1']['nodes']).to eq(['d_keep1'])
      expect(result).not_to have_key('d_sel1')
      expect(result).not_to have_key('d_pub1')
    end

    it 'produces the full canonical structure for an empty description' do
      result = build(empty_description)

      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq(project_widgets)
      canonical_names.each { |name| expect(resolved_names(result)).to include(name) }
    end

    it 'locks only the header widgets (fixed point of normalizeProjectPageLayout)' do
      result = build(empty_description)

      expect(result['PROJECT_PAGE_PHASES']['custom']).to eq(
        'title' => {
          'id' => 'app.components.ProjectPageBuilder.Widgets.phasesWidgetTitle',
          'defaultMessage' => 'Phases'
        },
        'noPointerEvents' => true
      )
      %w[PROJECT_PAGE_BANNER PROJECT_PAGE_TITLE].each do |id|
        expect(result[id]['custom']['locked']).to be(true)
      end
      project_widgets.each do |id|
        expect(result[id]['custom']).not_to have_key('locked')
      end
    end
  end

  describe '#from_description_multiloc' do
    it 'wraps a text-only description in a TextMultiloc in the body' do
      result = service.from_description_multiloc({ 'en' => '<p>Hello</p>' })

      content_id = result['PROJECT_PAGE_BODY']['nodes'].first
      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq([content_id] + project_widgets)
      content = result[content_id]
      expect(content['type']).to eq({ 'resolvedName' => 'TextMultiloc' })
      expect(content['props']['text']).to eq({ 'en' => '<p>Hello</p>' })
      expect(content['parent']).to eq('PROJECT_PAGE_BODY')
    end

    it 'wraps a description with media in the RichTextMultiloc bridge' do
      result = service.from_description_multiloc(
        { 'en' => '<p><img data-cl2-text-image-text-reference="abc"></p>' }
      )

      content = result[result['PROJECT_PAGE_BODY']['nodes'].first]
      expect(content['type']).to eq({ 'resolvedName' => 'RichTextMultiloc' })
    end

    it 'leaves the body without content for a blank description' do
      result = service.from_description_multiloc({ 'en' => '<p></p>' })

      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq(project_widgets)
    end
  end

  describe '#craftjs_json_for' do
    it 'builds from the project_description layout when one exists' do
      project = create(:project, description_multiloc: { 'en' => '<p>Ignored</p>' })
      create(:layout, content_buildable: project, code: 'project_description', craftjs_json: plain_text_description)

      result = service.craftjs_json_for(project)

      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq(['d_txt1'] + project_widgets)
    end

    it 'builds from the description_multiloc when there is no description layout' do
      project = create(:project, description_multiloc: { 'en' => '<p>Hello</p>' })

      result = service.craftjs_json_for(project)

      content = result[result['PROJECT_PAGE_BODY']['nodes'].first]
      expect(content['props']['text']).to eq({ 'en' => '<p>Hello</p>' })
    end
  end
end
