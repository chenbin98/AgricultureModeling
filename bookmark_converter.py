#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
书签文件转换脚本
将 Markdown 格式的书签文件转换为 JavaScript 对象格式
"""

import re
import json
from typing import List, Dict, Any

class BookmarkConverter:
    def __init__(self):
        # 为不同类别定义Font Awesome图标
        self.category_icons = {
            '壁纸资源': 'fas fa-image',
            '图片': 'fas fa-photo-video',
            '软件下载': 'fas fa-download',
            '视频': 'fas fa-video',
            '动画': 'fas fa-play-circle',
            '声音': 'fas fa-music',
            'ps矢量图': 'fas fa-vector-square',
            'logo': 'fas fa-copyright',
            '图标': 'fas fa-icons',
            '免费字体': 'fas fa-font',
            '图书资源': 'fas fa-book',
            'pdf下载': 'fas fa-file-pdf',
            '数据可视化': 'fas fa-chart-line',
            'ppt模板网站': 'fas fa-file-powerpoint',
            '河科大': 'fas fa-university',
            '期刊收集': 'fas fa-bookmark',
            'RS算法类期刊': 'fas fa-satellite',
            '地学大类期刊': 'fas fa-globe',
            'RS综合类期刊': 'fas fa-satellite-dish',
            '农业、土壤等期刊': 'fas fa-seedling',
            '生态、环境类期刊': 'fas fa-leaf',
            '数据、产品类期刊': 'fas fa-database',
            '水体、水文等期刊': 'fas fa-water',
            '书籍': 'fas fa-book-open',
            'R语言资料': 'fab fa-r-project',
            '深度学习': 'fas fa-brain',
            '在线网课平台': 'fas fa-graduation-cap',
            'spiders': 'fas fa-spider',
            'linux': 'fab fa-linux',
            'English': 'fas fa-language',
            'codes': 'fas fa-code',
            'RS': 'fas fa-satellite',
            'GEElearning': 'fas fa-earth-americas',
            '研究区边界': 'fas fa-map-marked-alt',
            '气象数据': 'fas fa-cloud-sun',
            '统计数据': 'fas fa-chart-bar',
            '数据共享网站': 'fas fa-share-alt',
            '农业科学数据': 'fas fa-tractor',
            '数据查找网站': 'fas fa-search',
            '土地利用数据': 'fas fa-map',
            '土壤数据': 'fas fa-mountain',
            '生态数据': 'fas fa-tree',
            '病害数据': 'fas fa-bug',
            '机器学习数据': 'fas fa-robot',
            '物候数据': 'fas fa-calendar-alt',
            '作物地图': 'fas fa-wheat-awn',
            '物种分布数据': 'fas fa-paw',
            '作物品种数据库': 'fas fa-dna',
            'wofost': 'fas fa-wheat-awn',
            'APSIM': 'fas fa-seedling',
            '模型调参': 'fas fa-sliders-h',
            'deployed_models': 'fas fa-server',
            '作物模型': 'fas fa-wheat-awn',
            'AI-tools': 'fas fa-robot',
            '空间分析': 'fas fa-map-marked',
            '科研绘图': 'fas fa-chart-pie',
            '图形摘要': 'fas fa-chart-area',
            'graphviz': 'fas fa-project-diagram',
            '论文写作': 'fas fa-pen-fancy',
            '机器学习': 'fas fa-brain',
            'Pytorch_forecasting': 'fab fa-python',
            'neural network': 'fas fa-network-wired',
            '统计分析': 'fas fa-calculator',
            '遥感&GEE': 'fas fa-satellite',
            '科研小工具': 'fas fa-tools',
            '论文投稿': 'fas fa-paper-plane',
            '项目书': 'fas fa-file-contract',
            '简历制作': 'fas fa-id-card',
            'papers': 'fas fa-file-alt',
            'journals': 'fas fa-journal-whills',
            '无人机数据处理': 'fas fa-helicopter',
            'AI-agents': 'fas fa-user-robot',
            'ppt制作': 'fas fa-presentation',
            'app开发': 'fas fa-mobile-alt',
            'sdm项目': 'fas fa-project-diagram',
            'Email': 'fas fa-envelope',
            'Scholar webs': 'fas fa-user-graduate',
            '网站': 'fas fa-globe-americas'
        }

    def parse_markdown_file(self, file_path: str) -> List[Dict[str, Any]]:
        """解析Markdown书签文件"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')
        bookmarks = []
        current_main_category = None
        current_subcategory = None

        for line in lines:
            line = line.strip()

            # 一级标题 (主分类)
            if line.startswith('# ') and not line.startswith('## '):
                current_main_category = {
                    'title': line[2:].strip(),
                    'icon': 'fas fa-folder',
                    'subcategories': []
                }
                bookmarks.append(current_main_category)
                current_subcategory = None

            # 二级标题 (子分类)
            elif line.startswith('## '):
                if current_main_category:
                    subcategory_title = line[3:].strip()
                    current_subcategory = {
                        'title': subcategory_title,
                        'icon': self.category_icons.get(subcategory_title, 'fas fa-folder-open'),
                        'links': []
                    }
                    current_main_category['subcategories'].append(current_subcategory)

            # 链接项
            elif line.startswith('- ['):
                link_match = re.match(r'- \[([^\]]+)\]\(([^)]+)\)', line)
                if link_match:
                    title = link_match.group(1).strip()
                    url = link_match.group(2).strip()

                    # 提取描述（通常在标题中包含描述信息）
                    description = self._extract_description(title, url)

                    link_obj = {
                        'title': title,
                        'url': url,
                        'description': description
                    }

                    # 如果有当前子分类，添加到子分类
                    if current_subcategory:
                        current_subcategory['links'].append(link_obj)
                    # 否则，如果只有主分类，创建一个默认子分类
                    elif current_main_category:
                        # 检查是否已经有一个默认子分类
                        default_subcategory = None
                        for subcat in current_main_category['subcategories']:
                            if subcat['title'] == '默认分类':
                                default_subcategory = subcat
                                break

                        # 如果没有默认子分类，创建一个
                        if not default_subcategory:
                            default_subcategory = {
                                'title': '默认分类',
                                'icon': 'fas fa-folder-open',
                                'links': []
                            }
                            current_main_category['subcategories'].append(default_subcategory)

                        default_subcategory['links'].append(link_obj)

        return bookmarks

    def _extract_description(self, title: str, url: str) -> str:
        """从标题和URL中提取描述"""
        # 移除常见的网站标识符
        clean_title = re.sub(r'[|·▪－-].*$', '', title).strip()

        # 如果标题包含描述性信息，提取它
        if '|' in title or '·' in title or '▪' in title or '－' in title or '-' in title:
            parts = re.split(r'[|·▪－-]', title, 1)
            if len(parts) > 1:
                return parts[1].strip()

        # 根据URL域名生成基本描述
        domain_descriptions = {
            'github.com': '开源代码仓库',
            'youtube.com': '视频内容',
            'bilibili.com': '视频内容',
            'zhihu.com': '知识分享平台',
            'csdn.net': '技术博客',
            'springer.com': '学术期刊',
            'elsevier.com': '学术期刊',
            'sciencedirect.com': '学术期刊',
            'wiley.com': '学术期刊',
            'nature.com': '顶级学术期刊',
            'google.com': '谷歌服务',
            'baidu.com': '百度服务',
            'edu.cn': '教育机构',
            'ac.cn': '科研院所'
        }

        for domain, desc in domain_descriptions.items():
            if domain in url.lower():
                return desc

        return clean_title if clean_title != title else '相关资源'

    def convert_to_javascript_array(self, bookmarks: List[Dict[str, Any]]) -> str:
        """转换为JavaScript数组格式"""
        js_code = "// 书签数据\nconst bookmarkData = "
        js_code += json.dumps(bookmarks, ensure_ascii=False, indent=2)
        js_code += ";\n\n"
        js_code += "// 导出数据\nif (typeof module !== 'undefined' && module.exports) {\n"
        js_code += "    module.exports = bookmarkData;\n"
        js_code += "}\n"
        return js_code

    def save_as_json(self, bookmarks: List[Dict[str, Any]], output_path: str):
        """保存为JSON文件"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(bookmarks, f, ensure_ascii=False, indent=2)

    def convert_file(self, input_path: str, output_path: str):
        """转换文件"""
        print(f"正在解析文件: {input_path}")
        bookmarks = self.parse_markdown_file(input_path)

        print(f"解析完成，共找到 {len(bookmarks)} 个主分类")
        total_links = sum(len(sub['links']) for category in bookmarks for sub in category['subcategories'])
        print(f"总计 {total_links} 个链接")

        # 保存为JSON格式
        self.save_as_json(bookmarks, output_path)
        print(f"已保存到: {output_path}")

        # 也保存为JavaScript格式供参考
        js_output = output_path.replace('.json', '.js')
        js_code = self.convert_to_javascript_array(bookmarks)
        with open(js_output, 'w', encoding='utf-8') as f:
            f.write(js_code)
        print(f"JavaScript版本已保存到: {js_output}")

        return bookmarks

def main():
    converter = BookmarkConverter()

    input_file = "/Users/binchen/workshop/AgricultureModeling/bookmarks_11_14_25.md"
    output_file = "/Users/binchen/workshop/AgricultureModeling/data/bookmarks.json"

    try:
        bookmarks = converter.convert_file(input_file, output_file)

        # 打印统计信息
        print("\n=== 转换统计 ===")
        for category in bookmarks:
            print(f"\n📁 {category['title']}")
            for subcategory in category['subcategories']:
                print(f"  └── {subcategory['title']}: {len(subcategory['links'])} 个链接")

        print(f"\n✅ 转换完成！所有书签已保存到 {output_file}")

    except Exception as e:
        print(f"❌ 转换失败: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()