# frozen_string_literal: true

module Analytics
  class MatomoDataImporter
    def initialize(...)
      @matomo = Matomo::Client.new(...)
      @timezone = AppConfiguration.instance.settings.dig('core', 'timezone')
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

      enumerator = enumerator.lazy.with_index.take_while do |visits, index|
        last_action_timestamp = visits.pluck('lastActionTimestamp').max
        last_action_timestamp < at_least_until_timestamp || index < max_nb_batches
      end

      enumerator.map { |visits| persist_visits(visits) }.force
    end

    def persist_visits(visit_data)
      # TODO: import project-visits and locales-visits
      visits_attrs = visit_data.map { |visit_json| visit_attrs(visit_json) }
      FactVisit.upsert_all(visits_attrs, unique_by: :matomo_visit_id)
    end

    private

    # If a block is provided, +visits_in_batches+ behaves like a map on batches of
    # visits, otherwise it returns an enumerator over batches.
    #
    # +batch_size+ of 250 gives a payload of about 90 Ko.
    def visits_in_batches(site_id, period: nil, date: nil, min_timestamp: nil, batch_size: 250, &block)
      enumerator = Enumerator.new do |enum|
        filter_offset = 0
        loop do
          visit_data = @matomo.get_last_visits_details(
            site_id,
            period: period,
            date: date,
            min_timestamp: min_timestamp,
            filter_limit: batch_size,
            filter_offset: filter_offset
          )

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
        user_id: visit_json['userId'],
        channel_id: visit_json['referrerType'],
        first_action_date_id: Time.at(first_action_timestamp).in_time_zone(@timezone).to_date,
        last_action_date_id: Time.at(last_action_timestamp).in_time_zone(@timezone).to_date,
        duration: visit_json['visitDuration']&.to_i,
        pages_visited: visit_json['actionDetails'].count, # TODO: to be confirmed
        returning_visitor: visit_json['visitorType'] == 'returningCustomer',
        matomo_visit_id: visit_json['idVisit'],
        last_action_timestamp: last_action_timestamp
      }
    end
  end
end
