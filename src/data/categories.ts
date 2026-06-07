import type { Category } from "../types";

export const categories: Category[] = [
  // ============ 八大菜系 ============
  { id: "sichuan", name: "川菜", description: "麻辣鲜香，百菜百味", image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7ea?w=400", color: "#C62828", dishCount: 11, group: "八大菜系" },
  { id: "cantonese", name: "粤菜", description: "清淡鲜美，讲究原汁原味", image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400", color: "#E65100", dishCount: 11, group: "八大菜系" },
  { id: "shandong", name: "鲁菜", description: "咸鲜纯正，火候精湛", image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400", color: "#1565C0", dishCount: 10, group: "八大菜系" },
  { id: "jiangsu", name: "苏菜", description: "口味平和，刀工精细", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400", color: "#00695C", dishCount: 10, group: "八大菜系" },
  { id: "zhejiang", name: "浙菜", description: "清鲜嫩爽，注重本味", image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400", color: "#2E7D32", dishCount: 10, group: "八大菜系" },
  { id: "fujian", name: "闽菜", description: "鲜香酸甜，汤菜见长", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400", color: "#6A1B9A", dishCount: 9, group: "八大菜系" },
  { id: "hunan", name: "湘菜", description: "香辣浓郁，口味多变", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400", color: "#AD1457", dishCount: 10, group: "八大菜系" },
  { id: "anhui", name: "徽菜", description: "重油重色，火功独到", image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7ea?w=400", color: "#4E342E", dishCount: 9, group: "八大菜系" },

  // ============ 地方菜系 ============
  { id: "dongbei", name: "东北菜", description: "豪放大气，咸甜分明", image: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=400", color: "#BF360C", dishCount: 10, group: "地方菜系", region: "东北（黑吉辽）" },
  { id: "xinjiang", name: "新疆菜", description: "西域风味，羊肉飘香", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400", color: "#E65100", dishCount: 10, group: "地方菜系", region: "新疆" },
  { id: "yunnan", name: "云南菜", description: "民族风味，菌菇天堂", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400", color: "#4E342E", dishCount: 9, group: "地方菜系", region: "云南" },
  { id: "guizhou", name: "贵州菜", description: "酸辣醇厚，山野风味", image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400", color: "#558B2F", dishCount: 9, group: "地方菜系", region: "贵州" },
  { id: "shaanxi", name: "陕西菜", description: "面食王国，古都遗韵", image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400", color: "#D84315", dishCount: 10, group: "地方菜系", region: "陕西" },
  { id: "hubei", name: "湖北菜/鄂菜", description: "蒸煨擅长，水产丰富", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400", color: "#1565C0", dishCount: 9, group: "地方菜系", region: "湖北" },
  { id: "beijing", name: "北京菜/京菜", description: "宫廷遗风，涮烤为主", image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400", color: "#B71C1C", dishCount: 9, group: "地方菜系", region: "北京" },
  { id: "shanghai", name: "上海菜/本帮菜", description: "浓油赤酱，咸中带甜", image: "https://images.unsplash.com/photo-1603073163308-fd6be0a12bc7?w=400", color: "#283593", dishCount: 9, group: "地方菜系", region: "上海" },
  { id: "henan", name: "河南菜/豫菜", description: "五味调和，中正平和", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400", color: "#FF6F00", dishCount: 8, group: "地方菜系", region: "河南" },
  { id: "hakka", name: "客家菜", description: "咸香味浓，质朴醇厚", image: "https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400", color: "#795548", dishCount: 8, group: "地方菜系", region: "闽粤赣客家地区" },
  { id: "chaoshan", name: "潮汕菜", description: "精细鲜美，卤水一绝", image: "https://images.unsplash.com/photo-1565688514234-7e2fc6f4d3a3?w=400", color: "#BF360C", dishCount: 8, group: "地方菜系", region: "广东潮汕" },
  { id: "taiwan", name: "台湾菜", description: "融合风味，小吃天堂", image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400", color: "#00838F", dishCount: 8, group: "地方菜系", region: "台湾" },
  { id: "hainan", name: "海南菜/琼菜", description: "清淡鲜美，椰香四溢", image: "/images/hele-crab.jpg", color: "#00BFA5", dishCount: 6, group: "地方菜系", region: "海南" },
  { id: "guangxi", name: "广西菜/桂菜", description: "酸辣鲜香，米粉闻名", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400", color: "#388E3C", dishCount: 8, group: "地方菜系", region: "广西" },
  { id: "jiangxi", name: "江西菜/赣菜", description: "咸香鲜辣，乡土风味", image: "/images/ningdu-three-cup-chicken.jpg", color: "#F57C00", dishCount: 6, group: "地方菜系", region: "江西" },
  { id: "shanxi", name: "山西菜/晋菜", description: "面食之根，醋香醇厚", image: "/images/sweet-sour-meatballs.jpg", color: "#5D4037", dishCount: 10, group: "地方菜系", region: "山西" },
  { id: "tianjin", name: "天津菜", description: "河海两鲜，酱香浓郁", image: "/images/tianjin-braised-fish.jpg", color: "#37474F", dishCount: 6, group: "地方菜系", region: "天津" },
  { id: "neimenggu", name: "内蒙古菜", description: "草原风味，羊肉至鲜", image: "/images/roast-lamb-leg.jpg", color: "#33691E", dishCount: 6, group: "地方菜系", region: "内蒙古" },
  { id: "hk-macau", name: "港澳菜", description: "中西合璧，茶餐厅文化", image: "https://images.unsplash.com/photo-1553163147-ed784cb30c7c?w=400", color: "#880E4F", dishCount: 8, group: "地方菜系", region: "香港、澳门" },
  { id: "xizang", name: "西藏菜", description: "高原风味，青稞飘香", image: "/images/butter-tea.jpg", color: "#827717", dishCount: 6, group: "地方菜系", region: "西藏" },
  { id: "gansu", name: "甘肃菜/陇菜", description: "丝路风味，牛羊飘香", image: "/images/lanzhou-beef-noodles-dish.jpg", color: "#E65100", dishCount: 6, group: "地方菜系", region: "甘肃" },
  { id: "qinghai", name: "青海菜", description: "高原风味，纯净自然", image: "https://images.unsplash.com/photo-1543165794-ad083bb0e6a6?w=400", color: "#1B5E20", dishCount: 6, group: "地方菜系", region: "青海" },
  { id: "ningxia", name: "宁夏菜", description: "回族风味，滩羊鲜美", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400", color: "#BF360C", dishCount: 6, group: "地方菜系", region: "宁夏" },
];
