require 'csv'

# ID,host,created_at,lifecycle_stage,cluster
# 0, 1,    2,         3,             4
tenants = CSV.parse(File.read('all_tenants_from_29th_nov.csv'), headers: true)

lines = []

File.readlines('deleted.txt').each do |line|
  lines << line.strip
end

File.open('deleted_tenants_details.csv', 'w') do |f|
  f << "ID,host,lifecycle_stage,cluster\n"
  lines.each do |line|
    found = false
    tenants.by_row.each do |row|
      if (row[1].include? line || line.include?(row[1]))
        f << "#{row[0]},#{row[1]},#{row[2]},#{row[3]}\n"
        found = true
      end
    end

    f << ",#{line},,\n" unless found
  end
end
