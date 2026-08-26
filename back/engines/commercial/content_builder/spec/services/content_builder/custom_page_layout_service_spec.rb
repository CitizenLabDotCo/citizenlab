# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::CustomPageLayoutService do
  subject(:service) { described_class.new }

  let(:root_id) { described_class::ROOT_ID }
  let(:body_id) { described_class::BODY_ID }
  let(:top_id) { described_class::TOP_INFO_ID }
  let(:file_prefix) { described_class::FILE_ID_PREFIX }
  let(:projects_id) { described_class::PROJECTS_ID }
  let(:events_id) { described_class::EVENTS_ID }
  let(:bottom_id) { described_class::BOTTOM_INFO_ID }

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

    context 'with attachments' do
      def page_with_files(count, **attributes)
        page = create(
          :static_page,
          {
            top_info_section_multiloc: {},
            top_info_section_enabled: false,
            files_section_enabled: true
          }.merge(attributes)
        )
        count.times { create(:file_attachment, attachable: page) }
        page
      end

      it 'stacks one node per file directly in the body' do
        page = page_with_files(2)
        file_ids = Files::FileAttachment.where(attachable: page).ordered.pluck(:file_id)

        craftjs = service.craftjs_json_for(page)

        expected_ids = file_ids.map { |id| "#{file_prefix}#{id}" }
        expect(craftjs[body_id]['nodes']).to eq expected_ids
        expected_ids.each do |node_id|
          expect(resolved_name(craftjs, node_id)).to eq 'FileAttachment'
          # Stacked, unlike the project page's two-column block.
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

      it 'puts the files between the top info section and the rest' do
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

    context 'with a projects filter' do
      let(:area) { create(:area) }

      # Both lists are hidden without this, so nothing about them migrates either.
      before { SettingsService.new.activate_feature!('advanced_custom_pages') }

      def filtered_page(**attributes)
        create(
          :static_page,
          {
            top_info_section_multiloc: {},
            top_info_section_enabled: false,
            projects_filter_type: 'areas',
            areas: [area],
            projects_enabled: true,
            events_widget_enabled: true
          }.merge(attributes)
        )
      end

      it 'derives the projects list from the page filter' do
        craftjs = service.craftjs_json_for(filtered_page)

        expect(resolved_name(craftjs, projects_id)).to eq 'ProjectsByFilter'
        expect(craftjs[projects_id]['props']).to eq(
          'filterType' => 'areas',
          'ids' => [area.id],
          'titleMultiloc' => {},
          'sectionBackground' => 'colored'
        )
        expect(craftjs[projects_id]['parent']).to eq body_id
      end

      # craftjs reads `custom` from the stored graph, so a derived widget has to carry what a
      # dragged one would or it shows a raw node name and stays clickable in the builder.
      it 'gives a derived widget the same custom data a dragged one has' do
        craftjs = service.craftjs_json_for(filtered_page)

        [projects_id, events_id].each do |node_id|
          expect(craftjs[node_id]['custom']).to match(
            'title' => { 'id' => be_present, 'defaultMessage' => be_present },
            'noPointerEvents' => true
          )
        end
      end

      it 'derives the events list from the same filter, on a coloured band' do
        craftjs = service.craftjs_json_for(filtered_page)

        expect(resolved_name(craftjs, events_id)).to eq 'EventsByProjects'
        expect(craftjs[events_id]['props']).to eq(
          'mode' => 'areas', 'ids' => [area.id], 'sectionBackground' => 'colored'
        )
      end

      # projects_filter_type stores 'topics' but reads back as the enum key, which is what the
      # widget prop expects.
      it 'uses the enum key for a tag filter, not the stored value' do
        topic = create(:global_topic)
        page = filtered_page(projects_filter_type: 'global_topics', areas: [], global_topics: [topic])

        craftjs = service.craftjs_json_for(page)

        expect(craftjs[projects_id]['props']['filterType']).to eq 'global_topics'
        expect(craftjs[projects_id]['props']['ids']).to eq [topic.id]
      end

      it 'derives a space filter' do
        space = create(:space)
        page = filtered_page(projects_filter_type: 'spaces', areas: [], spaces: [space])

        craftjs = service.craftjs_json_for(page)

        expect(craftjs[projects_id]['props']['filterType']).to eq 'spaces'
        expect(craftjs[events_id]['props']['ids']).to eq [space.id]
      end

      it 'skips each list that is switched off' do
        craftjs = service.craftjs_json_for(
          filtered_page(projects_enabled: false, events_widget_enabled: false)
        )

        expect(craftjs.keys).to contain_exactly(root_id, body_id)
      end

      it 'keeps the events list when only the projects list is off' do
        craftjs = service.craftjs_json_for(filtered_page(projects_enabled: false))

        expect(craftjs).not_to have_key projects_id
        expect(craftjs[body_id]['nodes']).to eq [events_id]
      end

      it 'renders the body in the order the page renders today' do
        page = filtered_page(
          top_info_section_multiloc: plain_text,
          top_info_section_enabled: true,
          bottom_info_section_multiloc: plain_text,
          bottom_info_section_enabled: true
        )

        craftjs = service.craftjs_json_for(page)

        expect(craftjs[body_id]['nodes']).to eq [top_id, projects_id, events_id, bottom_id]
      end

      it 'migrates neither list when advanced_custom_pages is inactive' do
        SettingsService.new.deactivate_feature!('advanced_custom_pages')

        craftjs = service.craftjs_json_for(filtered_page)

        expect(craftjs.keys).to contain_exactly(root_id, body_id)
      end

      it 'migrates neither list when the page has no filter' do
        craftjs = service.craftjs_json_for(
          filtered_page(projects_filter_type: 'no_filter', areas: [])
        )

        expect(craftjs.keys).to contain_exactly(root_id, body_id)
      end
    end

    # Section node ids are fixed, so content alone decides the graph. This does not hold
    # across pages once files are attached: a file node id carries its file id.
    it 'gives two pages with the same sections an identical graph' do
      attributes = { top_info_section_multiloc: plain_text, top_info_section_enabled: true }

      first = service.craftjs_json_for(build_page(**attributes))
      second = service.craftjs_json_for(build_page(**attributes))

      expect(first).to eq second
      expect(first.keys).to contain_exactly(root_id, body_id, top_id)
    end

    # The migration task compares a stored graph with a freshly derived one to decide whether
    # a page has drifted from its source columns. That only works while re-deriving one page
    # is stable, so this pins it with every kind of node in play at once.
    it 'derives the same page identically however often it runs' do
      SettingsService.new.activate_feature!('advanced_custom_pages')
      page = create(
        :static_page,
        top_info_section_multiloc: plain_text,
        top_info_section_enabled: true,
        # Media, so the bottom section derives to the bridge widget. Base64 rather than the
        # text_with_image fixture: StaticPage's before_validation hook extracts <img> tags
        # into TextImage records, and a remote src would be fetched rather than decoded.
        bottom_info_section_multiloc: { 'en' => html_with_base64_image },
        bottom_info_section_enabled: true,
        files_section_enabled: true,
        projects_filter_type: 'areas',
        areas: [create(:area)],
        projects_enabled: true,
        events_widget_enabled: true
      )
      create_list(:file_attachment, 2, attachable: page)

      first = service.craftjs_json_for(page.reload)
      second = service.craftjs_json_for(page.reload)

      expect(first).to eq second
      # Guards the ordering too: a task that rewrote on key order alone would never settle.
      expect(first[body_id]['nodes']).to eq second[body_id]['nodes']
      expect(first[body_id]['nodes'].size).to eq 6
    end
  end
end
