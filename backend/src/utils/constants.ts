export const DB_NAME = "Dodbaa"

export const CATEGORY_TREE = {
  paintings: {
    indian_paintings: [
      "pattachitra",
      "madhubani",
      "kalighat",
      "folk_art",
    ],
    western_paintings: [
      "water_colours",
      "creative",
      "realistic",
      "acrylic_paintings",
      "oil_painting",
      "oil_pastel",
    ],
  },

  sculpture: {
    stone: ["low_relief", "high_relief", "round_figure"],
    wood: ["low_relief", "high_relief", "round_figure"],
    fibre: ["low_relief", "high_relief", "round_figure"],
    terracotta: ["low_relief", "high_relief", "round_figure"],
    metal_casting: ["low_relief", "high_relief", "round_figure"],
  },

  ceramics: {
    pottery: ["terracotta"],
    vases: [],
    plates: [],
  },

  keychains: {
    metal: [],
    wooden: [],
    china_clay: [],
    terracotta: [],
    molded_clay: [],
  },

  sketch: {
    graphite_sketch: [],
    charcoal_sketch: [],
    pencil_portrait: [],
  },

  others: {
    bottle_craft: [],
    mirror_craft: [],
    lippan_art: [],
    macrame: ["purse", "jhoomer", "mirror"],
    crochet: [],
    stone_art: ["painting", "carving"],
  },
} as const;
