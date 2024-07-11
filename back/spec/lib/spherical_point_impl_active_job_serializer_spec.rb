require 'rails_helper'

RSpec.describe SphericalPointImplActiveJobSerializer do
  let(:point) { RGeo::Geographic.spherical_factory.point(1.0, 2.0) }
  let(:serialized_point) { { 'x' => 1.0, 'y' => 2.0 } }

  describe '#serialize' do
    it 'correctly serializes a RGeo::Geographic::SphericalPointImpl object' do
      serializer = described_class.send(:new)
      expect(serializer.serialize(point)).to include(serialized_point)
    end
  end

  describe '#deserialize' do
    it 'correctly deserializes a hash to a RGeo::Geographic::SphericalPointImpl object' do
      serializer = described_class.send(:new)
      deserialized_point = serializer.deserialize(serialized_point)
      expect(deserialized_point).to be_a(RGeo::Geographic::SphericalPointImpl)
      expect(deserialized_point.x).to eq(1.0)
      expect(deserialized_point.y).to eq(2.0)
    end
  end

  describe 'integration with ActiveJob', :active_job_que_adapter do
    before do
      stub_const 'TestJob', Class.new(ApplicationJob) do
        def run(point); end
      end
    end

    it 'correctly processes passed point object' do
      TestJob.perform_later(point)
      jobs = QueJob.by_args({ job_class: 'TestJob' })
      expect(jobs.count).to eq 1
      expect(jobs.first.args['arguments'].first).to include(serialized_point)
    end
  end
end
