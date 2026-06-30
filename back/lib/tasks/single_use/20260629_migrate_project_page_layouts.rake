# frozen_string_literal: true

# Creates a `project_page` content_builder_layout for every project that already
# has a `project_description` layout, reproducing the legacy public project page
# with the new project page builder structure.
#
# The migration is additive: the existing `project_description` row is never
# touched. Reverting means deleting the `project_page` rows.
#
# Idempotent: projects that already have a `project_page` layout are skipped, so
# re-running never duplicates.
#
# Dry-run by default. Set DRY_RUN=false to actually write the new layouts.
#
#   bin/rake single_use:migrate_project_page_layouts                # dry-run
#   DRY_RUN=false bin/rake single_use:migrate_project_page_layouts  # execute

# Builds the `project_page` craftjs_json from a `project_description` layout's
# craftjs_json. Kept deliberately self-contained (pure transform, no DB) so it
# can be unit-tested with fixtures.
#
# The canonical structure mirrors the frontend
# `front/app/components/ProjectPageBuilder/defaultLayout.ts`
# (`defaultProjectPageLayout` + `ensureLockedHeaderNodes`). Keep the two in sync;
# the spec asserts the produced json survives the frontend normalizer unchanged.
class ProjectPageLayoutBuilder
  ROOT_ID = 'ROOT'
  BANNER_ID = 'PROJECT_PAGE_BANNER'
  TITLE_ID = 'PROJECT_PAGE_TITLE'
  BODY_ID = 'PROJECT_PAGE_BODY'
  TIMELINE_ID = 'PROJECT_PAGE_TIMELINE'
  INPUT_FEED_ID = 'PROJECT_PAGE_INPUT_FEED'
  EVENTS_ID = 'PROJECT_PAGE_EVENTS'

  # Description-builder-only widgets that are absent from the project page
  # resolver. Left in place they crash craft.js when the public page
  # deserializes the layout, so they are stripped (with their subtrees).
  # Keep in sync with REMOVED_WIDGETS in defaultLayout.ts.
  UNSUPPORTED_WIDGETS = %w[
    FolderFiles
    FolderTitle
    Published
    Selection
    Spotlight
    ExtraSurveysWidget
  ].freeze

  # Injected description nodes are re-keyed with this prefix so they can never
  # collide with the fixed PROJECT_PAGE_* / ROOT ids, and so migrated content is
  # recognisable in the stored json.
  INJECTED_ID_PREFIX = 'd_'

  def initialize(description_craftjs)
    @description = description_craftjs || {}
  end

  def build
    injected_nodes, injected_top_level_ids = inject_description
    canonical_nodes(injected_top_level_ids).merge(injected_nodes)
  end

  private

  # Re-keys, re-parents and strips the description's content nodes, ready to be
  # merged into the body. Returns [nodes_hash, ordered_top_level_ids].
  def inject_description
    root = @description[ROOT_ID]
    return [{}, []] unless root.is_a?(Hash)

    unsupported = unsupported_ids
    id_map = build_id_map(unsupported)

    nodes = {}
    @description.each do |id, node|
      next if id == ROOT_ID
      next if unsupported.include?(id)
      next unless node.is_a?(Hash)

      nodes[id_map.fetch(id)] = remap_node(node, id_map, unsupported)
    end

    top_level_ids = Array(root['nodes'])
      .reject { |id| unsupported.include?(id) }
      .filter_map { |id| id_map[id] }

    # The description's top-level children become direct children of the body.
    top_level_ids.each { |id| nodes[id]['parent'] = BODY_ID }

    [nodes, top_level_ids]
  end

  # All node ids whose widget is unsupported, plus every descendant, so an
  # unsupported subtree is removed whole.
  def unsupported_ids
    ids = Set.new
    queue = @description.filter_map do |id, node|
      id if id != ROOT_ID && node.is_a?(Hash) && UNSUPPORTED_WIDGETS.include?(resolved_name(node))
    end

    until queue.empty?
      id = queue.shift
      next if ids.include?(id)

      ids << id
      node = @description[id]
      next unless node.is_a?(Hash)

      queue.concat(Array(node['nodes']))
      queue.concat(Array(node['linkedNodes']).map { |pair| pair[1] })
    end

    ids
  end

  def build_id_map(unsupported)
    @description.each_key.with_object({}) do |id, map|
      next if id == ROOT_ID || unsupported.include?(id)

      map[id] = "#{INJECTED_ID_PREFIX}#{id}"
    end
  end

  # Deep-dups a node and rewrites every id reference (parent, nodes, linkedNodes)
  # through the id map, dropping references to stripped nodes.
  def remap_node(node, id_map, unsupported)
    remapped = Marshal.load(Marshal.dump(node))

    if remapped.key?('parent') && remapped['parent'] != ROOT_ID
      remapped['parent'] = id_map[remapped['parent']] || remapped['parent']
    end

    remapped['nodes'] = Array(remapped['nodes'])
      .reject { |id| unsupported.include?(id) }
      .filter_map { |id| id_map[id] }

    if remapped['linkedNodes'].is_a?(Hash)
      remapped['linkedNodes'] = remapped['linkedNodes']
        .reject { |_slot, id| unsupported.include?(id) }
        .transform_values { |id| id_map[id] || id }
    end

    remapped
  end

  def resolved_name(node)
    type = node['type']
    type.is_a?(Hash) ? type['resolvedName'] : type
  end

  # The locked header above a body of: timeline, the migrated description
  # content, the (locked) participation feed, then events.
  def canonical_nodes(description_ids)
    {
      ROOT_ID => {
        'type' => { 'resolvedName' => 'ProjectPageRoot' },
        'nodes' => [BANNER_ID, TITLE_ID, BODY_ID],
        'props' => {},
        'custom' => { 'region' => true },
        'hidden' => false,
        'isCanvas' => true,
        'displayName' => 'ProjectPageRoot',
        'linkedNodes' => {}
      },
      BANNER_ID => {
        'type' => { 'resolvedName' => 'ProjectBanner' },
        'nodes' => [],
        'props' => { 'image' => {}, 'alt' => {} },
        'custom' => {
          'title' => message('app.components.ProjectPageBuilder.Widgets.bannerWidgetTitle', 'Project image'),
          'locked' => true,
          'noPointerEvents' => true
        },
        'hidden' => false,
        'parent' => ROOT_ID,
        'isCanvas' => false,
        'displayName' => 'ProjectBanner',
        'linkedNodes' => {}
      },
      TITLE_ID => {
        'type' => { 'resolvedName' => 'ProjectTitle' },
        'nodes' => [],
        'props' => {},
        'custom' => {
          'title' => message('app.components.ProjectPageBuilder.Widgets.titleWidgetTitle', 'Title'),
          'locked' => true,
          'noPointerEvents' => true
        },
        'hidden' => false,
        'parent' => ROOT_ID,
        'isCanvas' => false,
        'displayName' => 'ProjectTitle',
        'linkedNodes' => {}
      },
      BODY_ID => {
        'type' => { 'resolvedName' => 'ProjectPageBody' },
        'nodes' => [TIMELINE_ID, *description_ids, INPUT_FEED_ID, EVENTS_ID],
        'props' => {},
        'custom' => { 'region' => true },
        'hidden' => false,
        'parent' => ROOT_ID,
        'isCanvas' => true,
        'displayName' => 'ProjectPageBody',
        'linkedNodes' => {}
      },
      TIMELINE_ID => {
        'type' => { 'resolvedName' => 'TimelineWidget' },
        'nodes' => [],
        'props' => {},
        'custom' => {
          'title' => message('app.components.ProjectPageBuilder.Widgets.timelineWidgetTitle', 'Timeline'),
          'noPointerEvents' => true
        },
        'hidden' => false,
        'parent' => BODY_ID,
        'isCanvas' => false,
        'displayName' => 'TimelineWidget',
        'linkedNodes' => {}
      },
      INPUT_FEED_ID => {
        'type' => { 'resolvedName' => 'InputFeed' },
        'nodes' => [],
        'props' => {},
        'custom' => {
          'title' => message('app.components.ProjectPageBuilder.Widgets.inputFeedWidgetTitle2', 'Phase content'),
          'locked' => true,
          'noPointerEvents' => true
        },
        'hidden' => false,
        'parent' => BODY_ID,
        'isCanvas' => false,
        'displayName' => 'InputFeed',
        'linkedNodes' => {}
      },
      EVENTS_ID => {
        'type' => { 'resolvedName' => 'EventsWidget' },
        'nodes' => [],
        'props' => {},
        'custom' => {
          'title' => message('app.components.ProjectPageBuilder.Widgets.eventsWidgetTitle', 'Events'),
          'noPointerEvents' => true
        },
        'hidden' => false,
        'parent' => BODY_ID,
        'isCanvas' => false,
        'displayName' => 'EventsWidget',
        'linkedNodes' => {}
      }
    }
  end

  # craft.js persists a widget's `custom.title` as the resolved react-intl
  # descriptor. Reproduced here so the json is a fixed point of the frontend
  # `ensureLockedHeaderNodes` (which re-stamps these on load).
  def message(id, default_message)
    { 'id' => id, 'defaultMessage' => default_message }
  end
