# frozen_string_literal: true

require 'rails_helper'
require 'query'

describe Analytics::PopulateDimensionsService do
  describe 'run with no ideas or initiatives' do
    before_all do
      described_class.run
    end

    it 'has a last dimension date six months in the future' do
      expect(Analytics::DimensionDate.last.date).to eq(Time.zone.today + 6.months)
    end

    it 'has a first dimension date the same as the app configuration date' do
      expect(Analytics::DimensionDate.first.date).to eq(AppConfiguration.first.created_at.to_date)
    end

    it 'has at least 180 date dimensions (minimum dates in 6 months)' do
      expect(Analytics::DimensionDate.count).to be >= 180
    end

    it 'has 4 dimension types' do
      expect(Analytics::DimensionType.count).to eq(4)
    end

    it 'has 5 referrer types' do
      expect(Analytics::DimensionReferrerType.count).to eq(5)
    end

    it 'does not add any extra types if it is run again' do
      expect { described_class.run }.not_to change(Analytics::DimensionType, :count)
    end

    it 'does not add any extra referrer types if it is run again' do
      expect { described_class.run }.not_to change(Analytics::DimensionReferrerType, :count)
    end

    it 'backfills date dimensions if an idea has a created date before the app configuration created date' do
      idea_date = AppConfiguration.first.created_at - 5.days
      create(:idea, created_at: idea_date)
      expect { described_class.run }.to change(Analytics::DimensionDate, :count).by(5)
      expect(Analytics::DimensionDate.order(:date).first.date).to eq(idea_date.to_date)
    end

    it 'maintains a full six months of dates in the future if it is run the next day' do
      travel 1.day
      expect { described_class.run }.to change(Analytics::DimensionDate, :count).by(1)
    end

    it 'creates new dates in the future and past - moving forward & adding an earlier initiative' do
      travel 5.days
      initiative_date = Analytics::DimensionDate.order(:date).first.date - 5.days
      create(:initiative, created_at: initiative_date)
      expect { described_class.run }.to change(Analytics::DimensionDate, :count).by(10)
    end

    it 'only creates date dimensions from 2020-01-01 onwards' do
      create(:idea, created_at: Date.parse('2019-08-01'))
      expect { described_class.run }.to change { Analytics::DimensionDate.first.date }.to(Date.parse('2020-01-01'))
    end
  end
end
