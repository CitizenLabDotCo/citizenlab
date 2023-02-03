# frozen_string_literal: true

module Analytics
  class MatomoDataImporter
    # The custom dimensions are configured by cl2-tenant-setup.
    ACTION_CUSTOM_DIMENSION_KEYS = {
      locale: 'dimension3',
      project_id: 'dimension4'
    }

    # @param [Matomo::Client] matomo_client
    # @param [String] timezone
    def initialize(matomo_client: nil, timezone: nil)
      @matomo_client = matomo_client || Matomo::Client.new
      @timezone = timezone || AppConfiguration.instance.settings.dig('core', 'timezone')
    end

    # @param [String] site_id Matomo site id
    # @param [Integer] min_timestamp start unix timestamp
    # @param [Integer,ActiveSupport::Duration] min_duration duration object or number of seconds
    # @param [Integer,nil] max_nb_batches
    # @param [Integer] batch_size
    def import(site_id, min_timestamp, min_duration: 0, max_nb_batches: nil, batch_size: 250)
      max_nb_batches ||= Float::INFINITY
      at_least_until_timestamp = min_timestamp + min_duration.to_i

      enumerator = visits_in_batches(
        site_id,
        min_timestamp: min_timestamp,
        batch_size: batch_size
      )

      enumerator.with_index(1) do |visits, index|
        persist_visit_data(visits)

        last_action_timestamp = visits.pluck('lastActionTimestamp').max
        break if last_action_timestamp > at_least_until_timestamp && index >= max_nb_batches
      end
    end

    def persist_visit_data(visit_data)
      visit_ids = persist_visits(visit_data)
      persist_visits_projects(visit_data, visit_ids)
      persist_visits_locales(visit_data, visit_ids)

      visit_ids
    end

    private

    # @return [Array<String>] the ids of the newly created +FactVisit+ in the same order
    #   as +visit_data+.
    def persist_visits(visit_data)
      update_referrer_types(visit_data)
      visits_attrs = visit_data.map { |visit_json| visit_attrs(visit_json) }

      result = FactVisit.upsert_all(
        visits_attrs,
        unique_by: :matomo_visit_id,
        returning: %w[matomo_visit_id id]
      )

      matomo_visit_id_to_id = result.rows.to_h

      visit_data
        .pluck('idVisit')
        .map(&:to_i)
        .map { |matomo_id| matomo_visit_id_to_id.fetch(matomo_id) }
    end

    def persist_visits_projects(visit_data, visit_ids)
      projects_visits_attrs =
        visit_data.zip(visit_ids).flat_map do |visit, id|
          project_ids = visit['actionDetails']
            .pluck(ACTION_CUSTOM_DIMENSION_KEYS[:project_id])
            .map(&:presence).uniq.compact

          project_ids.map do |project_id|
            { fact_visit_id: id, dimension_project_id: project_id }
          end
        end

      return if projects_visits_attrs.blank?

      Analytics::DimensionProjectsFactVisits.insert_all(projects_visits_attrs)
    end

    def persist_visits_locales(visit_data, visit_ids)
      visit_locales = visit_data.zip(visit_ids).to_h do |visit, visit_id|
        locales = visit['actionDetails']
          .pluck(ACTION_CUSTOM_DIMENSION_KEYS[:locale])
          .map(&:presence).uniq.compact

        [visit_id, locales]
      end

      update_locales(visit_locales.values.flatten.uniq)
      locale_name_to_id = Analytics::DimensionLocale.pluck(:name, :id).to_h

      locales_visits_attrs = visit_locales.flat_map do |visit_id, locales|
        locale_ids = locales.map { |name| locale_name_to_id.fetch(name) }
        locale_ids.map { |locale_id| { fact_visit_id: visit_id, dimension_locale_id: locale_id } }
      end

      return if locales_visits_attrs.blank?

      Analytics::DimensionLocalesFactVisits.insert_all(locales_visits_attrs)
    end

    def update_referrer_types(visit_data)
      referrer_types_attrs = visit_data
        .pluck('referrerType', 'referrerTypeName').uniq
        # being extra cautious and checking that matomo doesn't return empty values
        .select { |type_infos| type_infos.none?(&:blank?) }
        .map { |type, type_name| { key: type, name: type_name } }

      return if referrer_types_attrs.blank?

      result = DimensionReferrerType.insert_all(referrer_types_attrs, unique_by: :key)
      return if result.count.zero?

      ErrorReporter.report_msg(<<~MSG, extra: { unknown_referrers: referrer_types_attrs })
        Newly imported matomo visits use new referrer types. The referrer types were
        added to the database, but the front-end may need to be update to display them
        correctly.
      MSG
    end

    # @param [Enumerable<String>] locales
    def update_locales(locales)
      return if locales.blank?

      locales_attrs = locales.map { |locale| { name: locale } }
      DimensionLocale.insert_all(locales_attrs)
    end

    # If a block is provided, +visits_in_batches+ behaves like a map on batches of
    # visits, otherwise it returns an enumerator over batches.
    #
    # +batch_size+ of 250 gives a payload of about 90 Ko.
    def visits_in_batches(site_id, period: nil, date: nil, min_timestamp: nil, batch_size: 250, &block)
      enumerator = Enumerator.new do |enum|
        filter_offset = 0
        loop do
          visit_data = @matomo_client.get_last_visits_details(
            site_id,
            period: period,
            date: date,
            min_timestamp: min_timestamp,
            filter_limit: batch_size,
            filter_offset: filter_offset
          )

          @matomo_client.raise_if_error(visit_data)
          break if visit_data.empty?

          enum << visit_data.parsed_response
          filter_offset += visit_data.count
        end
      end

      block ? enumerator.map(&block) : enumerator
    end

    def visit_attrs(visit_json)
      first_action_timestamp = visit_json['firstActionTimestamp']
      last_action_timestamp = visit_json['lastActionTimestamp']

      {
        # +visit_json['visitorId']+ can be false sometimes.
        visitor_id: visit_json['visitorId'].presence,
        dimension_user_id: visit_json['userId'],
        dimension_referrer_type_id: referrer_key_to_id[visit_json['referrerType']],
        dimension_date_first_action_id: timestamp_to_date(first_action_timestamp),
        dimension_date_last_action_id: timestamp_to_date(last_action_timestamp),
        duration: visit_json['visitDuration']&.to_i,
        pages_visited: pages_visited(visit_json['actionDetails']),
        returning_visitor: visit_json['visitorType'].start_with?('returning'),
        referrer_name: visit_json['referrerName'].presence,
        referrer_url: visit_json['referrerUrl'].presence,
        matomo_visit_id: visit_json['idVisit'],
        matomo_last_action_time: Time.at(last_action_timestamp).utc
      }
    end

    def pages_visited(action_details)
      # 'action' should refer to page visits. Other types include: outlink, download,
      # event, etc.
      action_details.count { |details| details['type'] == 'action' }
    end

    def referrer_key_to_id
      DimensionReferrerType.all.to_h do |type|
        [type.key, type.id]
      end
    end

    def timestamp_to_date(timestamp)
      Time.at(timestamp).in_time_zone(@timezone).to_date
    end
  end
end
