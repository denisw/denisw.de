locals {
  canonical_hostname = bunnynet_pullzone_hostname.denisw_de.name
  hostnames = [
    bunnynet_pullzone_hostname.bunnynet.name,
    bunnynet_pullzone_hostname.denisw_de.name,
    bunnynet_pullzone_hostname.www_denisw_de.name,
  ]

  path_redirects = {
    "/about.html"                      = "/about"
    "/imprint.html"                    = "/impressum"
    "/2019/04/08/redux-preboiled.html" = "/posts/redux-preboiled/"
    "/2019/04/15/redux-preboiled.html" = "/posts/redux-preboiled/"
  }
}

resource "bunnynet_pullzone_edgerule" "path_redirect" {
  for_each    = local.path_redirects
  enabled     = true
  pullzone    = bunnynet_pullzone.denisw_de.id
  description = "Redirect from ${each.key}"
  priority    = 2

  match_type = "MatchAny"
  triggers = [
    {
      type       = "Url"
      match_type = "MatchAny"
      patterns   = [for host in local.hostnames : "*://${host}${each.key}"]
      parameter1 = null
      parameter2 = null
    }
  ]

  actions = [
    {
      type       = "Redirect"
      parameter1 = "https://${local.canonical_hostname}${each.value}"
      parameter2 = "302"
      parameter3 = null
    }
  ]
}

resource "bunnynet_pullzone_edgerule" "redirect_to_canonical_hostname" {
  enabled     = true
  pullzone    = bunnynet_pullzone.denisw_de.id
  description = "Redirect to canonical hostname"
  priority    = 1

  match_type = "MatchAny"
  triggers = [
    {
      type       = "Url"
      match_type = "MatchAny"
      patterns = [
        for host in local.hostnames : "*://${host}/*"
        if host != local.canonical_hostname
      ]
      parameter1 = null
      parameter2 = null
    }
  ]

  actions = [
    {
      type       = "Redirect"
      parameter1 = "https://${local.canonical_hostname}{{path}}"
      parameter2 = "302"
      parameter3 = null
    }
  ]
}


resource "bunnynet_pullzone_edgerule" "exclude_cache_control_from_html_responses" {
  enabled     = true
  pullzone    = bunnynet_pullzone.denisw_de.id
  description = "Exclude Cache-Control from HTML responses"
  priority    = 0

  match_type = "MatchAny"
  triggers = [
    {
      type       = "ResponseHeader"
      match_type = "MatchAny"
      patterns   = ["text/html*"]
      parameter1 = "Content-Type"
      parameter2 = null
    }
  ]

  actions = [
    {
      type       = "OverrideBrowserCacheResponseHeader"
      parameter1 = "max-age=0"
      parameter2 = null
      parameter3 = null
    }
  ]
}

resource "bunnynet_pullzone_edgerule" "set_cache_control_for_immutable_assets" {
  enabled     = true
  pullzone    = bunnynet_pullzone.denisw_de.id
  description = "Set Cache-Control for immutable assets"
  priority    = 0

  match_type = "MatchAny"
  triggers = [
    {
      type       = "Url"
      match_type = "MatchAny"
      patterns   = ["*/*.woff2"]
      parameter1 = null
      parameter2 = null
    }
  ]

  actions = [
    {
      type       = "OverrideBrowserCacheResponseHeader"
      parameter1 = "public, max-age=31536000, immutable"
      parameter2 = null
      parameter3 = null
    }
  ]
}
