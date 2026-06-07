/**
 * 敏感词过滤工具
 * 用于检测和过滤用户发布内容中的敏感词汇
 */

// 默认敏感词库（可根据需要扩展）
const DEFAULT_SENSITIVE_WORDS: string[] = [
  // 政治敏感
  "反动", "颠覆", "暴乱", "革命", "独裁", "专政",
  // 色情相关
  "色情", "淫秽", "嫖娼", "卖淫", "裸聊", "约炮",
  // 暴力恐怖
  "恐怖", "爆炸", "炸弹", "枪支", "杀人", "自杀",
  // 赌博诈骗
  "赌博", "博彩", "彩票", "诈骗", "传销", "洗钱",
  // 毒品相关
  "毒品", "吸毒", "贩毒", "大麻", "冰毒", "海洛因",
  // 歧视侮辱
  "傻逼", "脑残", "废物", "贱人", "去死", "滚蛋",
  // 其他违规
  "翻墙", "VPN", "代理", "黑客", "盗号", "外挂",
];

/**
 * 检测文本中是否包含敏感词
 * @param text 待检测文本
 * @param customWords 自定义敏感词列表（可选）
 * @returns 检测结果
 */
export function checkSensitiveWords(
  text: string,
  customWords?: string[]
): {
  hasSensitive: boolean;
  sensitiveWords: string[];
  filteredText: string;
} {
  const words = customWords || DEFAULT_SENSITIVE_WORDS;
  const found: string[] = [];
  let filteredText = text;

  for (const word of words) {
    if (!word.trim()) continue;
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    if (regex.test(text)) {
      found.push(word);
      filteredText = filteredText.replace(regex, "*".repeat(word.length));
    }
  }

  return {
    hasSensitive: found.length > 0,
    sensitiveWords: found,
    filteredText,
  };
}

/**
 * 验证文本是否包含敏感词（简单判断，用于表单提交前校验）
 * @param text 待检测文本
 * @returns 是否包含敏感词
 */
export function containsSensitiveWords(text: string): boolean {
  return checkSensitiveWords(text).hasSensitive;
}

/**
 * 获取检测到的敏感词列表
 * @param text 待检测文本
 * @returns 敏感词数组
 */
export function getSensitiveWords(text: string): string[] {
  return checkSensitiveWords(text).sensitiveWords;
}
