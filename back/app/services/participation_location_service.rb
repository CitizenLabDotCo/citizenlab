# frozen_string_literal: true

class ParticipationLocationService
  class << self
    def extract_location_headers(headers)
      {
        country_code: headers['CloudFront-Viewer-Country'],
        country_name: headers['CloudFront-Viewer-Country-Name'],
        region: headers['CloudFront-Viewer-Country-Region-Name'],
        city: headers['CloudFront-Viewer-City'],
        latitude: parse_decimal(headers['CloudFront-Viewer-Latitude']),
        longitude: parse_decimal(headers['CloudFront-Viewer-Longitude']),
        asn: parse_integer(headers['CloudFront-Viewer-ASN'])
      }
    end

    def track(trackable, location_attrs)
      return unless should_track?(trackable)

      attrs = location_attrs&.compact_blank
      if attrs.blank?
        ErrorReporter.report_msg(
          'Location tracking enabled but no location data available',
          extra: { trackable_type: trackable.class.name, trackable_id: trackable.id }
        )
        return
      end

      ParticipationLocation.create!(trackable: trackable, **attrs)
    end

    private

    def should_track?(trackable)
      AppConfiguration.instance.feature_activated?('participation_location_tracking') &&
        trackable.project&.track_participation_location
    end

    def parse_decimal(value)
      BigDecimal(value.to_s, exception: false)
    end

    def parse_integer(value)
      Integer(value.to_s, exception: false)
    end
  end
end
