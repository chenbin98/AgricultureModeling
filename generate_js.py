#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成JavaScript版本的书签数据
"""

import json

def generate_javascript_version(json_file, js_file):
    """生成JavaScript版本"""
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    js_content = '''// 书签数据 - 从 Markdown 文件自动转换生成
// 生成时间: ''' + str(__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')) + '''

const bookmarkData = ''' + json.dumps(data, ensure_ascii=False, indent=2) + ''';

// 导出数据（支持 Node.js 和浏览器环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = bookmarkData;
}

// 浏览器全局变量
if (typeof window !== 'undefined') {
    window.bookmarkData = bookmarkData;
}

// 辅助函数：获取所有链接
function getAllLinks() {
    const links = [];
    bookmarkData.forEach(category => {
        category.subcategories.forEach(subcategory => {
            subcategory.links.forEach(link => {
                links.push({
                    ...link,
                    category: category.title,
                    subcategory: subcategory.title
                });
            });
        });
    });
    return links;
}

// 辅助函数：根据关键词搜索链接
function searchLinks(keyword) {
    const allLinks = getAllLinks();
    const lowerKeyword = keyword.toLowerCase();
    return allLinks.filter(link =>
        link.title.toLowerCase().includes(lowerKeyword) ||
        link.description.toLowerCase().includes(lowerKeyword) ||
        link.category.toLowerCase().includes(lowerKeyword) ||
        link.subcategory.toLowerCase().includes(lowerKeyword)
    );
}

// 辅助函数：获取统计信息
function getStatistics() {
    const stats = {
        totalCategories: bookmarkData.length,
        totalSubcategories: 0,
        totalLinks: 0,
        categoriesWithLinks: []
    };

    bookmarkData.forEach(category => {
        const categoryStats = {
            title: category.title,
            icon: category.icon,
            subcategoriesCount: category.subcategories.length,
            linksCount: 0
        };

        category.subcategories.forEach(subcategory => {
            stats.totalSubcategories++;
            categoryStats.linksCount += subcategory.links.length;
            stats.totalLinks += subcategory.links.length;
        });

        stats.categoriesWithLinks.push(categoryStats);
    });

    return stats;
}

// 导出辅助函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports.getAllLinks = getAllLinks;
    module.exports.searchLinks = searchLinks;
    module.exports.getStatistics = getStatistics;
}
'''

    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(js_content)

def main():
    json_file = "/Users/binchen/workshop/AgricultureModeling/data/bookmarks.json"
    js_file = "/Users/binchen/workshop/AgricultureModeling/data/bookmarks.js"

    generate_javascript_version(json_file, js_file)
    print(f"✅ JavaScript版本已生成: {js_file}")

if __name__ == "__main__":
    main()