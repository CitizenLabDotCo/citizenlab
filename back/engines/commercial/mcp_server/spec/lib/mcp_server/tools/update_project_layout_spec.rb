# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdateProjectLayout do
  let_it_be(:current_user) { create(:super_admin) }

  def section = 'PROJECT_PAGE_DESCRIPTION'

  def text_node(parent: section, text: { 'en' => '<p>Original</p>' })
    craftjs_node('TextMultiloc', parent: parent, props: { 'text' => text })
  end

  def section_with(child_ids, base = initial_graph)
    base[section].merge('nodes' => child_ids)
  end

  def accordion_content
    {
      'ACC1' => craftjs_node(
        'AccordionMultiloc',
        parent: section,
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
  let(:scaffold_ids) { project_page_craftjs.keys }

  def layout_for(project)
    ContentBuilder::Layout.find_by(content_buildable: project, code: 'project_page')
  end

  context 'when the project is draft' do
    let(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }

    context 'when the project has no page layout (provisioning anomaly)' do
      it 'returns an error instead of creating one' do
        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, nodes: { 'T2' => text_node } },
          current_user:
        )

        expect(response).to be_error
        expect(response.content.first[:text]).to include('has no page layout')
        expect(layout_for(project)).to be_nil
      end
    end

    context 'with an existing page layout' do
      let!(:layout) { create(:layout, project: project, code: 'project_page', craftjs_json: initial_graph) }

      it 'edits a single node (symbol-keyed node params) without touching others' do
        # Nested node hashes use symbol keys here, matching how the MCP SDK actually
        # delivers tool call arguments; the tool must deep_stringify them before merging.
        updated_node = {
          type: { resolvedName: 'TextMultiloc' },
          nodes: [],
          props: { text: { en: '<p>Updated</p>' } },
          custom: {},
          hidden: false,
          parent: section,
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

      it 'inserts a new node by also sending the description section with its updated nodes array' do
        response = run_mcp_tool(
          described_class,
          params: {
            project_id: project.id,
            nodes: { section => section_with(%w[T1 T2]), 'T2' => text_node(text: { 'en' => '<p>New</p>' }) }
          },
          current_user:
        )

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json[section]['nodes']).to eq(%w[T1 T2])
        expect(layout.craftjs_json.dig('T2', 'props', 'text', 'en')).to eq('<p>New</p>')
      end

      it 'deletes a content node and detaches it from the description section' do
        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, delete_node_ids: ['T1'] },
          current_user:
        )

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.keys).to match_array(scaffold_ids)
        expect(layout.craftjs_json[section]['nodes']).to eq([])
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
        expect(layout.craftjs_json.keys).to match_array(scaffold_ids + ['T1'])
      end

      it 'rejects a patch that leaves a node unreferenced, returning a reference for just the offending widgets' do
        original_json = layout.craftjs_json.deep_dup

        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, nodes: { 'T3' => text_node } },
          current_user:
        )

        expect(response).to be_error
        text = response.content.first[:text]
        expect(text).to include('T3')
        expect(text).to include(McpServer::LayoutWidgets::FORMAT_RULES)
        expect(text).to include(McpServer::LayoutWidgets::DOCS['TextMultiloc'])
        expect(text).not_to include(McpServer::LayoutWidgets::DOCS['IframeMultiloc'])
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
        expect(layout.reload.craftjs_json.keys).to match_array(scaffold_ids + ['T1'])
      end

      it 'rejects an id listed in both delete_node_ids and nodes' do
        response = run_mcp_tool(
          described_class,
          params: {
            project_id: project.id,
            nodes: { 'T1' => text_node(text: { 'en' => '<p>Replaced</p>' }) },
            delete_node_ids: ['T1']
          },
          current_user:
        )

        expect(response).to be_error
        expect(response.content.first[:text]).to include('both delete_node_ids and nodes')
        expect(layout.reload.craftjs_json.dig('T1', 'props', 'text', 'en')).to eq('<p>Original</p>')
      end

      describe 'scaffold protection' do
        it 'rejects deleting a scaffold node' do
          response = run_mcp_tool(
            described_class,
            params: { project_id: project.id, delete_node_ids: ['PROJECT_PAGE_PHASES'] },
            current_user:
          )

          expect(response).to be_error
          expect(response.content.first[:text]).to include('fixed page scaffold')
          expect(layout.reload.craftjs_json).to have_key('PROJECT_PAGE_PHASES')
        end

        it 'rejects deleting ROOT' do
          response = run_mcp_tool(
            described_class,
            params: { project_id: project.id, delete_node_ids: ['ROOT'] },
            current_user:
          )

          expect(response).to be_error
          expect(response.content.first[:text]).to include('fixed page scaffold')
        end

        it 'rejects editing a scaffold node' do
          body = initial_graph['PROJECT_PAGE_BODY']
            .merge('nodes' => %w[PROJECT_PAGE_EVENTS PROJECT_PAGE_DESCRIPTION PROJECT_PAGE_PHASES])

          response = run_mcp_tool(
            described_class,
            params: { project_id: project.id, nodes: { 'PROJECT_PAGE_BODY' => body } },
            current_user:
          )

          expect(response).to be_error
          expect(response.content.first[:text]).to include('cannot be added or edited')
          expect(layout.reload.craftjs_json).to eq(initial_graph)
        end

        it 'rejects adding a second node of a scaffold type' do
          response = run_mcp_tool(
            described_class,
            params: {
              project_id: project.id,
              nodes: {
                section => section_with(%w[T1 PH2]),
                'PH2' => craftjs_node('PhasesWidget', parent: section)
              }
            },
            current_user:
          )

          expect(response).to be_error
          expect(response.content.first[:text]).to include('cannot be added or edited')
        end

        it 'redirects title and banner edits to update_project' do
          banner = initial_graph['PROJECT_PAGE_BANNER'].merge('props' => { 'alt' => { 'en' => 'New alt' } })

          response = run_mcp_tool(
            described_class,
            params: { project_id: project.id, nodes: { 'PROJECT_PAGE_BANNER' => banner } },
            current_user:
          )

          expect(response).to be_error
          expect(response.content.first[:text]).to include('update_project')
        end

        it 'rejects moving the description section' do
          moved = initial_graph[section].merge('parent' => 'ROOT')

          response = run_mcp_tool(
            described_class,
            params: { project_id: project.id, nodes: { section => moved } },
            current_user:
          )

          expect(response).to be_error
          expect(response.content.first[:text]).to include('cannot be moved')
        end

        it 'rejects content placed outside the description section' do
          response = run_mcp_tool(
            described_class,
            params: { project_id: project.id, nodes: { 'T9' => text_node(parent: 'ROOT') } },
            current_user:
          )

          expect(response).to be_error
          expect(response.content.first[:text]).to include('inside the description section')
          expect(layout.reload.craftjs_json).to eq(initial_graph)
        end
      end
    end

    context 'with an accordion in the description section' do
      let!(:layout) do
        create(:layout, project: project, code: 'project_page',
          craftjs_json: project_page_craftjs(accordion_content))
      end

      it "deletes the accordion's slot container and detaches the linkedNodes reference" do
        response = run_mcp_tool(
          described_class,
          params: { project_id: project.id, delete_node_ids: ['CONT1'] },
          current_user:
        )

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.keys).to match_array(scaffold_ids + ['ACC1'])
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
        expect(layout.craftjs_json.keys).to match_array(scaffold_ids)
        expect(layout.craftjs_json[section]['nodes']).to eq([])
      end
    end

    context 'with a legacy widget in the description section' do
      let!(:layout) do
        create(:layout, project: project, code: 'project_page', craftjs_json: project_page_craftjs(
          'T1' => text_node,
          'LEG' => craftjs_node('RichTextMultiloc', parent: section, props: { 'text' => { 'en' => '<p>Old</p>' } })
        ))
      end

      it 'accepts a sparse edit that does not touch the legacy node' do
        response = run_mcp_tool(
          described_class,
          params: {
            project_id: project.id,
            nodes: { 'T1' => text_node(text: { 'en' => '<p>Updated</p>' }) }
          },
          current_user:
        )

        expect(response).not_to be_error

        layout.reload
        expect(layout.craftjs_json.dig('T1', 'props', 'text', 'en')).to eq('<p>Updated</p>')
        expect(layout.craftjs_json.dig('LEG', 'type', 'resolvedName')).to eq('RichTextMultiloc')
      end
    end

    context 'with an empty description section' do
      let!(:layout) { create(:layout, project: project, code: 'project_page', craftjs_json: project_page_craftjs) }

      context 'importing a remote image' do
        # CarrierWave's SSRF protection (ssrf_filter) resolves the hostname via real DNS
        # before the request reaches Net::HTTP, so the URL must be a real, publicly
        # resolvable host — WebMock still intercepts the actual HTTP request below it.
        let(:image_url) { 'https://example.com/cat.png' }

        let(:image_patch) do
          {
            section => section_with(['IMG1'], project_page_craftjs),
            'IMG1' => craftjs_node(
              'ImageMultiloc',
              parent: section,
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
            params: { project_id: project.id, nodes: image_patch },
            current_user:
          )

          expect(response).not_to be_error
          expect(ContentBuilder::LayoutImage.count).to eq(1)

          image_props = layout_for(project).craftjs_json.dig('IMG1', 'props', 'image')
          expect(image_props['dataCode']).to be_present
          expect(image_props).not_to have_key('imageUrl')
        end

        it 'returns an image import error and saves nothing when the download fails' do
          stub_request(:get, image_url).to_return(status: 404)

          response = run_mcp_tool(
            described_class,
            params: { project_id: project.id, nodes: image_patch },
            current_user:
          )

          expect(response).to be_error
          expect(response.content.first[:text]).to include('Image import failed')
          expect(layout.reload.craftjs_json).to eq(project_page_craftjs)
          expect(ContentBuilder::LayoutImage.count).to eq(0)
        end
      end

      describe 'the node cap' do
        def patch_with_children(count)
          child_ids = (1..count).map { |i| "T#{i}" }
          patch = { section => section_with(child_ids, project_page_craftjs) }
          child_ids.each { |id| patch[id] = text_node(text: { 'en' => "<p>#{id}</p>" }) }
          patch
        end

        it 'accepts a graph with exactly the maximum number of nodes' do
          patch = patch_with_children(described_class::MAX_NODES - scaffold_ids.size)

          response = run_mcp_tool(
            described_class,
            params: { project_id: project.id, nodes: patch },
            current_user:
          )

          expect(response).not_to be_error
          expect(layout.reload.craftjs_json.size).to eq(described_class::MAX_NODES)
        end

        it 'rejects a graph one node above the cap' do
          patch = patch_with_children(described_class::MAX_NODES - scaffold_ids.size + 1)

          response = run_mcp_tool(
            described_class,
            params: { project_id: project.id, nodes: patch },
            current_user:
          )

          expect(response).to be_error
          expect(response.content.first[:text]).to include('maximum')
          expect(layout.reload.craftjs_json.keys).to match_array(scaffold_ids)
        end
      end
    end
  end

  context 'when the project is not draft' do
    let(:project) { create(:project, admin_publication_attributes: { publication_status: 'published' }) }
    let!(:layout) { create(:layout, project: project, code: 'project_page', craftjs_json: initial_graph) }

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

  context 'when the user is not a moderator' do
    let(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
    let!(:layout) { create(:layout, project: project, code: 'project_page', craftjs_json: initial_graph) }
    let(:regular_user) { create(:user) }

    it 'refuses to save the layout' do
      response = run_mcp_tool(
        described_class,
        params: { project_id: project.id, nodes: { 'T1' => text_node(text: { 'en' => '<p>Hacked</p>' }) } },
        current_user: regular_user
      )

      expect(response).to be_unauthorized
      expect(layout.reload.craftjs_json).to eq(initial_graph)
    end

    it 'reports the authorization error even when the patch itself is invalid' do
      # An unreferenced orphan node: validation would reject it, but authorization
      # runs first and its error is the one returned.
      response = run_mcp_tool(
        described_class,
        params: { project_id: project.id, nodes: { 'T9' => text_node } },
        current_user: regular_user
      )

      expect(response).to be_unauthorized
      expect(response.content.first[:text]).not_to include('Layout NOT saved')
      expect(layout.reload.craftjs_json).to eq(initial_graph)
    end
  end
end
