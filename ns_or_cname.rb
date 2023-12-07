# script to run dig +trace to test which approach is in use.

require 'csv'
require 'uri'
require 'net/http'

table = CSV.parse(File.read('tenants_list_6-12-23.csv'), headers: true)

File.open('ns_or_cname_v2.csv', 'w') do |f|
  f << "ID,host,created_at,lifecycle_stage,cluster,approach\n"

  table.by_row.each_with_index do |row, i|
    puts i

    next if row[1].include?('citizenlab.co')

    approach = 'unknown'
    dig = `dig CNAME #{row[1]}`
    approach = 'CNAME' if dig.include?('forward.citizenlab')

    dig = `dig NS +trace #{row[1]}` 
    if dig.include?('ns1.citizenlab')
      if approach == 'CNAME'
        approach = 'both!!'
      else
        approach = 'NS'
      end
    end

    f << "#{row[0]},#{row[1]},#{row[2]},#{row[3]},#{row[4]},#{approach}\n"
  end
end
