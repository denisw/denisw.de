variable "passphrase" {
  description = "Encryption passphrase for the state file."
  sensitive   = true
}

terraform {
  required_providers {
    bunnynet = {
      source = "BunnyWay/bunnynet"
    }
  }

  encryption {
    key_provider "pbkdf2" "my_key_provider_name" {
      passphrase = var.passphrase
    }

    method "aes_gcm" "my_method_name" {
      keys = key_provider.pbkdf2.my_key_provider_name
    }

    state {
      method = method.aes_gcm.my_method_name
      # enforced = true
    }
  }
}

provider "bunnynet" {}