end

namespace :single_use do
  desc 'Create project_page layouts from existing project_description layouts'
  task migrate_project_page_layouts: :environment do
    dry_run = ENV['DRY_RUN'] != 'false'
    reporter = ScriptReporter.new

    Tenant.safe_switch_each do |tenant|
      descriptions = ContentBuilder::Layout.where(code: 'project_description', content_buildable_type: 'Project')
      next if descriptions.empty?

      existing_project_ids = ContentBuilder::Layout
        .where(code: 'project_page', content_buildable_type: 'Project')
        .pluck(:content_buildable_id)
        .to_set

      reporter.add_processed_tenant(tenant)

      descriptions.find_each do |description|
        project_id = description.content_buildable_id
        next if existing_project_ids.include?(project_id) # idempotent

        craftjs_json = ProjectPageLayoutBuilder.new(description.craftjs_json).build
        layout = ContentBuilder::Layout.new(
          content_buildable_type: 'Project',
          content_buildable_id: project_id,
          code: 'project_page',
          enabled: true,
          craftjs_json: craftjs_json
        )

        context = { tenant: tenant.host, project_id: project_id }

        if dry_run
          reporter.add_create('ContentBuilder::Layout', layout.attributes, context: context)
        elsif layout.save
          reporter.add_create('ContentBuilder::Layout', { id: layout.id }.merge(layout.attributes), context: context)
        else
          reporter.add_error(layout.errors.details, context: context)
        end
      end
    end

    reporter.report!('migrate_project_page_layouts.json', verbose: true)
    puts "\nDRY RUN — no changes written. Re-run with DRY_RUN=false to execute.\n" if dry_run
  end
end
