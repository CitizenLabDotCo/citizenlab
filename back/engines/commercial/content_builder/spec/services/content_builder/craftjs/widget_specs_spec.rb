# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::Craftjs::WidgetSpecs do
  # Spelled out rather than derived from each other: PROJECT_PAGE_SPECS is SPECS minus
  # CUSTOM_PAGE_WIDGETS by definition, so comparing the three would pass whatever the lists held.
  describe 'CUSTOM_PAGE_WIDGETS' do
    it 'lists the widgets and scaffold only the custom page builder resolves' do
      expect(described_class::CUSTOM_PAGE_WIDGETS).to match_array(
        %w[ProjectsByFilter CustomPageRoot CustomPageBanner CustomPageTitle CustomPageBody]
      )
    end

    # Naming a widget that no longer exists would silently stop excluding anything.
    it 'names only widgets that are actually specified' do
      expect(described_class::SPECS.keys).to include(
        'ProjectsByFilter', 'CustomPageRoot', 'CustomPageBanner', 'CustomPageTitle', 'CustomPageBody'
      )
    end

    # The difference is exact, not a subset: a node the custom page derives without a spec of its
    # own shows up here as an extra name, rather than once something validates the layout.
    it 'covers every widget the custom page layout service derives' do
      SettingsService.new.activate_feature!('advanced_custom_pages')
      # The banner node is derived only for a page that shows one.
      page = create(
        :static_page,
        banner_enabled: true,
        projects_enabled: true,
        projects_filter_type: 'areas',
        areas: [create(:area)]
      )

      derived = ContentBuilder::CustomPageLayoutService.new
        .craftjs_json_for(page)
        .values
        .filter_map { |node| node.dig('type', 'resolvedName') }

      expect(derived.uniq - described_class::PROJECT_PAGE_SPECS.keys).to match_array(
        %w[ProjectsByFilter CustomPageRoot CustomPageBanner CustomPageTitle CustomPageBody]
      )
    end
  end

  describe 'PROJECT_PAGE_SPECS' do
    # A project page has no resolver entry for a custom page widget, and craft.js throws on an
    # unknown resolvedName inside a pass over every node — so letting one through here does not
    # drop a widget, it takes the whole route down for every visitor.
    it 'holds every widget a project page resolves and none of the custom page ones' do
      expect(described_class::PROJECT_PAGE_SPECS.keys).to match_array(%w[
        TextMultiloc
        ButtonMultiloc
        ImageMultiloc
        PageLink
        IframeMultiloc
        AccordionMultiloc
        WhiteSpace
        AboutBox
        FileAttachment
        TwoColumn
        ThreeColumn
        HtmlBlockMultiloc
        PhasesWidget
        EventsList
        EventsWidget
        ExtraSurveysWidget
        Container
        Box
        ImageTextCards
        InfoWithAccordions
        RichTextMultiloc
        ProjectDescriptionSection
        ProjectPageRoot
        ProjectBanner
        ProjectTitle
        ProjectPageBody
      ])
    end
  end
end
