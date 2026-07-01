# frozen_string_literal: true

module DecidimImporter
  # Projects a Decidim process's *components* onto Go Vocal *phases*.
  #
  # The two models don't line up: Decidim components (proposals, surveys, …) run concurrently within a
  # process, but Go Vocal phases must be sequential, non-overlapping, date-granular, one participation
  # method each. The export carries no per-step component-activation signal (the component
  # `step_settings` are empty; a step's `cta_path` references a component in only one process), so the
  # only signal tying a component's activity to a window is the `published_at` of its items.
  #
  # Phase-generating components so far: **proposals** (→ ideation, dated by the proposals'
  # published_at window) and **surveys** (→ native_survey, dated by the component's publication date).
  # (Decidim pages become project-level static pages, not phases, so they're handled elsewhere.) The
  # projection stays simple:
  #
  #   * the step → information phases stay the timeline backbone (hardened to be date-granular and
  #     non-overlapping — real steps overlap and overshoot the process span);
  #   * each participation component becomes one phase, appended *after* the information backbone and
  #     sequenced so nothing overlaps.
  #
  # Placing participation after the backbone (rather than interleaving) keeps the step narrative
  # intact; the ordering is an explicit approximation since the source has no reliable activation
  # window.
  #
  # Processes with steps are always hardened; processes with only participation get just their
  # participation phases.
  class PhaseProjector
    MIN_DURATION = 1 # day; Go Vocal rejects zero-length phases (Phase::MIN_DURATION)

    # @param ref_map [RefMap] holds the already-registered project + information-phase records.
    def initialize(ref_map, locale_mapper:, primary_locale: 'fr-FR')
      @ref_map = ref_map
      @locale_mapper = locale_mapper
      @primary_locale = primary_locale
      @skipped = []
    end

    # @return [Array<Hash>] components/phases that couldn't be placed, for surfacing to the client.
    attr_reader :skipped

    # @param step_rows [Array<Hash>] the flat, process-stamped step rows (to find which information
    #   phase records belong to which process).
    # @param participation_components [Array<Hash>] one entry per phase-generating component:
    #   `{ process_uid:, component_uid:, name:, method: 'ideation'|'native_survey', dates: [<date str>] }`.
    #   `dates` are the timestamps used to date the phase (proposals' published_at; a survey's
    #   publication date) — the phase spans their [min, max].
    def run(step_rows:, participation_components:)
      components_by_process = participation_components.group_by { |component| component[:process_uid] }

      # Every process with steps is hardened (Decidim steps overlap and overshoot the process span,
      # which Go Vocal rejects), even when it has no participation — so iterate the union, not just the
      # processes that gained a participation phase.
      process_uids = step_rows.pluck('decidim_participatory_process')
      process_uids = (process_uids + components_by_process.keys).compact.uniq

      process_uids.each do |process_uid|
        components = components_by_process[process_uid] || []
        project = ref_map.fetch(process_uid)
        unless project
          components.each { |component| skip(component, "no project for process #{process_uid}") }
          next
        end

        sequence(project, information_phase_records(step_rows, process_uid), components)
      end
      self
    end

    private

    attr_reader :ref_map, :locale_mapper, :primary_locale

    # The registered information-phase records for a process, in their original step order. Steps
    # without dates were skipped by the extractor, so `fetch` returns nil for them.
    def information_phase_records(step_rows, process_uid)
      step_rows
        .select { |s| s['decidim_participatory_process'] == process_uid }
        .filter_map { |s| ref_map.fetch(present(s['uid'])) }
    end

    # Lays out a process's information + participation phases as one non-overlapping, date-granular,
    # start-ascending sequence and writes the result back (mutating information records in place,
    # registering new participation records).
    def sequence(project, info_records, components)
      intents = info_intents(info_records) + participation_intents(project, components)
      return if intents.empty?

      cursor = nil
      intents.each_with_index do |intent, i|
        start_at = [intent[:start], cursor].compact.max
        end_at = resolve_end(intent, start_at, intents[i + 1], last: i == intents.size - 1)
        apply(intent, start_at, end_at)
        cursor = end_at || start_at
      end
    end

    def info_intents(info_records)
      intents = info_records.map do |record|
        { kind: :info, record: record,
          start: to_date(record.attributes['start_at']),
          end: to_date(record.attributes['end_at']) }
      end
      # `select` is defensive; the extractor already drops date-less steps.
      intents.select { |intent| intent[:start] }.sort_by { |intent| intent[:start] }
    end

    # One intent per participation component, ordered by its activity window. A component with no
    # usable date is skipped (logged) rather than guessing a date.
    def participation_intents(project, components)
      intents = components.filter_map do |component|
        window = window_from(component[:dates])
        unless window
          skip(component, 'no datable activity')
          next
        end

        { kind: :participation, project: project, component: component,
          start: window.first, end: window.last }
      end
      intents.sort_by { |intent| intent[:start] }
    end

    # @return [Array(Date, Date), nil] [min, max] of the given timestamp strings, at date granularity.
    def window_from(dates)
      parsed = Array(dates).filter_map { |date| to_date(date) }
      return nil if parsed.empty?

      parsed.minmax
    end

    # The phase's end date. Non-last phases must be concrete and at least a day long; the very last
    # phase keeps a nil end (open-ended) when the source had no end.
    def resolve_end(intent, start_at, next_intent, last:)
      desired = intent[:end]
      if last
        desired && [desired, start_at + MIN_DURATION].max
      else
        base = desired || next_intent[:start]
        [base, start_at + MIN_DURATION].max
      end
    end

    def apply(intent, start_at, end_at)
      if intent[:kind] == :info
        intent[:record].attributes['start_at'] = start_at.iso8601
        intent[:record].attributes['end_at'] = end_at&.iso8601
      else
        register_participation_phase(intent, start_at, end_at)
      end
    end

    # Default phase title per method when the component has no usable name.
    DEFAULT_TITLES = {
      'ideation' => 'Propositions', 'native_survey' => 'Questionnaire'
    }.freeze

    def register_participation_phase(intent, start_at, end_at)
      component = intent[:component]
      method = component[:method]
      title = participation_title(component, method)

      attributes = {
        'title_multiloc' => title,
        'participation_method' => method,
        'start_at' => start_at.iso8601,
        'end_at' => end_at&.iso8601
      }
      description = participation_description(component)
      attributes['description_multiloc'] = description if description.present?
      # Native-survey phases require these two multilocs (Phase validates their presence). The button
      # gets the same default the admin UI applies to a new native-survey phase, rather than a
      # hardcoded string (see {#native_survey_button_multiloc}).
      if method == 'native_survey'
        attributes['native_survey_title_multiloc'] = title
        attributes['native_survey_button_multiloc'] = native_survey_button_multiloc(title.keys)
      end

      record = Record.new('phase', attributes)
      record.reference('project', intent[:project])
      ref_map.register(component[:component_uid], record)
    end

    def participation_title(component, method)
      title = multiloc(component[:name])
      title.empty? ? { primary_locale => DEFAULT_TITLES.fetch(method, 'Participation') } : title
    end

    # The phase's rich description, per locale: an optional `<h2>` heading above a body. Surveys carry
    # their questionnaire title (→ heading) and description (→ body); components without either get an
    # empty multiloc (no description set). Locales are the union of the two, so a heading-only or
    # body-only locale still renders.
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

    # The native-survey CTA in each of the phase's locales — the same "Take the survey" default the
    # admin UI fills in for a new native-survey phase (FE `defaultSurveyCTALabel` resolves to the BE
    # `phases.native_survey_button` key), translated per locale instead of a hardcoded English string.
    # `raise_on_missing: false` so an unexpected locale degrades gracefully rather than aborting.
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

    def present(value)
      str = value.to_s.strip
      str.empty? ? nil : str
    end

    def skip(component, reason)
      @skipped << { component: component[:component_uid], reason: reason }
    end
  end
end
