# frozen_string_literal: true

module DecidimImporter
  # Projects a Decidim process's participation components onto Go Vocal phases.
  #
  # Phase-generating components: proposals (→ ideation, or single_voting when voted), accountability
  # (→ ideation), surveys (→ native_survey). Decidim steps are not imported — they carry no
  # participation and have no Go Vocal equivalent.
  #
  # Each phase is dated from the component, not the steps: start = `published_at`, falling back to the
  # earliest item date when only `previously_published`; end = latest activity (last proposal's
  # `published_at`, last answer's `created_at`). A never-published component gets no phase.
  #
  # Timeline phases must be sequential and non-overlapping, so they run in ascending component `weight`
  # (the admin's Decidim ordering) and each keeps its length but is pushed forward to start on/after the
  # previous phase's end (one whose real window already fits keeps its real dates). Survey phases are
  # placed *standalone* (parallel) instead — Go Vocal runs surveys concurrently — so they keep their own
  # window, off the timeline: they don't collide with the other phases' dates or push them around.
  class PhaseProjector
    MIN_DURATION = 1 # day; Go Vocal rejects zero-length phases (Phase::MIN_DURATION)

    # @param ref_map [RefMap] holds the already-registered project records; phase records are added here.
    def initialize(ref_map, locale_mapper:, primary_locale: 'fr-FR')
      @ref_map = ref_map
      @locale_mapper = locale_mapper
      @primary_locale = primary_locale
      @skipped = []
    end

    # @return [Array<Hash>] components that couldn't be placed, for surfacing to the client.
    attr_reader :skipped

    # @param participation_components [Array<Hash>] one entry per phase-generating component:
    #   `{ process_uid:, component_uid:, name:, weight:, method: 'ideation'|'native_survey',
    #      published_at:, previously_published:, end_dates: [<date str>, ...] }`
    #   (surveys also carry `description_heading:`/`description_body:`). `published_at`/
    #   `previously_published` date the start; `end_dates` date the end; `weight` orders the phases.
    def run(participation_components:)
      participation_components.group_by { |component| component[:process_uid] }.each do |process_uid, components|
        project = ref_map.fetch(process_uid)
        unless project
          components.each { |component| skip(component, "no project for process #{process_uid}") }
          next
        end

        sequence(project, components)
      end
      self
    end

    private

    attr_reader :ref_map, :locale_mapper, :primary_locale

    # Lays out one process's phases. Timeline phases form a non-overlapping sequence in ascending
    # component weight (each keeps its length but is pushed forward to start on/after the previous phase's
    # end). Survey phases are placed *standalone* (parallel) instead — Go Vocal supports concurrent
    # surveys — so they keep their own natural window and neither collide with the timeline phases' dates
    # nor push them around, which also keeps the other phases' dates sensible.
    def sequence(project, components)
      intents = components.filter_map { |component| build_intent(component) }
      standalone, sequential = intents.partition { |intent| standalone?(intent) }

      cursor = nil
      ordered(sequential).each do |intent|
        start_at = [intent[:start], cursor].compact.max
        end_at = start_at + duration(intent)
        register(project, intent, start_at, end_at)
        cursor = end_at
      end

      standalone.each do |intent|
        register(project, intent, intent[:start], intent[:start] + duration(intent), placement_type: 'standalone')
      end
    end

    # Survey phases run standalone (parallel participation); every other method sits on the timeline.
    def standalone?(intent)
      intent[:method] == 'native_survey'
    end

    # Phases ordered by ascending component weight; ties break by the natural start date, then uid.
    def ordered(intents)
      intents.sort_by { |intent| [intent[:weight], intent[:start], intent[:component][:component_uid].to_s] }
    end

    # One intent per component: `{ method:, component:, start: Date, end: Date|nil, weight: Integer }`.
    # A never-published component, or one with no datable window, is skipped (logged).
    def build_intent(component)
      published_at = present(component[:published_at])
      unless published_at || truthy?(component[:previously_published])
        skip(component, 'never published')
        return nil
      end

      item_dates = Array(component[:end_dates]).filter_map { |date| to_date(date) }
      start = to_date(published_at) || item_dates.min
      if start.nil?
        skip(component, 'published but no datable window')
        return nil
      end

      { method: component[:method], component: component, start: start, end: item_dates.max,
        weight: component[:weight].to_i }
    end

    # The intended length of a phase in days, at least MIN_DURATION (item dates can predate the
    # publication date, which would otherwise give a zero/negative span).
    def duration(intent)
      intent[:end] ? [(intent[:end] - intent[:start]).to_i, MIN_DURATION].max : MIN_DURATION
    end

    # Default phase title per method when the component has no usable name.
    DEFAULT_TITLES = {
      'ideation' => 'Propositions', 'native_survey' => 'Questionnaire', 'voting' => 'Vote'
    }.freeze

    def register(project, intent, start_at, end_at, placement_type: 'on_timeline')
      component = intent[:component]
      method = component[:method]
      title = participation_title(component, method)

      attributes = {
        'title_multiloc' => title,
        'participation_method' => method,
        'start_at' => start_at.iso8601,
        'end_at' => end_at&.iso8601
      }
      # `on_timeline` is the schema default, so only a standalone (parallel) phase carries the override.
      attributes['placement_type'] = placement_type unless placement_type == 'on_timeline'
      description = participation_description(component)
      attributes['description_multiloc'] = description if description.present?
      # Native-survey phases require these two multilocs (Phase validates their presence). The button
      # uses the admin UI's default for a new native-survey phase (see {#native_survey_button_multiloc}).
      if method == 'native_survey'
        attributes['native_survey_title_multiloc'] = title
        attributes['native_survey_button_multiloc'] = native_survey_button_multiloc(title.keys)
      end
      # Voting phases carry the voting method + its per-user cap (`voting_max_total`): the budget cap for
      # budgeting, the vote limit for single-voting (nil = Decidim's "unlimited", leaving the phase
      # uncapped). Single-voting also pins `voting_max_votes_per_idea` to 1 (one vote per option).
      # `voting_min_total`/`voting_min_selected_options` keep their schema defaults (0 / 1).
      if method == 'voting'
        attributes['voting_method'] = component[:voting_method]
        attributes['voting_max_total'] = component[:voting_max_total] if component[:voting_max_total]
        attributes['voting_max_votes_per_idea'] = component[:voting_max_votes_per_idea] if component[:voting_max_votes_per_idea]
      end

      record = Record.new('phase', attributes)
      record.reference('project', project)
      ref_map.register(component[:component_uid], record)
    end

    def participation_title(component, method)
      title = multiloc(component[:name])
      title.empty? ? { primary_locale => DEFAULT_TITLES.fetch(method, 'Participation') } : title
    end

    # The phase's rich description per locale: an optional `<h2>` heading above a body. Surveys map
    # their questionnaire title → heading and description → body; without either, an empty multiloc.
    # Locales are the union of the two, so a heading-only or body-only locale still renders.
    def participation_description(component)
      heading = multiloc(component[:description_heading])
      body = multiloc(component[:description_body])
      (heading.keys | body.keys).each_with_object({}) do |locale, acc|
        parts = []
        parts << "<h2>#{heading[locale]}</h2>" if heading[locale]
        parts << body[locale] if body[locale]
        acc[locale] = parts.join
      end
    end

    # The native-survey CTA per locale — the admin UI's default for a new native-survey phase (FE
    # `defaultSurveyCTALabel` → BE `phases.native_survey_button`), translated instead of hardcoded
    # English. `raise_on_missing: false` so an unexpected locale degrades gracefully.
    def native_survey_button_multiloc(locales)
      MultilocService.new.i18n_to_multiloc(
        'phases.native_survey_button', locales: locales, raise_on_missing: false
      )
    end

    # — small parsing helpers (kept local so the projector doesn't depend on BaseExtractor) —

    def multiloc(value)
      parsed = parse_json(value)
      if parsed.is_a?(Hash)
        parsed.each_with_object({}) do |(locale, text), acc|
          next if text.to_s.strip.empty?

          acc[locale_mapper.map(locale)] = text.to_s
        end
      elsif present(value)
        { primary_locale => value.to_s }
      else
        {}
      end
    end

    def parse_json(value)
      return value if value.is_a?(Hash)

      str = value.to_s.strip
      return nil unless str.start_with?('{')

      JSON.parse(str)
    rescue JSON::ParserError
      nil
    end

    def to_date(value)
      str = present(value)
      return nil unless str

      Date.parse(str)
    rescue ArgumentError
      nil
    end

    def truthy?(value)
      %w[true t 1 yes].include?(value.to_s.strip.downcase)
    end

    def present(value)
      str = value.to_s.strip
      str.empty? ? nil : str
    end

    def skip(component, reason)
      @skipped << { component: component[:component_uid], reason: reason }
    end
  end
end
