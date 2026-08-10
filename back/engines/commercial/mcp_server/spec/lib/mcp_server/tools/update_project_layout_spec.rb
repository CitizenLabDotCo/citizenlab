# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdateProjectLayout do
  let_it_be(:current_user) { create(:super_admin) }

  def body = 'PROJECT_PAGE_BODY'

  # Every example patches the same project as the same user; only the patch itself varies.
  def patch(user: current_user, **params)
    run_mcp_tool(described_class, params: { project_id: project.id, **params }, current_user: user)
  end

  # Ordinary widgets now, but a patch re-sending the body's `nodes` must still list them.
  def seeded_widget_ids = project_page_craftjs[body]['nodes']

  def text_node(parent: body, text: { 'en' => '<p>Original</p>' })
    craftjs_node('TextMultiloc', parent: parent, props: { 'text' => text })
  end

  # The body node with `content_ids` as its content, followed by the seeded widgets.
  def body_with(content_ids)
    initial_graph[body].merge('nodes' => content_ids + seeded_widget_ids)
  end

  def accordion_content
    {
      'ACC1' => craftjs_node(
        'AccordionMultiloc',
        parent: body,
        props: { 'title' => { 'en' => 'FAQ' }, 'openByDefault' => false },
        custom: {
          'title' => { 'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc', 'defaultMessage' => 'Accordion' },
          'hasChildren' => true
        },
        linkedNodes: { 'accordion-content' => 'CONT1' }
      ),
      'CONT1' => craftjs_node('Container', parent: 'ACC1', isCanvas: true, nodes: ['TXT1']),
      'TXT1' => text_node(parent: 'CONT1', text: { 'en' => '<p>Answer</p>' })
    }
  end

  let(:initial_graph) { project_page_craftjs('T1' => text_node) }
  # Everything the backend seeds: the scaffold plus the phases and events widgets.
  let(:seeded_ids) { project_page_craftjs.keys }

  def layout_for(project)
    ContentBuilder::Layout.find_by(content_buildable: project, code: 'project_page')
  end

  context 'when the project is draft' do
    let(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }

    context 'when the project has no page layout (provisioning anomaly)' do
      it 'returns an error instead of creating one' do
        response = patch(nodes: { 'T2' => text_node })

        expect(response).to be_error
        expect(response.content.first[:text]).to include('has no page layout')
        expect(layout_for(project)).to be_nil
      end
    end

    context 'with an existing page layout' do
      let!(:layout) { create(:layout, project: project, code: 'project_page', craftjs_json: initial_graph) }

      it 'edits a single node (symbol-keyed node params) without touching others' do
        # Symbol keys, matching how the MCP SDK delivers tool call arguments.
        updated_node = {
          type: { resolvedName: 'TextMultiloc' },
          nodes: [],
          props: { text: { en: '<p>Updated</p>' } },
          custom: {},
          hidden: false,
          parent: body,
          isCanvas: false,
          displayName: 'TextMultiloc',
          linkedNodes: {}
        }

        response = patch(nodes: { 'T1' => updated_node })

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.dig('T1', 'props', 'text', 'en')).to eq('<p>Updated</p>')
        expect(layout.craftjs_json['ROOT']).to eq(initial_graph['ROOT'])
      end

      it 'inserts a new node by also sending the page body with its updated nodes array' do
        response = patch(nodes: { body => body_with(%w[T1 T2]), 'T2' => text_node(text: { 'en' => '<p>New</p>' }) })

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json[body]['nodes']).to eq(%w[T1 T2] + seeded_widget_ids)
        expect(layout.craftjs_json.dig('T2', 'props', 'text', 'en')).to eq('<p>New</p>')
      end

      it 'reorders the phases and events widgets among the content' do
        reordered = ['PROJECT_PAGE_EVENTS'] + (initial_graph[body]['nodes'] - ['PROJECT_PAGE_EVENTS'])
        response = patch(nodes: { body => initial_graph[body].merge('nodes' => reordered) })

        expect(response).not_to be_error
        expect(layout.reload.craftjs_json[body]['nodes']).to eq(reordered)
      end

      # Editing these was rejected while they counted as scaffold; sectionBackground is
      # the prop the unlock added, so this is the case the new enum exists for.
      it 'edits the phases widget, which is no longer part of the scaffold' do
        phases = initial_graph['PROJECT_PAGE_PHASES'].merge('props' => { 'sectionBackground' => 'white' })

        response = patch(nodes: { 'PROJECT_PAGE_PHASES' => phases })

        expect(response).not_to be_error
        expect(layout.reload.craftjs_json.dig('PROJECT_PAGE_PHASES', 'props', 'sectionBackground')).to eq('white')
      end

      it 'rejects a sectionBackground outside its enum' do
        phases = initial_graph['PROJECT_PAGE_PHASES'].merge('props' => { 'sectionBackground' => 'chartreuse' })

        response = patch(nodes: { 'PROJECT_PAGE_PHASES' => phases })

        expect(response).to be_error
        expect(response.content.first[:text]).to include('must be one of: colored, white')
        expect(layout.reload.craftjs_json).to eq(initial_graph)
      end

      it 'inserts a second phases widget, so a deleted one can be put back' do
        response = patch(nodes: {
          body => body_with(%w[T1 PH2]),
          'PH2' => craftjs_node('PhasesWidget', parent: body, props: { 'sectionBackground' => 'colored' })
        })

        expect(response).not_to be_error
        expect(layout.reload.craftjs_json).to have_key('PH2')
      end

      it 'deletes the phases widget, which is no longer part of the scaffold' do
        response = patch(delete_node_ids: ['PROJECT_PAGE_PHASES'])

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json).not_to have_key('PROJECT_PAGE_PHASES')
        expect(layout.craftjs_json[body]['nodes']).to eq(initial_graph[body]['nodes'] - ['PROJECT_PAGE_PHASES'])
      end

      it 'deletes a content node and detaches it from the page body' do
        response = patch(delete_node_ids: ['T1'])

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.keys).to match_array(seeded_ids)
        expect(layout.craftjs_json[body]['nodes']).to eq(seeded_widget_ids)
      end

      # Disabling a page layout hides the whole page with no admin UI to undo it,
      # so the tool has no write path for it.
      it 'offers no way to disable the layout' do
        expect(described_class.new.input_schema[:properties]).not_to have_key(:enabled)

        response = patch(enabled: false)

        expect(response).not_to be_error
        expect(layout.reload.enabled).to be(true)
      end

      it 'rejects a patch that leaves a node unreferenced, returning a reference for just the offending widgets' do
        original_json = layout.craftjs_json.deep_dup

        response = patch(nodes: { 'T3' => text_node })

        expect(response).to be_error
        text = response.content.first[:text]
        expect(text).to include('T3')
        expect(text).to include(McpServer::LayoutWidgets::FORMAT_RULES)
        expect(text).to include(McpServer::LayoutWidgets::DOCS['TextMultiloc'])
        expect(text).not_to include(McpServer::LayoutWidgets::DOCS['IframeMultiloc'])
        expect(layout.reload.craftjs_json).to eq(original_json)
      end

      it 'returns an error naming the id when delete_node_ids references an unknown node' do
        response = patch(delete_node_ids: ['does-not-exist'])

        expect(response).to be_error
        expect(response.content.first[:text]).to include('do not exist in the layout: does-not-exist')
        expect(layout.reload.craftjs_json.keys).to match_array(seeded_ids + ['T1'])
      end

      it 'rejects an id listed in both delete_node_ids and nodes' do
        response = patch(nodes: { 'T1' => text_node(text: { 'en' => '<p>Replaced</p>' }) }, delete_node_ids: ['T1'])

        expect(response).to be_error
        expect(response.content.first[:text]).to include('both delete_node_ids and nodes')
        expect(layout.reload.craftjs_json.dig('T1', 'props', 'text', 'en')).to eq('<p>Original</p>')
      end

      it 'rejects creating any legacy node type, naming what to use instead' do
        McpServer::LayoutWidgets::LEGACY_ALTERNATIVES.each do |widget, alternative|
          response = patch(nodes: { body => body_with(%w[T1 NEW]), 'NEW' => craftjs_node(widget, parent: body) })

          expect(response).to be_error
          expect(response.content.first[:text]).to include(alternative)
          expect(layout.reload.craftjs_json).not_to have_key('NEW')
        end
      end

      describe 'scaffold protection' do
        it 'rejects deleting a scaffold node' do
          ['ROOT', body, 'PROJECT_PAGE_BANNER'].each do |id|
            response = patch(delete_node_ids: [id])

            expect(response).to be_error
            expect(response.content.first[:text]).to include('fixed page scaffold')
            expect(layout.reload.craftjs_json).to have_key(id)
          end
        end

        it 'rejects editing a scaffold node other than the body' do
          root = initial_graph['ROOT'].merge('nodes' => %w[PROJECT_PAGE_TITLE PROJECT_PAGE_BANNER PROJECT_PAGE_BODY])

          response = patch(nodes: { 'ROOT' => root })

          expect(response).to be_error
          expect(response.content.first[:text]).to include('cannot be added or edited')
          expect(layout.reload.craftjs_json).to eq(initial_graph)
        end

        it 'rejects adding a second node of a scaffold type' do
          response = patch(nodes: {
            body => body_with(%w[T1 BODY2]),
            'BODY2' => craftjs_node('ProjectPageBody', parent: body, isCanvas: true)
          })

          expect(response).to be_error
          expect(response.content.first[:text]).to include('cannot be added or edited')
        end

        it 'redirects title and banner edits to update_project' do
          banner = initial_graph['PROJECT_PAGE_BANNER'].merge('props' => { 'alt' => { 'en' => 'New alt' } })

          response = patch(nodes: { 'PROJECT_PAGE_BANNER' => banner })

          expect(response).to be_error
          expect(response.content.first[:text]).to include('update_project')
        end

        it 'rejects moving the page body' do
          moved = initial_graph[body].merge('parent' => 'PROJECT_PAGE_TITLE')

          response = patch(nodes: { body => moved })

          expect(response).to be_error
          expect(response.content.first[:text]).to include('also changes: parent')
        end

        # `nodes` is the only part of the body node a patch may change.
        %w[custom isCanvas hidden displayName].each do |key|
          it "rejects a body patch that changes #{key}" do
            tampered = initial_graph[body].merge(key => key == 'custom' ? {} : 'tampered')

            response = patch(nodes: { body => tampered })

            expect(response).to be_error
            expect(response.content.first[:text]).to include("also changes: #{key}")
            expect(layout.reload.craftjs_json).to eq(initial_graph)
          end
        end

        it 'rejects content placed outside the page body' do
          response = patch(nodes: { 'T9' => text_node(parent: 'ROOT') })

          expect(response).to be_error
          expect(response.content.first[:text]).to include('inside the page body')
          expect(layout.reload.craftjs_json).to eq(initial_graph)
        end
      end
    end

    context 'with an accordion in the page body' do
      let!(:layout) do
        create(:layout, project: project, code: 'project_page',
          craftjs_json: project_page_craftjs(accordion_content))
      end

      it "deletes the accordion's slot container and detaches the linkedNodes reference" do
        response = patch(delete_node_ids: ['CONT1'])

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.keys).to match_array(seeded_ids + ['ACC1'])
        expect(layout.craftjs_json.dig('ACC1', 'linkedNodes')).to eq({})
      end

      it 'tolerates delete_node_ids listing both an ancestor and its descendant' do
        response = patch(delete_node_ids: %w[ACC1 TXT1])

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.keys).to match_array(seeded_ids)
        expect(layout.craftjs_json[body]['nodes']).to eq(seeded_widget_ids)
      end
    end

    context 'with a legacy widget in the page body' do
      let!(:layout) do
        create(:layout, project: project, code: 'project_page', craftjs_json: project_page_craftjs(
          'T1' => text_node,
          'LEG' => craftjs_node('RichTextMultiloc', parent: body, props: { 'text' => { 'en' => '<p>Old</p>' } })
        ))
      end

      it 'accepts a sparse edit that does not touch the legacy node' do
        response = patch(nodes: { 'T1' => text_node(text: { 'en' => '<p>Updated</p>' }) })

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.dig('T1', 'props', 'text', 'en')).to eq('<p>Updated</p>')
        expect(layout.craftjs_json.dig('LEG', 'type', 'resolvedName')).to eq('RichTextMultiloc')
      end

      it 'edits the legacy node in place' do
        edited = craftjs_node('RichTextMultiloc', parent: body, props: { 'text' => { 'en' => '<p>New</p>' } })

        response = patch(nodes: { 'LEG' => edited })

        expect(response).not_to be_error
        expect(layout.reload.craftjs_json.dig('LEG', 'props', 'text', 'en')).to eq('<p>New</p>')
      end

      it 'deletes the legacy node' do
        response = patch(delete_node_ids: ['LEG'])

        expect(response).not_to be_error
        expect(layout.reload.craftjs_json).not_to have_key('LEG')
      end

      # Reusing an existing node's id must not bypass the legacy-widget check.
      it 'rejects converting an existing content node into a legacy one' do
        legacy = craftjs_node('RichTextMultiloc', parent: body, props: { 'text' => { 'en' => '<p>Smuggled</p>' } })

        response = patch(nodes: { 'T1' => legacy })

        expect(response).to be_error
        expect(response.content.first[:text]).to include('T1: RichTextMultiloc is a legacy node type')
        expect(layout.reload.craftjs_json.dig('T1', 'type', 'resolvedName')).to eq('TextMultiloc')
      end

      ContentBuilder::Craftjs::WidgetSpecs::LEGACY_WIDGETS.each do |widget|
        it "rejects creating a new #{widget} node" do
          response = patch(nodes: {
            body => body_with(%w[T1 LEG NEW]),
            'NEW' => craftjs_node(widget, parent: body, props: { 'text' => { 'en' => '<p>New</p>' } })
          })

          expect(response).to be_error
          expect(response.content.first[:text]).to include(
            "NEW: #{widget} is a legacy node type",
            McpServer::LayoutWidgets::LEGACY_ALTERNATIVES[widget]
          )
          expect(layout.reload.craftjs_json).not_to have_key('NEW')
        end
      end
    end

    # Older pages wrap their content in a ProjectDescriptionSection until the FE's
    # next save; the tool must be able to patch through it.
    context 'with a legacy ProjectDescriptionSection wrapper' do
      let(:legacy_graph) do
        project_page_craftjs(
          'SEC1' => craftjs_node('ProjectDescriptionSection', parent: body, isCanvas: true, nodes: %w[T1]),
          'T1' => text_node(parent: 'SEC1')
        )
      end

      let!(:layout) { create(:layout, project: project, code: 'project_page', craftjs_json: legacy_graph) }

      it 'adds content inside the wrapper' do
        response = patch(nodes: {
          'SEC1' => legacy_graph['SEC1'].merge('nodes' => %w[T1 T2]),
          'T2' => text_node(parent: 'SEC1', text: { 'en' => '<p>New</p>' })
        })

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json['SEC1']['nodes']).to eq(%w[T1 T2])
        expect(layout.craftjs_json[body]['nodes']).to eq(['SEC1'] + seeded_widget_ids)
      end

      it 'lets the wrapper be emptied out and deleted' do
        response = patch(delete_node_ids: ['SEC1'])

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.keys).to match_array(seeded_ids)
        expect(layout.craftjs_json[body]['nodes']).to eq(seeded_widget_ids)
      end
    end

    context 'with no content besides the seeded widgets' do
      let!(:layout) { create(:layout, project: project, code: 'project_page', craftjs_json: project_page_craftjs) }

      context 'importing a remote image' do
        # CarrierWave's SSRF protection resolves the hostname via real DNS before
        # WebMock intercepts the request, so the host must actually resolve.
        let(:image_url) { 'https://example.com/cat.png' }

        let(:image_patch) do
          {
            body => body_with(['IMG1']),
            'IMG1' => craftjs_node(
              'ImageMultiloc',
              parent: body,
              props: { 'image' => { 'imageUrl' => image_url }, 'alt' => { 'en' => 'A cat' } }
            )
          }
        end

        it 'imports a new image from a public imageUrl' do
          stub_request(:get, image_url).to_return(
            status: 200,
            body: Rails.root.join('spec/fixtures/logo.png').binread,
            headers: { 'Content-Type' => 'image/png' }
          )

          response = patch(nodes: image_patch)

          expect(response).not_to be_error
          expect(ContentBuilder::LayoutImage.count).to eq(1)

          image_props = layout_for(project).craftjs_json.dig('IMG1', 'props', 'image')
          expect(image_props['dataCode']).to be_present
          expect(image_props).not_to have_key('imageUrl')
        end

        it 'returns an image import error and saves nothing when the download fails' do
          stub_request(:get, image_url).to_return(status: 404)

          response = patch(nodes: image_patch)

          expect(response).to be_error
          expect(response.content.first[:text]).to include('Image import failed')
          expect(layout.reload.craftjs_json).to eq(project_page_craftjs)
          expect(ContentBuilder::LayoutImage.count).to eq(0)
        end
      end

      describe 'the node cap' do
        def patch_with_children(count)
          child_ids = (1..count).map { |i| "T#{i}" }
          patch = { body => body_with(child_ids) }
          child_ids.each { |id| patch[id] = text_node(text: { 'en' => "<p>#{id}</p>" }) }
          patch
        end

        it 'accepts a graph with exactly the maximum number of nodes' do
          patch = patch_with_children(described_class::MAX_NODES - seeded_ids.size)

          response = patch(nodes: patch)

          expect(response).not_to be_error
          expect(layout.reload.craftjs_json.size).to eq(described_class::MAX_NODES)
        end

        it 'rejects a graph one node above the cap' do
          patch = patch_with_children(described_class::MAX_NODES - seeded_ids.size + 1)

          response = patch(nodes: patch)

          expect(response).to be_error
          expect(response.content.first[:text]).to include('maximum')
          expect(layout.reload.craftjs_json.keys).to match_array(seeded_ids)
        end
      end
    end
  end

  context 'when the project is not draft' do
    let(:project) { create(:project, admin_publication_attributes: { publication_status: 'published' }) }
    let!(:layout) { create(:layout, project: project, code: 'project_page', craftjs_json: initial_graph) }

    it 'refuses to edit the layout' do
      response = patch(nodes: { 'T1' => text_node(text: { 'en' => '<p>Updated</p>' }) })

      expect(response).to be_unauthorized_project
      expect(layout.reload.craftjs_json).to eq(initial_graph)
    end
  end

  context 'when the user is not a moderator' do
    let(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
    let!(:layout) { create(:layout, project: project, code: 'project_page', craftjs_json: initial_graph) }
    let(:regular_user) { create(:user) }

    it 'refuses to save the layout' do
      response = patch(nodes: { 'T1' => text_node(text: { 'en' => '<p>Hacked</p>' }) }, user: regular_user)

      expect(response).to be_unauthorized
      expect(layout.reload.craftjs_json).to eq(initial_graph)
    end

    it 'reports the authorization error even when the patch itself is invalid' do
      # An unreferenced orphan node: validation would reject it, but authorization
      # runs first and its error is the one returned.
      response = patch(nodes: { 'T9' => text_node }, user: regular_user)

      expect(response).to be_unauthorized
      expect(response.content.first[:text]).not_to include('Layout NOT saved')
      expect(layout.reload.craftjs_json).to eq(initial_graph)
    end
  end
end
