# frozen_string_literal: true

module ContentBuilder
  module Craftjs
    # Widget conventions for the platform homepage builder: the content/slot widgets shared with
    # other builders (reused from WidgetSpecs::SPECS) plus the homepage-only widgets. Kept in its
    # own module so WidgetSpecs stays within length limits. The LLM-facing docs for these widgets
    # live in McpServer::HomepageWidgets; a spec there keeps the two in sync.
    module HomepageWidgetSpecs
      # Widgets shared with other builders that the homepage also uses (content leaves and the
      # slot containers); reused from WidgetSpecs::SPECS rather than redefined.
      SHARED_WIDGETS = %w[
        TextMultiloc ButtonMultiloc ImageMultiloc IframeMultiloc HtmlBlockMultiloc
        AccordionMultiloc WhiteSpace TwoColumn ThreeColumn EventsList Container Box
      ].freeze

      # Homepage-only widgets. Most render from their own auto-queries and carry no settable
      # props worth validating here (the LLM docs describe them); enums are declared only
      # where the value set is static and top-level. HomepageBanner's settings are nested
      # under props.homepageSettings, which the flat prop checks can't reach, so it stays {}.
      ONLY_SPECS = {
        'HomepageBanner' => {},
        'Projects' => {},
        'Highlight' => {},
        'VideoEmbed' => {},
        'Areas' => {},
        'Published' => {},
        'Events' => {},
        'CommunityMonitorCTA' => {},
        'FollowedItems' => {},
        'OpenToParticipation' => {},
        'FinishedOrArchived' => {},
        'Selection' => {},
        'CustomPages' => {},
        'Spotlight' => { 'enums' => { 'publicationType' => %w[project folder] } }
      }.freeze

      SPECS = WidgetSpecs::SPECS.slice(*SHARED_WIDGETS).merge(ONLY_SPECS).freeze
    end
  end
end
