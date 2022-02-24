export interface CardConfig {
  entity?: string
  name?: string
  type?: string
}

export interface AirPurifierAttributes {
  hvac_modes?: string[]
  min_temp?: number
  max_temp?: number
  target_temp_step?: number
  preset_modes: string[]
  current_temperature?: number | null
  preset_mode?: string | null
  model?: string
  lan_ip: string
  mac_address: string
  entity_class: string
  miot_type: string
  'air_purifier.on': boolean
  'air_purifier.fault': string
  state_updater: string
  exclude_miot_services: string[]
  'custom_service.moto_speed_rpm': number
  'custom_service.miio_lib_version': string
  'custom_service.favorite_speed': string
  'aqi_updata_heartbeat-9-4': number
  'physical_controls_locked': boolean
  'screen.brightness': number
  'filter.filter_life_level': number
  'filter.filter_used_time': number
  'environment.pm2_5_density': number
  sub_entities: string[]
  friendly_name: string
  supported_features: number
}