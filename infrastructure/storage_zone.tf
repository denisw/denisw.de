resource "bunnynet_storage_zone" "denisw_de" {
  name                = "www-denisw-de"
  type                = "S3"
  zone_tier           = "Standard"
  region              = "DE"
  replication_regions = ["LA", "NY", "SG"]
}
