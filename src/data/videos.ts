export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;           // 视频链接（B站/YouTube/本地视频）
  thumbnail: string;      // 封面图
  duration: string;       // 视频时长，如 "15:30"
  category: string;       // 所属菜系
  dishName?: string;      // 关联菜品名（可选）
  source: string;         // 来源平台，如 "B站" "YouTube" "本地"
  author: string;         // 上传作者
  createdAt: string;      // 添加日期
  tags: string[];         // 标签
}

/**
 * 🎬 美食制作视频库
 * 
 * 📝 如何添加视频：
 * 在下面数组中添加一个对象即可，格式如下：
 * {
 *   id: "唯一ID（英文）",
 *   title: "视频标题",
 *   description: "视频描述",
 *   url: "视频链接（支持B站/YouTube/本地文件）",
 *   thumbnail: "封面图链接或本地路径",
 *   duration: "视频时长（如 12:30）",
 *   category: "所属菜系（如 川菜）",
 *   dishName: "关联菜品（可选）",
 *   source: "来源平台（如 B站）",
 *   author: "作者名",
 *   createdAt: "添加日期",
 *   tags: ["标签1", "标签2"],
 * }
 * 
 * 🔗 支持的链接格式：
 * - B站: https://www.bilibili.com/video/BVxxxxxxxxx
 * - YouTube: https://www.youtube.com/watch?v=xxxxxxxx
 * - 本地视频: /videos/your-video.mp4 （视频文件需放在 public/videos/ 目录下）
 */


export const videos: Video[] = [
  
  {
    id: "mapo-tofu-video",
    title: "正宗麻婆豆腐做法 | 学会这道川菜你就是大厨",
    description: "从豆腐焯水到红油制作，一步步教你做出饭店级别的麻婆豆腐。麻辣鲜香，下饭神器！",
    url: "https://www.bilibili.com/video/BV1md3NzzEnF/",
    thumbnail: "",
    duration: "08:32",
    category: "川菜",
    dishName: "麻婆豆腐",
    source: "B站",
    author: "美食作家王刚",
    createdAt: "2024-03-15",
    tags: ["川菜", "麻婆豆腐", "家常菜", "麻辣"],
  },
  {
    id: "dongpo-pork-video",
    title: "东坡肉 | 杭州名菜家庭版做法",
    description: "苏轼笔下的东坡肉，五花肉慢炖至入口即化。教你选肉、调料、火候全流程。",
    url: "https://www.bilibili.com/video/BV1grrwBtEBy/",
    thumbnail: "",
    duration: "12:18",
    category: "浙菜",
    dishName: "东坡肉",
    source: "B站",
    author: "日食记",
    createdAt: "2024-03-18",
    tags: ["浙菜", "东坡肉", "红烧肉", "杭州"],
  },
  {
    id: "hand-grabbed-mutton-video",
    title: "宁夏手抓羊肉 | 最简单的羊肉做法最极致的鲜美",
    description: "盐池滩羊只需清水煮就能鲜掉眉毛！手抓羊肉配蒜泥醋，吃过才知道什么叫真正的好羊肉。",
    url: "https://www.bilibili.com/video/BV1z5z8YpEPj/",
    thumbnail: "",
    duration: "10:45",
    category: "宁夏菜",
    dishName: "宁夏手抓羊肉",
    source: "B站",
    author: "盗月社食遇记",
    createdAt: "2024-04-02",
    tags: ["宁夏", "手抓羊肉", "盐池滩羊", "回族美食"],
  },
  {
    id: "lanzhou-beef-noodles-video",
    title: "兰州牛肉面 | 拉面师傅手把手教你拉出正宗二细",
    description: "从和面到熬汤，从拉面到辣椒油，一碗正宗兰州牛肉面的完整制作过程。",
    url: "https://www.bilibili.com/video/BV1Vt411T7AR",
    thumbnail: "",
    duration: "14:20",
    category: "甘肃菜",
    dishName: "兰州牛肉面",
    source: "B站",
    author: "陈师傅兰州牛肉面",
    createdAt: "2024-04-10",
    tags: ["甘肃", "兰州牛肉面", "拉面", "面食"],
  },
  {
    id: "peking-duck-video",
    title: "北京烤鸭完整教程 | 从选鸭到片鸭全流程",
    description: "在家也能做正宗北京烤鸭！吹皮、烫皮、挂糖、风干、烤制全步骤详解。",
    url: "https://www.bilibili.com/video/BV1Mt411U7kq",
    thumbnail: "",
    duration: "22:05",
    category: "鲁菜",
    dishName: "北京烤鸭",
    source: "B站",
    author: "老饭骨",
    createdAt: "2024-04-15",
    tags: ["鲁菜", "北京烤鸭", "烤鸭", "宴席大菜"],
  },
  {
    id: "kung-pao-chicken-video",
    title: "宫保鸡丁 | 荔枝味型川菜经典",
    description: "国宴级别的宫保鸡丁怎么做？告诉你糖醋比例的秘密，炒出荔枝味的完美宫保鸡丁。",
    url: "https://www.bilibili.com/video/BV1Jx411h7SX",
    thumbnail: "",
    duration: "07:55",
    category: "川菜",
    dishName: "宫保鸡丁",
    source: "B站",
    author: "美食作家王刚",
    createdAt: "2024-04-20",
    tags: ["川菜", "宫保鸡丁", "荔枝味", "家常菜"],
  },
  {
    id: "crossing-bridge-noodles-video",
    title: "过桥米线 | 云南最浪漫的小吃",
    description: "滚烫的鸡汤被油膜覆盖，依次放入生肉片蔬菜和米线。带你领略过桥米线的暖心故事。",
    url: "https://www.bilibili.com/video/BV1CJ41197Xh",
    thumbnail: "",
    duration: "09:40",
    category: "云南菜",
    dishName: "过桥米线",
    source: "B站",
    author: "滇西小哥",
    createdAt: "2024-05-01",
    tags: ["云南", "过桥米线", "米线", "鸡汤"],
  },
  {
    id: "squirrel-fish-video",
    title: "松鼠鳜鱼 | 苏菜刀工炫技菜",
    description: "花刀、裹粉、油炸、浇汁一气呵成。松鼠鳜鱼是苏菜刀工和美学的巅峰展现。",
    url: "https://www.bilibili.com/video/BV1Zx411e7EA",
    thumbnail: "",
    duration: "11:30",
    category: "苏菜",
    dishName: "松鼠鳜鱼",
    source: "B站",
    author: "老饭骨",
    createdAt: "2024-05-10",
    tags: ["苏菜", "松鼠鳜鱼", "刀工", "宴席菜"],
  },
  {
    id: "local-food-video-01",
    title: "美食制作精选 | 家常菜教学合集",
    description: "本地美食制作视频，包含经典家常菜的详细做法演示。",
    url: "/videos/11610-231571879_medium.mp4",
    thumbnail: "",
    duration: "00:30",
    category: "家常菜",
    dishName: "精选合集",
    source: "本地",
    author: "美食爱好者",
    createdAt: "2024-05-20",
    tags: ["家常菜", "教学", "本地视频"],
  },
];

// 按菜系筛选视频的辅助函数
export function getVideosByCategory(category: string): Video[] {
  return videos.filter((v) => v.category === category);
}

// 获取所有菜系列表（从视频数据中提取）
export function getVideoCategories(): string[] {
  return [...new Set(videos.map((v) => v.category))].sort();
}
