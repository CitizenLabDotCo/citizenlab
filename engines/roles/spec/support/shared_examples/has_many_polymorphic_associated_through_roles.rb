shared_examples 'has_many_polymorphic_associated_through_roles' do |role_name|
  role_mapping = Roles::RoleMapping.new(described_class, role_name)

  subject { create(factory_name) }

  let(:factory_name) { described_class.to_s.underscore }
  let(:roleable_source) { role_mapping.find_polymorphic_source(roleable) }
  let(:roleable_foreign_key) { role_mapping.through_role_name.to_s }
  let(:role_hash) { { 'type' => roleable_foreign_key, role_mapping.foreign_key => roleable_source.id } }

  describe "responsiveness to #{role_name} methods" do
    it "responds to all #{role_name} methods" do
      expect(described_class).to have_many_roles(role_name)
    end
  end

  describe "##{role_name}?" do
    context 'without passing arguments' do
      it "returns true if #{role_name} role is present" do
        subject.send("add_#{role_name}_role", roleable)

        expect(subject.send("#{role_name}?")).to be_truthy
        expect(subject.roles).to include(role_hash)
      end

      it "returns false if #{role_name} role is not present" do
        subject.send("remove_#{role_name}_role", roleable)

        expect(subject.send("#{role_name}?")).to be_falsey
        expect(subject.roles).not_to include(role_hash)
      end
    end

    context "when passing a #{role_mapping.association_name}" do

      it "returns true if #{role_name} role is present" do
        expect(subject.roles).not_to include(role_hash)

        subject.send("add_#{role_name}_role", roleable)

        expect(subject.send("#{role_name}?", roleable)).to be_truthy
        expect(subject.roles).to include(role_hash)
      end

      it "returns false if #{role_name} role is not present" do
        subject.send("add_#{role_name}_role", roleable)

        expect(subject.send("#{role_name}?", other_roleable)).to be_falsey
        expect(subject.roles).to include(role_hash)
      end
    end

    context "when passing a #{role_mapping.association_name} id" do
      it "returns true if #{role_name} role is present" do
        expect(subject.roles).not_to include(role_hash)

        subject.send("add_#{role_name}_role", roleable)

        expect(subject.send("#{role_name}?", roleable.id)).to be_truthy
        expect(subject.roles).to include(role_hash)
      end

      it "returns false if #{role_name} role is not present" do
        subject.send("add_#{role_name}_role", roleable)

        expect(subject.send("#{role_name}?", other_roleable.id)).to be_falsey
        expect(subject.roles).to include(role_hash)
      end
    end
  end

  describe "##{role_mapping.role_association_records_ids_name}" do
    it "includes the association id of the an added #{role_name} role" do
      subject.send("add_#{role_name}_role", roleable)
      expect(subject.send(role_mapping.role_association_records_ids_name)).to include roleable.id
    end
  end

  describe "##{role_mapping.role_association_records_name}" do
    it "includes the association record of the an added #{role_name} role" do
      subject.send("add_#{role_name}_role", roleable)
      expect(subject.send(role_mapping.role_association_records_name)).to include roleable
    end
  end

  describe "##{role_name}_roles" do
    before do
      subject.send("add_#{role_name}_role", roleable)

      expect(subject.send("#{role_name}?")).to be_truthy
    end

    it "returns the #{role_name} role" do
      expect(subject.send("#{role_name}_roles").count).to eq 1
      expect(subject.send("#{role_name}_roles")).to include(role_hash)
    end
  end

  describe "#add_#{role_name}_role" do
    it "allows adding a #{role_name} role" do
      subject.send("add_#{role_name}_role", roleable)

      expect(subject.send("#{role_name}?")).to be_truthy
      expect(subject.roles.count).to eq 1
    end
  end

  describe "#remove_#{role_name}_role" do
    before do
      subject.send("add_#{role_name}_role", roleable)
      expect(subject.send("#{role_name}?")).to be_truthy
    end

    it "allows removing a #{role_name} role" do
      subject.send("remove_#{role_name}_role", roleable)
      expect(subject.send("#{role_name}?")).to be_falsey
      expect(subject.roles.count).to eq 0
    end
  end

  describe "##{role_name} (scope)" do
    before do
      records = create_list(factory_name, 10)

      records.first(3).each do |record|
        record.send("add_#{role_name}_role", roleable)
        record.save!
      end
    end

    subject { described_class.send(role_name) }

    it "returns a collection of #{role_name} roled records" do

      expect(subject).to be_a ActiveRecord::Relation
      expect(subject.length).to eq 3
      expect(subject.all?(&:"#{role_name}?")).to be_truthy
    end
  end

  describe "#not_#{role_name} (scope)" do
    before do
      records = create_list(factory_name, 10)

      records.first(3).each do |record|
        record.send("add_#{role_name}_role", roleable)
        record.save!
      end
    end

    subject { described_class.send("not_#{role_name}") }

    it "returns a collection of #{role_name} roled records" do
      expect(subject).to be_a ActiveRecord::Relation
      expect(subject.length).to eq 7
      expect(subject.none?(&:"#{role_name}?")).to be_truthy
    end
  end
end
