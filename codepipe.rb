require 'csv'

# Compare codepipeline data with current set of tenants with custom domain

# name,provider,category,sslCertificate,wildCardDomain,setSpamGeoBlock,setHSTSLambda,LoadBalancerDomain,s3Assets
# 0,   1,       2,       3,             4,             5,              6,            7,                 8
codepipeline = CSV.parse(File.read('aws_codepipeline.csv'), headers: true)

# ID,host,created_at,lifecycle_stage,cluster,approach,terraformed?,imported?,extra DNS records?,redirect?,notes
# 0, 1,   2,         3,              4,      5,       6,           7,        8,                 9,        10 
data = CSV.parse(File.read('tenants_imported_certs.csv'), headers: true)

# which tenants are in data but not in codepipeline?
data.by_row.each do |row|
  found = false
  codepipeline.by_row.each do |code|
    next unless code[4].include? row[1]

    found = true
    break
  end
  # puts "#{row[1]} not found in codepipeline" unless found
end

# =>
# localhost not found in codepipeline - OK
# cushingforward.com not found in codepipeline - New, terraformed
# ciudadaniaensalud.org not found in codepipeline - terraformed
# shaping.salford.gov.uk not found in codepipeline - terraformed
# your.cotswold.gov.uk not found in codepipeline - terraformed
# leeuwdenktmee.be not found in codepipeline - terraformed
# denkmee.noord-beveland.nl not found in codepipeline - terraformed
# bouwmeeaanbeernem.be not found in codepipeline - terraformed
# participez.sceaux.fr not found in codepipeline - terraformed
# budgetparticipatif.gembloux.be not found in codepipeline - terraformed
# heistdenktmee.be not found in codepipeline - terraformed
# seimitdabei.lkgi.de not found in codepipeline - terraformed
# texelspreekt.nl not found in codepipeline - terraformed
# heumenpraatmee.nl not found in codepipeline - tenant deleted

# So, we don't need to worry about not matching tenants in codepipeline,
# but we need to handle the cases where there is no match.

# which tenants are in codepipeline but not in data?
data_domains = []
data.by_row.each { |row| data_domains << row[1] }

pipe_domains = []
codepipeline.by_row.each { |row| pipe_domains << row[4] }

pipe_domains.each do |domain|
  found = false
  data_domains.each do |data_domain|
    found = true if domain.include? data_domain
  end
  puts "#{domain} not found in data" unless found
end

