# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdateProjectLayout do
  let_it_be(:current_user) { create(:super_admin) }

  def text_node(parent:, text:)
    craftjs_node('TextMultiloc', parent: parent, props: { 'text' => text })
  end

  def accordion_graph
    {
      'ROOT' => craftjs_root(['ACC1']),
      'ACC1' => craftjs_node(
        'AccordionMultiloc',
        parent: 'ROOT',
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

  let(:initial_graph) do
    {
      'ROOT' => craftjs_root(['T1']),
      'T1' => text_node(parent: 'ROOT', text: { 'en' => '<p>Original</p>' })
    }
  end

  def layout_for(project)
    ContentBuilder::Layout.find_by(content_buildable: project, code: 'project_description')
  end

  context 'when the project is draft' do
    let(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }

    context 'and there is no existing layout' do
      it 'creates a layout from a full node graph' do
        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, nodes: initial_graph },
          current_user:
        )

        expect(response).not_to be_error

        layout = layout_for(project)
        expect(layout).to be_present
        expect(layout.craftjs_json.keys).to match_array(%w[ROOT T1])
        expect(response.structured_content[:outline]).to be_an(Array)
        expect(response.structured_content[:outline].first[:id]).to eq('ROOT')
      end

      it 'creates an accordion with its content container' do
        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, nodes: accordion_graph },
          current_user:
        )

        expect(response).not_to be_error

        layout = layout_for(project)
        expect(layout.craftjs_json.dig('ACC1', 'linkedNodes', 'accordion-content')).to eq('CONT1')
        expect(layout.craftjs_json.dig('CONT1', 'nodes')).to eq(['TXT1'])
        expect(layout.craftjs_json.dig('TXT1', 'parent')).to eq('CONT1')
      end

      context 'importing a remote image' do
        # CarrierWave's SSRF protection (ssrf_filter) resolves the hostname via real DNS
        # before the request reaches Net::HTTP, so the URL must be a real, publicly
        # resolvable host — WebMock still intercepts the actual HTTP request below it.
        let(:image_url) { 'https://example.com/cat.png' }

        let(:image_graph) do
          {
            'ROOT' => craftjs_root(['IMG1']),
            'IMG1' => craftjs_node(
              'ImageMultiloc',
              parent: 'ROOT',
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

          response = run_mcp_tool(
            described_class,
            params: { project_id: project.id, nodes: image_graph },
            current_user:
          )

          expect(response).not_to be_error
          expect(ContentBuilder::LayoutImage.count).to eq(1)

          layout = layout_for(project)
          image_props = layout.craftjs_json.dig('IMG1', 'props', 'image')
          expect(image_props['dataCode']).to be_present
          expect(image_props).not_to have_key('imageUrl')
        end

        it 'returns an image import error and saves nothing when the download fails' do
          stub_request(:get, image_url).to_return(status: 404)

          response = run_mcp_tool(
            described_class,
            params: { project_id: project.id, nodes: image_graph },
            current_user:
          )

          expect(response).to be_error
          expect(response.content.first[:text]).to include('Image import failed')
          expect(layout_for(project)).to be_nil
          expect(ContentBuilder::LayoutImage.count).to eq(0)
        end
      end

      def graph_with_children(count)
        child_ids = (1..count).map { |i| "T#{i}" }
        graph = { 'ROOT' => craftjs_root(child_ids) }
        child_ids.each { |id| graph[id] = text_node(parent: 'ROOT', text: { 'en' => "<p>#{id}</p>" }) }
        graph
      end

      it 'accepts a graph with exactly the maximum number of nodes' do
        graph = graph_with_children(described_class::MAX_NODES - 1) # + ROOT = MAX_NODES

        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, nodes: graph },
          current_user:
        )

        expect(response).not_to be_error
        expect(layout_for(project).craftjs_json.size).to eq(described_class::MAX_NODES)
      end

      it 'rejects a graph one node above the cap' do
        graph = graph_with_children(described_class::MAX_NODES) # + ROOT = MAX_NODES + 1

        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, nodes: graph },
          current_user:
        )

        expect(response).to be_error
        expect(response.content.first[:text]).to include('maximum')
        expect(layout_for(project)).to be_nil
      end
    end

    context 'and there is an existing layout' do
      let!(:layout) { create(:layout, project: project, code: 'project_description', craftjs_json: initial_graph) }

      it 'edits a single node (symbol-keyed node params) without touching others' do
        # Nested node hashes use symbol keys here, matching how the MCP SDK actually
        # delivers tool call arguments; the tool must deep_stringify them before merging.
        updated_node = {
          type: { resolvedName: 'TextMultiloc' },
          nodes: [],
          props: { text: { en: '<p>Updated</p>' } },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'TextMultiloc',
          linkedNodes: {}
        }

        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, nodes: { 'T1' => updated_node } },
          current_user:
        )

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.dig('T1', 'props', 'text', 'en')).to eq('<p>Updated</p>')
        expect(layout.craftjs_json['ROOT']).to eq(initial_graph['ROOT'])
      end

      it 'inserts a new node and persists the updated parent nodes array' do
        new_node = text_node(parent: 'ROOT', text: { 'en' => '<p>New</p>' })
        updated_root = initial_graph['ROOT'].merge('nodes' => %w[T1 T2])

        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, nodes: { 'ROOT' => updated_root, 'T2' => new_node } },
          current_user:
        )

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json['ROOT']['nodes']).to eq(%w[T1 T2])
        expect(layout.craftjs_json.dig('T2', 'props', 'text', 'en')).to eq('<p>New</p>')
      end

      it 'rejects a patch that leaves a node unreferenced, returning the widget cheatsheet' do
        orphan_node = text_node(parent: 'ROOT', text: { 'en' => '<p>Orphan</p>' })
        original_json = layout.craftjs_json.deep_dup

        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, nodes: { 'T3' => orphan_node } },
          current_user:
        )

        expect(response).to be_error
        expect(response.content.first[:text]).to include('T3')
        expect(response.content.first[:text]).to include(McpServer::Tools::LayoutWidgets::CHEATSHEET)
        expect(layout.reload.craftjs_json).to eq(original_json)
      end

      it 'returns an error naming the id when delete_node_ids references an unknown node' do
        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, delete_node_ids: ['does-not-exist'] },
          current_user:
        )

        expect(response).to be_error
        expect(response.content.first[:text]).to include('do not exist in the layout: does-not-exist')
        expect(layout.reload.craftjs_json.keys).to match_array(%w[ROOT T1])
      end

      it 'rejects deleting ROOT' do
        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, delete_node_ids: ['ROOT'] },
          current_user:
        )

        expect(response).to be_error
        expect(response.content.first[:text]).to include('Cannot delete ROOT')
        expect(layout.reload.craftjs_json.keys).to match_array(%w[ROOT T1])
      end

      it 'rejects an id listed in both delete_node_ids and nodes' do
        response = run_mcp_tool(
          described_class,
          params: {
            project_id: project.id,
            nodes: { 'T1' => text_node(parent: 'ROOT', text: { 'en' => '<p>Replaced</p>' }) },
            delete_node_ids: ['T1']
          },
          current_user:
        )

        expect(response).to be_error
        expect(response.content.first[:text]).to include('both delete_node_ids and nodes')
        expect(response.content.first[:text]).to include('T1')
        expect(layout.reload.craftjs_json.dig('T1', 'props', 'text', 'en')).to eq('<p>Original</p>')
      end

      it 'toggles the enabled flag without touching the graph' do
        expect(layout.enabled).to be(true)

        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, enabled: false },
          current_user:
        )

        expect(response).not_to be_error
        layout.reload
        expect(layout.enabled).to be(false)
        expect(layout.craftjs_json.keys).to match_array(%w[ROOT T1])
      end
    end

    context 'and the existing layout contains an unsupported legacy widget' do
      let(:legacy_graph) do
        initial_graph.merge(
          'ROOT' => craftjs_root(%w[T1 LEG]),
          'LEG' => craftjs_node('FolderTitle', parent: 'ROOT')
        )
      end
      let!(:layout) { create(:layout, project: project, code: 'project_description', craftjs_json: legacy_graph) }

      it 'accepts a sparse edit that does not touch the legacy node' do
        response = run_mcp_tool(
          described_class,
          params: {
            project_id: project.id,
            nodes: { 'T1' => text_node(parent: 'ROOT', text: { 'en' => '<p>Updated</p>' }) }
          },
          current_user:
        )

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.dig('T1', 'props', 'text', 'en')).to eq('<p>Updated</p>')
        expect(layout.craftjs_json.dig('LEG', 'type', 'resolvedName')).to eq('FolderTitle')
      end
    end

    context 'and the existing layout contains an accordion' do
      let!(:layout) { create(:layout, project: project, code: 'project_description', craftjs_json: accordion_graph) }

      it "deletes the accordion's slot container and detaches the linkedNodes reference" do
        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, delete_node_ids: ['CONT1'] },
          current_user:
        )

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.keys).to match_array(%w[ROOT ACC1])
        expect(layout.craftjs_json.dig('ACC1', 'linkedNodes')).to eq({})
      end

      it 'tolerates delete_node_ids listing both an ancestor and its descendant' do
        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, delete_node_ids: %w[ACC1 TXT1] },
          current_user:
        )

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.keys).to eq(['ROOT'])
        expect(layout.craftjs_json['ROOT']['nodes']).to eq([])
      end
    end

    context 'with a graph that has two children' do
      let(:two_child_graph) do
        {
          'ROOT' => craftjs_root(%w[T1 T2]),
          'T1' => text_node(parent: 'ROOT', text: { 'en' => '<p>One</p>' }),
          'T2' => text_node(parent: 'ROOT', text: { 'en' => '<p>Two</p>' })
        }
      end
      let!(:layout) { create(:layout, project: project, code: 'project_description', craftjs_json: two_child_graph) }

      it 'deletes a node and detaches it from its parent' do
        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, delete_node_ids: ['T2'] },
          current_user:
        )

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.keys).to match_array(%w[ROOT T1])
        expect(layout.craftjs_json['ROOT']['nodes']).to eq(['T1'])
      end
    end
  end

  context 'when the project is not draft' do
    let(:project) { create(:project, admin_publication_attributes: { publication_status: 'published' }) }

    it 'refuses to create a layout and saves nothing' do
      response = run_mcp_tool(
        described_class,
        params: { project_id: project.id, nodes: initial_graph },
        current_user:
      )

      expect(response).to be_unauthorized_project
      expect(layout_for(project)).to be_nil
    end

    context 'with an existing layout' do
      let!(:layout) { create(:layout, project: project, code: 'project_description', craftjs_json: initial_graph) }

      it 'refuses to edit the layout' do
        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, enabled: false },
          current_user:
        )

        expect(response).to be_unauthorized_project
        expect(layout.reload.enabled).to be(true)
      end
    end
  end

  context 'when the user is not a moderator' do
    let(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
    let(:regular_user) { create(:user) }

    it 'refuses to save the layout' do
      response = run_mcp_tool(
        described_class,
        params: { project_id: project.id, nodes: initial_graph },
        current_user: regular_user
      )

      expect(response).to be_unauthorized
      expect(layout_for(project)).to be_nil
    end

    it 'reports the authorization error even when the patch itself is invalid' do
      # An orphan node with no ROOT: validation would reject it, but authorization
      # runs first and its error is the one returned.
      orphan_node = text_node(parent: 'ROOT', text: { 'en' => '<p>Orphan</p>' })

      response = run_mcp_tool(
        described_class,
        params: { project_id: project.id, nodes: { 'T9' => orphan_node } },
        current_user: regular_user
      )

      expect(response).to be_unauthorized
      expect(response.content.first[:text]).not_to include('Layout NOT saved')
      expect(layout_for(project)).to be_nil
    end
  end
end
