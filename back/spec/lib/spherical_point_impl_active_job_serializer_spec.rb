require 'rails_helper'

RSpec.describe SphericalPointImplActiveJobSerializer do
  context 'when point has only x and y' do
    let(:point) do
      factory = Event.new(location_point: 'POINT (1.0 2.0)').location_point.factory
      factory.point(1.0, 2.0)
    end
    let(:serialized_point) { { 'x' => 1.0, 'y' => 2.0 } }

    describe '#serialize' do
      it 'correctly serializes a RGeo::Geographic::SphericalPointImpl object' do
        serializer = described_class.send(:new)
        expect(serializer.serialize(point).except('_aj_serialized')).to eq(serialized_point)
      end
    end

    describe '#deserialize' do
      it 'correctly deserializes a hash to a RGeo::Geographic::SphericalPointImpl object' do
        serializer = described_class.send(:new)
        deserialized_point = serializer.deserialize(serialized_point)

        expect(deserialized_point).to be_a(RGeo::Geographic::SphericalPointImpl)

        expect(deserialized_point.x).to eq(1.0)
        expect(deserialized_point.x).to eq(point.x)
        expect(deserialized_point.y).to eq(2.0)
        expect(deserialized_point.y).to eq(point.y)

        expect(deserialized_point.z).to eq(point.z)
        expect(deserialized_point.z).to be_nil
        expect(deserialized_point.m).to eq(point.m)
        expect(deserialized_point.m).to be_nil
      end
    end

    describe 'integration with ActiveJob', :active_job_que_adapter do
      before do
        stub_const 'TestJob', (Class.new(ApplicationJob) do
          def run(point); end
        end)
      end

      it 'correctly processes passed point object' do
        TestJob.perform_later(point)
        jobs = QueJob.by_args({ job_class: 'TestJob' })
        expect(jobs.count).to eq 1
        expect(jobs.first.args['arguments'].first.except('_aj_serialized')).to eq(serialized_point)
      end
    end
  end

  context 'when point has x, y, z, and m' do
    let(:point) do
      factory = RGeo::Geographic.spherical_factory(srid: 4326, has_z_coordinate: true, has_m_coordinate: true)
      factory.point(1.0, 2.0, 3, 4)
    end
    let(:serialized_point) { { 'x' => 1.0, 'y' => 2.0, 'z' => 3, 'm' => 4 } }

    describe '#serialize' do
      it 'correctly serializes a RGeo::Geographic::SphericalPointImpl object' do
        serializer = described_class.send(:new)
        expect(serializer.serialize(point).except('_aj_serialized')).to eq(serialized_point)
      end
    end

    describe '#deserialize' do
      it 'correctly deserializes a hash to a RGeo::Geographic::SphericalPointImpl object' do
        serializer = described_class.send(:new)
        deserialized_point = serializer.deserialize(serialized_point)

        expect(deserialized_point).to be_a(RGeo::Geographic::SphericalPointImpl)

        expect(deserialized_point.x).to eq(1.0)
        expect(deserialized_point.x).to eq(point.x)
        expect(deserialized_point.y).to eq(2.0)
        expect(deserialized_point.y).to eq(point.y)

        expect(deserialized_point.z).to eq(point.z)
        expect(deserialized_point.z).to eq(3)
        expect(deserialized_point.m).to eq(point.m)
        expect(deserialized_point.m).to eq(4)
      end
    end

    describe 'integration with ActiveJob', :active_job_que_adapter do
      before do
        stub_const 'TestJob', (Class.new(ApplicationJob) do
          def run(point); end
        end)
      end

      it 'correctly processes passed point object' do
        TestJob.perform_later(point)
        jobs = QueJob.by_args({ job_class: 'TestJob' })
        expect(jobs.count).to eq 1
        expect(jobs.first.args['arguments'].first.except('_aj_serialized')).to eq(serialized_point)
      end
    end
  end
end
