#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
清理书签数据，移除空的分类和子分类
"""

import json

def cleanup_bookmarks(input_file, output_file):
    """清理书签数据"""
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    cleaned_data = []

    for category in data:
        # 过滤掉没有链接的子分类
        cleaned_subcategories = []
        for subcategory in category['subcategories']:
            if subcategory['links']:  # 只保留有链接的子分类
                cleaned_subcategories.append(subcategory)

        # 只保留有子分类的主分类
        if cleaned_subcategories:
            category['subcategories'] = cleaned_subcategories
            cleaned_data.append(category)

    # 保存清理后的数据
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=2)

    return cleaned_data

def main():
    input_file = "/Users/binchen/workshop/AgricultureModeling/data/bookmarks.json"
    output_file = "/Users/binchen/workshop/AgricultureModeling/data/bookmarks.json"

    print("正在清理书签数据...")
    cleaned_data = cleanup_bookmarks(input_file, output_file)

    print(f"清理完成！")
    print(f"保留的主分类: {len(cleaned_data)}")
    total_subcategories = sum(len(cat['subcategories']) for cat in cleaned_data)
    print(f"保留的子分类: {total_subcategories}")
    total_links = sum(len(sub['links']) for cat in cleaned_data for sub in cat['subcategories'])
    print(f"总链接数: {total_links}")

if __name__ == "__main__":
    main()