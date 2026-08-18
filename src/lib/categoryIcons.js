import { Shirt, Wind, Layers, Footprints, Watch, Tags } from '../components/icons'

// Maps a backend category `icon` key to its line-icon component.
const iconMap = {
  shirt: Shirt,
  layers: Layers,
  wind: Wind,
  footwear: Footprints,
  footprints: Footprints,
  watch: Watch,
  accessories: Watch,
}

// Resolve the icon component for a category document (falls back to a tag icon).
export const iconForCategory = (category) => iconMap[category?.icon] || Tags
