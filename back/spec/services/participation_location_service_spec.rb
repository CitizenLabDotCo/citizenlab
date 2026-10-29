# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationLocationService do
  describe '.extract_location_headers' do
    it 'extracts and casts location headers from request headers' do
      headers = {
        'CloudFront-Viewer-Country' => 'BE',
        'CloudFront-Viewer-Country-Name' => 'Belgium',
        'CloudFront-Viewer-Country-Region-Name' => 'Brussels-Capital Region',
        'CloudFront-Viewer-City' => 'Brussels',
        'CloudFront-Viewer-Latitude' => '50.8503',
        'CloudFront-Viewer-Longitude' => '4.3517',
        'CloudFront-Viewer-ASN' => '12345'
      }

      result = described_class.extract_location_headers(headers)

      expect(result).to eq(
        country_code: 'BE',
        country_name: 'Belgium',
        region: 'Brussels-Capital Region',
        city: 'Brussels',
        latitude: BigDecimal('50.8503'),
        longitude: BigDecimal('4.3517'),
        asn: 12_345
      )
    end

    it 'returns nil for missing headers' do
      expect(described_class.extract_location_headers({})).to eq(
        country_code: nil,
        country_name: nil,
        region: nil,
        city: nil,
        latitude: nil,
        longitude: nil,
        asn: nil
      )
    end

    it 'handles invalid numeric values gracefully' do
      headers = {
        'CloudFront-Viewer-Country' => 'BE',
        'CloudFront-Viewer-Latitude' => 'invalid',
        'CloudFront-Viewer-ASN' => '1.1' # ASN should be an integer
      }

      result = described_class.extract_location_headers(headers)

      expect(result).to include(country_code: 'BE', latitude: nil, asn: nil)
    end
  end

  describe '.track' do
    let(:project) { create(:project, track_participation_location: true) }
    let(:idea) { create(:idea, project: project) }
    let(:location_attrs) do
      {
        country_code: 'BE',
        country_name: 'Belgium',
        region: 'Brussels-Capital Region',
        city: 'Brussels',
        latitude: BigDecimal('50.8503'),
        longitude: BigDecimal('4.3517'),
        asn: 12_345
      }
    end

    context 'when tracking is enabled' do
      before { SettingsService.new.activate_feature!('participation_location_tracking') }

      it 'creates a record with correct data' do
        expect { described_class.track(idea, location_attrs) }
          .to change(ParticipationLocation, :count).by(1)

        expect(idea.reload.participation_location).to have_attributes(location_attrs)
      end

      it 'creates a record with partial data' do
        described_class.track(idea, { country_code: 'US', country_name: 'United States' })

        expect(idea.reload.participation_location).to have_attributes(
          country_code: 'US',
          country_name: 'United States'
        )
      end

      it 'does not create a record for nil attrs' do
        expect { described_class.track(idea, nil) }.not_to change(ParticipationLocation, :count)
      end

      it 'does not create a record for empty attrs' do
        expect { described_class.track(idea, {}) }.not_to change(ParticipationLocation, :count)
      end

      it 'does not create a record when all values are nil' do
        nil_attrs = { country_code: nil, city: nil, latitude: nil, longitude: nil, asn: nil }
        expect { described_class.track(idea, nil_attrs) }.not_to change(ParticipationLocation, :count)
      end
    end

    context 'when feature is disabled' do
      before { SettingsService.new.deactivate_feature!('participation_location_tracking') }

      it 'does not create a record' do
        expect { described_class.track(idea, location_attrs) }
          .not_to change(ParticipationLocation, :count)
      end
    end

    context 'when project tracking is disabled' do
      before do
        SettingsService.new.activate_feature!('participation_location_tracking')
        project.update!(track_participation_location: false)
      end

      it 'does not create a record' do
        expect { described_class.track(idea, location_attrs) }
          .not_to change(ParticipationLocation, :count)
      end
    end

    context 'when the participant posts anonymously' do
      before { SettingsService.new.activate_feature!('participation_location_tracking') }

      it 'does not create a record' do
        anonymous_idea = create(:idea, project: project, anonymous: true)

        expect { described_class.track(anonymous_idea, location_attrs) }
          .not_to change(ParticipationLocation, :count)
      end

      it 'still creates a record for an input without an author that is not anonymous' do
        authorless_idea = create(:idea, project: project, author: nil)

        expect { described_class.track(authorless_idea, location_attrs) }
          .to change(ParticipationLocation, :count).by(1)
      end
    end
  end

  describe '.enabled_for?' do
    let(:project) { create(:project, track_participation_location: true) }

    it 'is true when the feature is on and the project tracks location' do
      SettingsService.new.activate_feature!('participation_location_tracking')
      expect(described_class.enabled_for?(project)).to be true
    end

    it 'is false when the feature is off' do
      SettingsService.new.deactivate_feature!('participation_location_tracking')
      expect(described_class.enabled_for?(project)).to be false
    end

    it 'is false when the project does not track location' do
      SettingsService.new.activate_feature!('participation_location_tracking')
      project.update!(track_participation_location: false)
      expect(described_class.enabled_for?(project)).to be false
    end

    it 'is false without a project' do
      SettingsService.new.activate_feature!('participation_location_tracking')
      expect(described_class.enabled_for?(nil)).to be false
    end
  end
end
