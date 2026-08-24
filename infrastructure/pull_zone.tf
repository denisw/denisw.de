resource "bunnynet_pullzone" "denisw_de" {
  name                          = "denisw-de"
  cors_enabled                  = false
  cache_enabled                 = true
  cache_expiration_time         = 300
  cache_expiration_time_browser = 300

  origin {
    type        = "StorageZone"
    storagezone = bunnynet_storage_zone.denisw_de.id
  }

  routing {
    tier = "Standard"
  }
}

resource "bunnynet_pullzone_hostname" "bunnynet" {
  pullzone    = bunnynet_pullzone.denisw_de.id
  name        = "denisw-de.b-cdn.net"
  tls_enabled = true
  force_ssl   = true
}

resource "bunnynet_pullzone_hostname" "denisw_de" {
  pullzone    = bunnynet_pullzone.denisw_de.id
  name        = "denisw.de"
  tls_enabled = true
  force_ssl   = true
}

resource "bunnynet_pullzone_hostname" "www_denisw_de" {
  pullzone    = bunnynet_pullzone.denisw_de.id
  name        = "www.denisw.de"
  tls_enabled = true
  force_ssl   = true
}
