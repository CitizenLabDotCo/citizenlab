# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::CustomPageLayoutService do
  subject(:service) { described_class.new }

  let(:root_id) { described_class::ROOT_ID }
  let(:body_id) { described_class::BODY_ID }
  let(:top_id) { described_class::TOP_INFO_ID }
  let(:bottom_id) { described_class::BOTTOM_INFO_ID }
  let(:file_prefix) { described_class::FILE_ID_PREFIX }

  let(:plain_text) { { 'en' => '<p>Hello</p>' } }
  let(:text_with_image) { { 'en' => '<p>Hello</p><img src="https://example.com/a.png">' } }

  # The factory fills the info section multilocs with Faker text, so blank them here and let
  # each example opt into the sections it is about.
  def build_page(**attributes)
    build(
      :static_page,
      {
        top_info_section_multiloc: {},
        top_info_section_enabled: false,
        bottom_info_section_multiloc: {},
        bottom_info_section_enabled: false
      }.merge(attributes)
    )
  end

  def resolved_name(craftjs, id)
    craftjs.dig(id, 'type', 'resolvedName')
  end

  describe '#craftjs_json_for' do
    it 'wraps the sections in the root and body scaffold' do
      craftjs = service.craftjs_json_for(build_page)

      expect(resolved_name(craftjs, root_id)).to eq 'CustomPageRoot'
      expect(craftjs[root_id]['nodes']).to eq [body_id]
      expect(craftjs[root_id]['isCanvas']).to be true

      expect(resolved_name(craftjs, body_id)).to eq 'CustomPageBody'
      expect(craftjs[body_id]['parent']).to eq root_id
      expect(craftjs[body_id]['custom']).to eq({ 'region' => true })
    end

    it 'still gives a page with no enabled section a usable empty canvas' do
      craftjs = service.craftjs_json_for(build_page)

      expect(craftjs.keys).to contain_exactly(root_id, body_id)
      expect(craftjs[body_id]['nodes']).to be_empty
    end

    it 'puts a plain-text section in a TextMultiloc' do
      page = build_page(top_info_section_multiloc: plain_text, top_info_section_enabled: true)

      craftjs = service.craftjs_json_for(page)

      expect(resolved_name(craftjs, top_id)).to eq 'TextMultiloc'
      expect(craftjs[top_id]['props']['text']).to eq plain_text
      expect(craftjs[top_id]['parent']).to eq body_id
      expect(craftjs[body_id]['nodes']).to eq [top_id]
    end

    it 'puts a section holding media in the RichTextMultiloc bridge' do
      page = build_page(top_info_section_multiloc: text_with_image, top_info_section_enabled: true)

      craftjs = service.craftjs_json_for(page)

      expect(resolved_name(craftjs, top_id)).to eq 'RichTextMultiloc'
      expect(craftjs[top_id]['props']['text']).to eq text_with_image
    end

    it 'orders the top section before the bottom one' do
      page = build_page(
        top_info_section_multiloc: plain_text,
        top_info_section_enabled: true,
        bottom_info_section_multiloc: plain_text,
        bottom_info_section_enabled: true
      )

      craftjs = service.craftjs_json_for(page)

      expect(craftjs[body_id]['nodes']).to eq [top_id, bottom_id]
      expect(craftjs[bottom_id]['parent']).to eq body_id
    end

    it 'skips a section that has content but is disabled' do
      page = build_page(top_info_section_multiloc: plain_text, top_info_section_enabled: false)

      craftjs = service.craftjs_json_for(page)

      expect(craftjs).not_to have_key top_id
      expect(craftjs[body_id]['nodes']).to be_empty
    end

    it 'skips a section that is enabled but blank' do
      page = build_page(top_info_section_multiloc: { 'en' => '<p></p>' }, top_info_section_enabled: true)

      craftjs = service.craftjs_json_for(page)

      expect(craftjs).not_to have_key top_id
      expect(craftjs[body_id]['nodes']).to be_empty
    end

    # The migration task compares a stored graph with a freshly derived one to decide whether
    # a page needs rewriting, which only works while node ids are fixed rather than generated.
    it 'gives two pages with the same content an identical graph' do
      attributes = { top_info_section_multiloc: plain_text, top_info_section_enabled: true }

      first = service.craftjs_json_for(build_page(**attributes))
      second = service.craftjs_json_for(build_page(**attributes))

      expect(first).to eq second
      expect(first.keys).to contain_exactly(root_id, body_id, top_id)
    end

    context 'with an events section' do
      let(:events_id) { described_class::EVENTS_ID }

      before { SettingsService.new.activate_feature!('advanced_custom_pages') }

      def page_with_events(**attributes)
        create(
          :static_page,
          {
            top_info_section_multiloc: {},
            top_info_section_enabled: false,
            bottom_info_section_multiloc: {},
            bottom_info_section_enabled: false,
            events_widget_enabled: true
          }.merge(attributes)
        )
      end

      it 'maps the area filter onto the widget selection' do
        area = create(:area)
        page = page_with_events(projects_filter_type: 'areas', areas: [area])

        craftjs = service.craftjs_json_for(page)

        expect(resolved_name(craftjs, events_id)).to eq 'EventsList'
        expect(craftjs[events_id]['props']).to eq({
          'source' => 'areas',
          'ids' => [area.id],
          'timeFilters' => ['upcoming'],
          'limit' => 3,
          'projectPublicationStatuses' => ['published']
        })
      end

      it 'maps the topic filter onto the widget selection' do
        topic = create(:global_topic)
        page = page_with_events(projects_filter_type: 'topics', global_topics: [topic])

        props = service.craftjs_json_for(page)[events_id]['props']

        expect(props['source']).to eq 'global_topics'
        expect(props['ids']).to eq [topic.id]
      end

      it 'maps the space filter onto the widget selection' do
        space = create(:space)
        page = page_with_events(projects_filter_type: 'spaces', spaces: [space])

        props = service.craftjs_json_for(page)[events_id]['props']

        expect(props['source']).to eq 'spaces'
        expect(props['ids']).to eq [space.id]
      end

      it 'adds nothing when the events section is off' do
        area = create(:area)
        page = page_with_events(
          projects_filter_type: 'areas', areas: [area], events_widget_enabled: false
        )

        expect(service.craftjs_json_for(page).keys).not_to include events_id
      end

      # `hideProjects` hides the events block too, so a no_filter page shows no events today.
      it 'adds nothing when the page has no project filter' do
        page = page_with_events(projects_filter_type: 'no_filter')

        expect(service.craftjs_json_for(page).keys).not_to include events_id
      end

      # The other arm of `hideProjects`: a page on a tenant without the feature shows no events
      # either, and a derived node would filter by area with no setting to show for it.
      it 'adds nothing when the tenant does not have advanced_custom_pages' do
        SettingsService.new.deactivate_feature!('advanced_custom_pages')
        area = create(:area)
        page = page_with_events(projects_filter_type: 'areas', areas: [area])

        expect(service.craftjs_json_for(page).keys).not_to include events_id
      end

      it 'puts the events between the attachments and the bottom info section' do
        area = create(:area)
        page = page_with_events(
          projects_filter_type: 'areas',
          areas: [area],
          bottom_info_section_multiloc: plain_text,
          bottom_info_section_enabled: true
        )

        expect(service.craftjs_json_for(page)[body_id]['nodes']).to eq [events_id, bottom_id]
      end
    end

    context 'with a projects section' do
      let(:projects_id) { described_class::PROJECTS_ID }
      let(:events_id) { described_class::EVENTS_ID }

      before { SettingsService.new.activate_feature!('advanced_custom_pages') }

      def page_with_projects(**attributes)
        create(
          :static_page,
          {
            top_info_section_multiloc: {},
            top_info_section_enabled: false,
            bottom_info_section_multiloc: {},
            bottom_info_section_enabled: false,
            projects_enabled: true
          }.merge(attributes)
        )
      end

      it 'maps the area filter onto the widget selection' do
        area = create(:area)
        page = page_with_projects(projects_filter_type: 'areas', areas: [area])

        craftjs = service.craftjs_json_for(page)

        expect(resolved_name(craftjs, projects_id)).to eq 'ProjectsByFilter'
        expect(craftjs[projects_id]['props']).to eq({
          'filterType' => 'areas',
          'ids' => [area.id],
          'titleMultiloc' => {}
        })
      end

      it 'maps the topic filter onto the widget selection' do
        topic = create(:global_topic)
        page = page_with_projects(projects_filter_type: 'topics', global_topics: [topic])

        props = service.craftjs_json_for(page)[projects_id]['props']

        expect(props['filterType']).to eq 'global_topics'
        expect(props['ids']).to eq [topic.id]
      end

      it 'maps the space filter onto the widget selection' do
        space = create(:space)
        page = page_with_projects(projects_filter_type: 'spaces', spaces: [space])

        props = service.craftjs_json_for(page)[projects_id]['props']

        expect(props['filterType']).to eq 'spaces'
        expect(props['ids']).to eq [space.id]
      end

      it 'adds nothing when the projects section is off' do
        area = create(:area)
        page = page_with_projects(
          projects_filter_type: 'areas', areas: [area], projects_enabled: false
        )

        expect(service.craftjs_json_for(page).keys).not_to include projects_id
      end

      it 'adds nothing when the page has no project filter' do
        page = page_with_projects(projects_filter_type: 'no_filter')

        expect(service.craftjs_json_for(page).keys).not_to include projects_id
      end

      it 'adds nothing when the tenant does not have advanced_custom_pages' do
        SettingsService.new.deactivate_feature!('advanced_custom_pages')
        area = create(:area)
        page = page_with_projects(projects_filter_type: 'areas', areas: [area])

        expect(service.craftjs_json_for(page).keys).not_to include projects_id
      end

      it 'puts the projects ahead of the events' do
        area = create(:area)
        page = page_with_projects(
          projects_filter_type: 'areas',
          areas: [area],
          events_widget_enabled: true
        )

        expect(service.craftjs_json_for(page)[body_id]['nodes']).to eq [projects_id, events_id]
      end
    end

    context 'with attachments' do
      def page_with_files(count, **attributes)
        page = create(
          :static_page,
          {
            top_info_section_multiloc: {},
            top_info_section_enabled: false,
            bottom_info_section_multiloc: {},
            bottom_info_section_enabled: false,
            files_section_enabled: true
          }.merge(attributes)
        )
        count.times { create(:file_attachment, attachable: page) }
        page
      end

      # Inserted newest-first so physical row order cannot stand in for the sort.
      it 'orders the files predictably when none carries a position' do
        page = page_with_files(0)
        newer = create(:file_attachment, attachable: page, created_at: 1.day.ago)
        older = create(:file_attachment, attachable: page, created_at: 2.days.ago)

        craftjs = service.craftjs_json_for(page)

        expect(Files::FileAttachment.where(attachable: page).pluck(:position).uniq).to eq [nil]
        expect(craftjs[body_id]['nodes']).to eq [
          "#{file_prefix}#{older.file_id}",
          "#{file_prefix}#{newer.file_id}"
        ]
      end

      it 'stacks one node per file directly in the body' do
        page = page_with_files(2)
        file_ids = Files::FileAttachment.where(attachable: page).ordered.pluck(:file_id)

        craftjs = service.craftjs_json_for(page)

        expected_ids = file_ids.map { |id| "#{file_prefix}#{id}" }
        expect(craftjs[body_id]['nodes']).to eq expected_ids
        expected_ids.each do |node_id|
          expect(resolved_name(craftjs, node_id)).to eq 'FileAttachment'
          expect(craftjs[node_id]['parent']).to eq body_id
        end
        expect(craftjs[expected_ids.first]['props']).to eq({ 'fileId' => file_ids.first })
      end

      it 'skips the files that are attached while the section is off' do
        craftjs = service.craftjs_json_for(page_with_files(2, files_section_enabled: false))

        expect(craftjs.keys).to contain_exactly(root_id, body_id)
      end

      it 'adds nothing when the section is on but nothing is attached' do
        craftjs = service.craftjs_json_for(page_with_files(0))

        expect(craftjs.keys).to contain_exactly(root_id, body_id)
      end

      it 'puts the files between the top and bottom info sections' do
        page = page_with_files(
          1,
          top_info_section_multiloc: plain_text,
          top_info_section_enabled: true,
          bottom_info_section_multiloc: plain_text,
          bottom_info_section_enabled: true
        )
        file_id = Files::FileAttachment.where(attachable: page).pick(:file_id)

        craftjs = service.craftjs_json_for(page)

        expect(craftjs[body_id]['nodes']).to eq [top_id, "#{file_prefix}#{file_id}", bottom_id]
      end

      # Layout's file syncing is written against content_buildable in general, not Project.
      it 'attaches the referenced files to the layout when it is saved' do
        page = page_with_files(1)
        file_id = Files::FileAttachment.where(attachable: page).pick(:file_id)

        layout = ContentBuilder::Layout.create!(
          content_buildable: page,
          code: described_class::CODE,
          enabled: true,
          craftjs_json: service.craftjs_json_for(page)
        )

        expect(layout.referenced_file_ids).to eq [file_id]
        expect(Files::FileAttachment.where(attachable: layout).pluck(:file_id)).to eq [file_id]
      end
    end
  end
end