# =>
# DELETED = actively deleted by me in past week
# Not on AdminHQ, probably abandoned custom domain = Not actively deleted by me in past week
#
# www.zukunft-pfaffenhausen.de not found in data - DELETED
# www.meinaugustusburg.de not found in data - Not on AdminHQ, probably abandoned custom domain
# www.demain-mont-saint-guibert.be not found in data - DELETED
# www.govchat.org.za not found in data - DELETED
# www.bodobylab.no not found in data - Not on AdminHQ, probably abandoned custom domain
# mijnideevoorvlaamsbrabant.be not found in data - Not on AdminHQ, probably abandoned custom domain
# www.onscranendonck.nu not found in data - DELETED
# www.reconstruisonsverviers.be not found in data - DELETED
# www.welklimburgwiljij.be not found in data - DELETED
# www.mortselinbeweging.be not found in data - Not on AdminHQ, probably abandoned custom domain
# wapeisje.be not found in data - Not on AdminHQ, probably abandoned custom domain
# inclusiondigitaleinclusie.be not found in data - DELETED
# bienenroute.brussels not found in data - DELETED
# participatie.laarne.be not found in data - DELETED
# idee-wo.be not found in data - Not on AdminHQ, probably abandoned custom domain
# youth4climate.be not found in data - DELETED
# kinrooimeemaken.be not found in data - DELETED
# leuvenmaakhetmee.be not found in data - Not on AdminHQ, probably abandoned custom domain
# speakup2019.be not found in data - DELETED
# denkmee-hoogstraten.be not found in data - DELETED
# innovationshauptplatz.linz.at not found in data - Not on AdminHQ, probably abandoned custom domain
# projetmontpellier.fr not found in data - DELETED
# deltag.voresmaal.dk not found in data - DELETED
# hecht.haacht.be not found in data - DELETED
# consultaciudadanalampa.cl not found in data - Not on AdminHQ, probably abandoned custom domain
# participatransparente.cl not found in data - Not on AdminHQ, probably abandoned custom domain
# idee.namensnederland.nl not found in data - DELETED
# policylab.org.uk not found in data - DELETED
# involve.winsford.gov.uk not found in data - DELETED
# meridianoneconsultation.co.uk not found in data - DELETED
# engage.cityoflancasterpa.com not found in data - Not on AdminHQ, probably abandoned custom domain
# derechoshumanoslocales.cl not found in data - DELETED
# jerico.amigo.community not found in data - DELETED
# tppcoronel.cl not found in data - DELETED
# participanoneutrales.cl not found in data - DELETED
# zuurstof.be not found in data - DELETED
# udenaanhetwoord.nl not found in data - Not on AdminHQ, probably abandoned custom domain
# doemee.middelburgers.nl not found in data - DELETED
# convencion.cultura.gob.cl not found in data - Not on AdminHQ, probably abandoned custom domain
# backtocampus.ulb.be not found in data - Not on AdminHQ, probably abandoned custom domain
# shapingthamesmeadnow.org.uk not found in data - Not on AdminHQ, probably abandoned custom domain
# dialog.assens.dk not found in data - Not on AdminHQ, probably abandoned custom domain
# mitkbhpoliti.dk not found in data - Not on AdminHQ, probably abandoned custom domain
# hilversum2040.nl not found in data - DELETED
# labo.newb.coop not found in data - Not on AdminHQ, probably abandoned custom domain
# denkmee.katwijk.nl not found in data - DELETED
# plan-velo.charenton.fr not found in data - Not on AdminHQ, probably abandoned custom domain
# praatmee.schoten.be not found in data - Not on AdminHQ, probably abandoned custom domain
# all-for-zero.be not found in data - DELETED
# denkmee.zoersel.be not found in data - DELETED
# ingenuityleeds.com not found in data - DELETED
# soroedialog.dk not found in data - Not on AdminHQ, probably abandoned custom domain
# forum.wichita.gov not found in data - DELETED
# consulta2021.talcaparticipa.cl not found in data - Not on AdminHQ, probably abandoned custom domain
# voresviden.slagelse.dk not found in data - Not on AdminHQ, probably abandoned custom domain
# cheltenhamzero.org not found in data - DELETED
# jesuiseucolo.org not found in data - Not on AdminHQ, probably abandoned custom domain
# speakupafrika.net not found in data - Not on AdminHQ, probably abandoned custom domain
# borgerdialog.nyborg.dk not found in data - Not on AdminHQ, probably abandoned custom domain
# citizenlab.seattle.gov not found in data - EXISTS!
# mitdenken.smart-rhein-neckar.de not found in data - Not on AdminHQ, probably abandoned custom domain
# tourismusstrategie-brandenburg.de not found in data - Not on AdminHQ, probably abandoned custom domain
# debatenuevaconstitucion.cl not found in data - Not on AdminHQ, probably abandoned custom domain
# participa.laregionqueimaginas.cl not found in data - Not on AdminHQ, probably abandoned custom domain
# overvechtcentrum.nl not found in data - Not on AdminHQ, probably abandoned custom domain
# iesaisties.riga.lv not found in data - Not on AdminHQ, probably abandoned custom domain
# hillerod.citizenlab.co not found in data - EXISTS! NOT A CUSTOM DOMAIN (so why in pipeline?)
# cqc.citizenlab.co not found in data - EXISTS! NOT A CUSTOM DOMAIN (so why in pipeline?)
# girlsrights.citizenlab.co not found in data - EXISTS! NOT A CUSTOM DOMAIN (so why in pipeline?)
# digitalrd.citizenlab.co not found in data - EXISTS! NOT A CUSTOM DOMAIN (so why in pipeline?)
# doemee.beverwijk.nl not found in data - Not on AdminHQ, probably abandoned custom domain
# gelecekhatay.org not found in data

# Might have noticed an issue here. I have been defining custom domains as those
# without 'citizenlab' in domain, but better would be those not ending in
# citizenlab.co. However, I think this only gives us one more tenant: citizenlab.seattle.gov
# Confirmed with Metabase. Manually to spreadsheet, and I will re-export to include from here on.
