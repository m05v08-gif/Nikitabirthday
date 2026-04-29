export const STYLE_BUCKETS = [
  {
    id: "smart_casual",
    title: "Smart casual",
    target: 55,
    queries: [
      "men smart casual outfit full body",
      "men blazer casual outfit",
      "men knitwear smart casual",
      "men chinos outfit",
      "men smart casual street",
      "men office casual outfit"
    ]
  },
  {
    id: "relaxed_casual",
    title: "Relaxed casual",
    target: 45,
    queries: [
      "men relaxed casual outfit",
      "men casual outfit neutral colors",
      "men sweatshirt outfit",
      "men denim jacket outfit",
      "men casual layers outfit",
      "men everyday outfit men"
    ]
  },
  {
    id: "minimal_clean",
    title: "Minimal / clean",
    target: 35,
    queries: [
      "minimal menswear outfit",
      "men clean outfit",
      "men monochrome outfit",
      "men neutral outfit minimal",
      "men minimal style outfit full body"
    ]
  },
  {
    id: "date_night",
    title: "Date night / evening",
    target: 25,
    queries: [
      "men date night outfit",
      "men evening outfit",
      "men black outfit smart",
      "men blazer evening look"
    ]
  },
  {
    id: "weekend_walk",
    title: "Weekend / прогулка",
    target: 25,
    queries: [
      "men weekend outfit",
      "men city walk outfit",
      "men casual weekend style",
      "men sneakers outfit street"
    ]
  },
  {
    id: "dad_on_the_go",
    title: "Dad-on-the-go",
    target: 20,
    queries: [
      "men dad outfit casual",
      "men comfortable city outfit",
      "men simple casual outfit",
      "men practical casual outfit"
    ]
  },
  {
    id: "summer_vacation",
    title: "Summer / vacation",
    target: 25,
    queries: [
      "men summer outfit",
      "men linen shirt outfit",
      "men vacation outfit",
      "men beach casual outfit"
    ]
  },
  {
    id: "autumn_layering",
    title: "Autumn layering",
    target: 25,
    queries: [
      "men autumn outfit",
      "men layered outfit",
      "men cardigan outfit",
      "men sweater coat outfit"
    ]
  },
  {
    id: "outerwear",
    title: "Outerwear looks",
    target: 30,
    queries: [
      "men coat outfit",
      "men trench coat outfit",
      "men bomber jacket outfit",
      "men leather jacket outfit",
      "men winter coat outfit"
    ]
  },
  {
    id: "accessories_details",
    title: "Accessories / детали",
    target: 35,
    queries: [
      "men accessories watch",
      "men sunglasses style",
      "men leather bag",
      "men boots outfit detail",
      "men white sneakers fashion",
      "men scarf outfit",
      "men belt accessory"
    ]
  }
];

export function makeManifest() {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    goal: { total: 270, mix: { fullLook: 0.6, detail: 0.2, accessories: 0.2 } },
    buckets: STYLE_BUCKETS
  };
}

