shared_examples 'has_many_roles' do |role_name|
  let(:factory_name) { described_class.to_s.underscore }
  subject { create(factory_name) }

  describe "responsiveness to #{role_name} methods" do
    it "responds to all #{role_name} methods" do
      expect(described_class).to have_many_roles(:admin_publication_moderator)
    end
  end

  describe "##{role_name}?" do
    it "returns true #{role_name} if role is present" do
      subject.send("add_#{role_name}_role")
      expect(subject.roles).to include({ 'type' => role_name.to_s })
      expect(subject.send("#{role_name}?")).to be_truthy
    end

    it "returns false #{role_name} if role is not present" do
      subject.send("remove_#{role_name}_role")
      expect(subject.roles).not_to include({ 'type' => role_name.to_s })
      expect(subject.send("#{role_name}?")).to be_falsey
    end
  end

  describe "##{role_name}_role" do
    before do
      subject.send("add_#{role_name}_role")
      expect(subject.send("#{role_name}?")).to be_truthy
    end

    it "returns the #{role_name} role" do
      subject.send("#{role_name}_role")
      expect(subject.roles.count).to eq 1
      expect(subject.send("#{role_name}_role")).to include({ 'type' => role_name.to_s })
    end
  end

  describe "#add_#{role_name}_role" do
    it "allows adding a #{role_name} role" do
      subject.send("add_#{role_name}_role")
      expect(subject.send("#{role_name}?")).to be_truthy
      expect(subject.roles.count).to eq 1
    end
  end

  describe "#remove_#{role_name}_role" do
    before do
      subject.send("add_#{role_name}_role")
      expect(subject.send("#{role_name}?")).to be_truthy
    end

    it "allows removing a #{role_name} role" do
      subject.send("remove_#{role_name}_role")
      expect(subject.send("#{role_name}?")).to be_falsey
      expect(subject.roles.count).to eq 0
    end
  end

  describe "##{role_name} (scope)" do
    before do
      records = create_list(factory_name, 10)

      records.first(3).each do |record|
        record.send("add_#{role_name}_role")
        record.save
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
        record.send("add_#{role_name}_role")
        record.save
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
