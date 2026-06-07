import type { Dish } from "../types";
export const dishesPart13: Dish[] = [
  {
    id: "dongpo-pork",
    name: "东坡肉",
    category: "浙菜",
    categoryId: "zhejiang",
    description: "北宋文豪苏东坡创制的经典红烧肉，色泽红亮肥而不腻入口即化。以黄酒慢炖猪肉皮酥肉烂，千百年来深受文人雅士和平民百姓的共同喜爱。",
    image: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=600",
    ingredients: ["五花肉500g", "黄酒200ml", "生抽3勺", "老抽2勺", "冰糖30g", "葱4根", "姜4片", "八角2个"],
    steps: [
      { order: 1, description: "五花肉冷水入锅焯水5分钟捞出切成4厘米方块" },
      { order: 2, description: "砂锅底铺葱段姜片将肉块皮朝下整齐码放" },
      { order: 3, description: "加入黄酒、生抽、老抽、冰糖、八角" },
      { order: 4, description: "加开水刚好没过肉块大火烧开" },
      { order: 5, description: "转小火慢慢炖1.5-2小时至肉酥烂" },
      { order: 6, description: "将肉块翻面皮朝上大火收汁使汤汁浓稠挂满肉块" }
    ],
    tips: "黄酒是灵魂不可少。小火慢炖时间要足。正宗东坡肉不加一滴水用黄酒代水更香醇。",
    difficulty: "中等",
    time: "2.5小时",
    likes: 892,
    author: "杭帮菜传人",
    createdAt: "2024-04-01",
    isAncient: true,
    ancientInfo: {
      dynasty: "北宋",
      origin: "杭州/黄州",
      story: "苏东坡在黄州任职时创制，他在《猪肉颂》中写道：黄州好猪肉，价贱如泥土。贵者不肯吃，贫者不解煮。慢著火，少著水，火候足时它自美。后被带到杭州任上改良，成为江南名菜。"
    }
  },
  {
    id: "jiaohua-chicken",
    name: "叫花鸡",
    category: "苏菜",
    categoryId: "jiangsu",
    description: "江南传统名菜，整鸡用荷叶包裹后敷泥烤制肉嫩骨酥荷香四溢。传说为乞丐所创却成了上等宴席珍馐。",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600",
    ingredients: ["三黄鸡1只约1.5kg", "荷叶3张大张", "黄泥或面团", "葱姜各50g", "料酒3勺", "生抽2勺", "五香粉1勺", "盐适量", "香菇5朵", "火腿50g"],
    steps: [
      { order: 1, description: "鸡处理干净用料酒盐五香粉葱姜内外涂抹腌制2小时" },
      { order: 2, description: "香菇泡发火腿切片塞入鸡腹中" },
      { order: 3, description: "荷叶用温水泡软将鸡包裹严实至少裹两层" },
      { order: 4, description: "用黄泥加水调成糊状均匀涂抹在荷叶外包约2厘米厚" },
      { order: 5, description: "烤箱预热200度放入泥团烤1.5-2小时" },
      { order: 6, description: "取出敲开泥壳剥开荷叶即可食用" }
    ],
    tips: "家庭版可用面团替代黄泥。荷叶包裹要严实才不会漏汁。敲泥壳时注意别弄脏鸡肉。",
    difficulty: "困难",
    time: "3小时",
    likes: 645,
    author: "苏帮菜传人",
    createdAt: "2024-04-05",
    isAncient: true,
    ancientInfo: {
      dynasty: "宋代",
      origin: "常熟",
      story: "相传宋代一个叫花子偷了只鸡没有炊具，灵机一动用荷叶裹鸡再涂上泥巴放入火中烤，烤熟后敲开泥壳香气四溢。后人加以改良成为江南名菜叫花鸡。三叫源于食客闻香叫好、乞丐被叫住、大家叫绝。"
    }
  },
  {
    id: "longjing-shrimp",
    name: "龙井虾仁",
    category: "浙菜",
    categoryId: "zhejiang",
    description: "杭州传统名菜以清明前龙井新茶配鲜嫩河虾仁烹制，虾仁白玉茶芽翠绿清香雅致，是杭帮菜清新风格的典范。",
    image: "https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=600",
    ingredients: ["鲜活河虾仁300g", "龙井新茶5g", "鸡蛋清1个", "淀粉1勺", "料酒1勺", "盐适量", "葱姜水"],
    steps: [
      { order: 1, description: "龙井茶用80度热水冲泡取茶汤茶叶分开备用" },
      { order: 2, description: "虾仁挑去虾线加蛋清盐淀粉料酒抓匀腌制15分钟" },
      { order: 3, description: "锅中水烧开虾仁焯水10秒变粉立即捞出过冰水" },
      { order: 4, description: "锅中少许油加葱姜水茶汤煮沸" },
      { order: 5, description: "放入虾仁轻轻翻炒茶汤勾薄芡" },
      { order: 6, description: "出锅装盘撒上泡开的龙井茶叶点缀" }
    ],
    tips: "虾仁焯水时间不可过长否则肉老。龙井茶用明前新茶清香最佳。茶汤去涩只取第二泡。",
    difficulty: "中等",
    time: "30分钟",
    likes: 523,
    author: "杭帮菜传人",
    createdAt: "2024-04-10",
    isAncient: true,
    ancientInfo: {
      dynasty: "清代",
      origin: "杭州",
      story: "相传清乾隆皇帝下江南时在杭州品尝到龙井茶煮虾仁的创意菜品大加赞赏。此后杭州各大酒楼纷纷效仿龙井虾仁成为杭帮菜的代表作之一。"
    }
  },
  {
    id: "west-lake-vinegar-fish",
    name: "西湖醋鱼",
    category: "浙菜",
    categoryId: "zhejiang",
    description: "杭州楼外楼镇店名菜，鲜活草鱼用糖醋汁烹制形似螃蟹味，酸甜鲜嫩完美平衡，被誉为杭州第一名菜。",
    image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=600",
    ingredients: ["鲜活草鱼1条约750g", "姜末3勺", "白糖4勺", "米醋3勺", "生抽2勺", "料酒2勺", "淀粉水", "葱花"],
    steps: [
      { order: 1, description: "草鱼去鳞去内脏洗净在鱼身两面切牡丹刀" },
      { order: 2, description: "大锅水加料酒姜片煮开将鱼放入沸水烫3秒提三次使刀口翻开" },
      { order: 3, description: "将鱼完全放入沸水转小火浸煮8分钟至刚熟" },
      { order: 4, description: "鱼取出装盘另起锅加煮鱼原汤半碗" },
      { order: 5, description: "加姜末白糖米醋生抽煮开用水淀粉勾芡至浓稠" },
      { order: 6, description: "将糖醋汁均匀淋在鱼身上撒姜末葱花即可" }
    ],
    tips: "鱼要选用活水草鱼土腥味小。三提三放的技巧让刀口均匀翻开。糖醋比例为1:1最正宗。",
    difficulty: "中等",
    time: "35分钟",
    likes: 456,
    author: "杭帮菜传人",
    createdAt: "2024-04-15",
    isAncient: true,
    ancientInfo: {
      dynasty: "南宋",
      origin: "杭州",
      story: "南宋时杭州有一宋嫂善烹鱼羹深受百姓喜爱。后人将其鱼羹技法改良为糖醋烹鱼流传至今。楼外楼以西湖醋鱼闻名天下周总理曾多次在此宴请外宾。"
    }
  },
  {
    id: "songshou-fish-soup",
    name: "宋嫂鱼羹",
    category: "浙菜",
    categoryId: "zhejiang",
    description: "源自南宋的经典鱼羹，以鳜鱼丝、火腿丝、香菇丝、竹笋丝等入高汤制成，鲜美无比滑嫩爽口，是800年来杭州不变的味觉记忆。",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
    ingredients: ["鳜鱼1条约500g", "火腿30g", "香菇3朵", "竹笋50g", "鸡蛋清1个", "高汤500ml", "姜丝葱花", "醋1勺", "白胡椒粉", "淀粉水"],
    steps: [
      { order: 1, description: "鳜鱼蒸熟去骨拆成细丝" },
      { order: 2, description: "火腿、香菇、竹笋分别切细丝" },
      { order: 3, description: "高汤煮沸放入火腿丝香菇丝笋丝煮5分钟" },
      { order: 4, description: "放入拆好的鱼肉丝轻轻搅匀" },
      { order: 5, description: "加盐白胡椒粉调味用水淀粉勾至米汤状" },
      { order: 6, description: "淋入打散的蛋清搅成蛋花加醋撒姜丝葱花即可" }
    ],
    tips: "鱼肉拆丝要仔细去净小刺。勾芡要薄如米汤不可太稠。白胡椒粉和醋是点睛之笔。",
    difficulty: "中等",
    time: "45分钟",
    likes: 389,
    author: "杭帮菜传人",
    createdAt: "2024-04-20",
    isAncient: true,
    ancientInfo: {
      dynasty: "南宋",
      origin: "杭州",
      story: "南宋淳熙六年宋高宗赵构乘船游西湖时一卖鱼羹的妇人献上鱼羹深得皇帝喜爱赐名宋五嫂。此后宋嫂鱼羹名声大噪成为西湖名菜流传800余年。"
    }
  },
  {
    id: "fotiaoqiang-family",
    name: "家常佛跳墙",
    category: "闽菜",
    categoryId: "fujian",
    description: "佛跳墙简化家庭版，精选猪蹄鲍鱼鸡翅鹌鹑蛋等食材慢炖，坛启满屋飘香。保留传统风味降低制作难度让家宴也显大厨范。",
    image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600",
    ingredients: ["猪蹄1只", "鸡翅6个", "鲍鱼4只", "鹌鹑蛋10个", "花菇6朵", "瑶柱20g", "金华火腿50g", "黄酒100ml", "姜片葱段", "高汤500ml"],
    steps: [
      { order: 1, description: "猪蹄焯水去浮沫鸡翅焯水备用鹌鹑蛋煮熟剥壳" },
      { order: 2, description: "花菇泡发瑶柱用温水浸泡30分钟" },
      { order: 3, description: "砂锅底铺姜片葱段依次码入猪蹄、鸡翅、鲍鱼" },
      { order: 4, description: "放花菇瑶柱火腿鹌鹑蛋加入高汤和黄酒" },
      { order: 5, description: "大火烧开转小火慢炖2小时至猪蹄酥烂" },
      { order: 6, description: "加盐调味再炖15分钟即可" }
    ],
    tips: "鲍鱼最后半小时放避免炖老。小火慢炖是精华不可心急。黄酒增香去腥是佛跳墙的灵魂调料。",
    difficulty: "中等",
    time: "3小时",
    likes: 534,
    author: "闽菜大厨",
    createdAt: "2024-04-25",
    isAncient: true,
    ancientInfo: {
      dynasty: "清代",
      origin: "福州",
      story: "佛跳墙源自福州聚春园创始人郑春发。据说一秀才品尝后诗意大发写下坛启荤香飘四邻佛闻弃禅跳墙来的诗句这道菜因此得名佛跳墙。本版本为家常简化做法降低了食材门槛。"
    }
  },
  {
    id: "lions-head-meatball",
    name: "狮子头",
    category: "苏菜",
    categoryId: "jiangsu",
    description: "淮扬菜经典代表大肉丸形如狮子头而得名。肥瘦相间细切粗斩入口即化汤清味醇，是国宴必备名馔。",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600",
    ingredients: ["五花肉400g", "马蹄5个", "鸡蛋1个", "淀粉2勺", "青菜心200g", "高汤500ml", "姜葱料酒", "盐白胡椒"],
    steps: [
      { order: 1, description: "五花肉先切片再切丝最后切粒细切粗斩保留颗粒感" },
      { order: 2, description: "马蹄去皮切碎粒与肉粒混合" },
      { order: 3, description: "加鸡蛋淀粉姜葱水盐向一个方向搅拌上劲" },
      { order: 4, description: "双手沾水将肉馅团成大肉丸约拳头大小" },
      { order: 5, description: "砂锅加高汤小火放入狮子头水面微沸炖2小时" },
      { order: 6, description: "青菜心焯水放入砂锅同煮5分钟即可" }
    ],
    tips: "肉要手切不能机打保持颗粒感。猪肉肥瘦比6:4最佳。小火慢炖汤面微微冒泡即可不可沸腾。",
    difficulty: "困难",
    time: "2.5小时",
    likes: 678,
    author: "淮扬菜大师",
    createdAt: "2024-05-01",
    isAncient: true,
    ancientInfo: {
      dynasty: "隋代",
      origin: "扬州",
      story: "相传隋炀帝下扬州时御厨创制了葵花斩肉后经唐代郇国公府厨师改良。因其形态威武如雄狮鬃毛被宾客称为狮子头从此名扬天下。淮扬菜有红烧和清炖两种狮子头做法。"
    }
  },
  {
    id: "beggar-poached-chicken",
    name: "开水白菜",
    category: "川菜",
    categoryId: "sichuan",
    description: "川菜最高境界看似清水白菜实则汤清如水味极鲜美。用老母鸡火腿排骨吊汤多次扫汤澄清配以精选嫩菜心，是国宴级名菜。",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600",
    ingredients: ["大白菜心1颗", "老母鸡1只约2kg", "猪排骨500g", "金华火腿100g", "鸡胸肉200g(扫汤用)", "姜葱", "料酒"],
    steps: [
      { order: 1, description: "老母鸡排骨焯水后加火腿姜葱料酒和足量清水大火烧开炖3小时成高汤" },
      { order: 2, description: "鸡胸肉剁成肉蓉冷水调稀倒入微沸的汤中搅匀使杂质吸附到肉蓉上" },
      { order: 3, description: "捞出肉蓉用细纱布过滤汤水反复扫汤2-3次至汤清如水" },
      { order: 4, description: "白菜心切十字刀只取最嫩的部分洗净" },
      { order: 5, description: "将澄清高汤烧开浇在装盘的白菜心上" },
      { order: 6, description: "入蒸笼大火蒸3分钟使菜心吸饱鲜汤即可" }
    ],
    tips: "扫汤是开水白菜的灵魂工序不可省略。鸡汤要反复吊制直到清澈见底。白菜心只取最内层最嫩的几片。",
    difficulty: "困难",
    time: "4小时",
    likes: 423,
    author: "川菜大师",
    createdAt: "2024-05-05",
    isAncient: true,
    ancientInfo: {
      dynasty: "清代",
      origin: "成都",
      story: "清代川菜名厨黄敬临在御膳房创制因不满京城人认为川菜只会麻辣而创此菜证明川菜清淡高雅的一面。看似白水煮白菜实则用顶级高汤吊制工序繁琐是川菜的巅峰之作。"
    }
  }
];
