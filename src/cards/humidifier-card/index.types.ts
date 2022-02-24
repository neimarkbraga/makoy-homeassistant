export interface CardConfig {
  entity?: string
  name?: string
  type?: string
}

export interface HumidifierAttributes {
  min_humidity?: number
  max_humidity?: number
  available_modes?: string[]
  humidity?: number
  mode?: string
  model?: string
  lan_ip?: string
  mac_address?: string
  entity_class?: string
  miot_type?: string
  'humidifier.on'?: boolean
  'humidifier.fault'?: number
  'humidifier.fan_level'?: number
  'humidifier.target_humidity'?: number
  state_updater?: string
  exclude_miot_services?: string[]
  'indicator_light.on'?: boolean
  alarm?: boolean
  'environment.relative_humidity'?: number
  'environment.temperature'?: number
  sub_entities?: string[]
  device_class?: string
  friendly_name?: string
  supported_features?: number
}