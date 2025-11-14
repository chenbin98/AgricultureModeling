#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
验证书签数据结构
"""

import json

def verify_bookmark_structure(file_path):
    """验证书签数据结构"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("=== 数据结构验证 ===")

    # 验证顶层结构
    assert isinstance(data, list), "顶层必须是数组"
    print("✓ 顶层结构正确：数组")

    for i, category in enumerate(data):
        # 验证主分类结构
        required_fields = ['title', 'icon', 'subcategories']
        for field in required_fields:
            assert field in category, f"主分类 {i+1} 缺少字段: {field}"

        assert isinstance(category['subcategories'], list), f"主分类 {i+1} 的 subcategories 必须是数组"

        for j, subcategory in enumerate(category['subcategories']):
            # 验证子分类结构
            sub_required_fields = ['title', 'icon', 'links']
            for field in sub_required_fields:
                assert field in subcategory, f"主分类 {i+1} 子分类 {j+1} 缺少字段: {field}"

            assert isinstance(subcategory['links'], list), f"子分类 {j+1} 的 links 必须是数组"

            for k, link in enumerate(subcategory['links']):
                # 验证链接结构
                link_required_fields = ['title', 'url', 'description']
                for field in link_required_fields:
                    assert field in link, f"链接 {k+1} 缺少字段: {field}"

                # 验证URL格式
                assert link['url'].startswith(('http://', 'https://', 'file://')), f"链接 {k+1} URL格式不正确: {link['url']}"

    print("✓ 所有数据结构验证通过")

    # 统计信息
    total_categories = len(data)
    total_subcategories = sum(len(cat['subcategories']) for cat in data)
    total_links = sum(len(sub['links']) for cat in data for sub in cat['subcategories'])

    print(f"\n=== 统计信息 ===")
    print(f"主分类数量: {total_categories}")
    print(f"子分类数量: {total_subcategories}")
    print(f"链接总数: {total_links}")

    # 显示示例数据
    print(f"\n=== 示例数据 ===")
    if data:
        first_category = data[0]
        print(f"第一个主分类: {first_category['title']} ({first_category['icon']})")
        if first_category['subcategories']:
            first_sub = first_category['subcategories'][0]
            print(f"第一个子分类: {first_sub['title']} ({first_sub['icon']})")
            if first_sub['links']:
                first_link = first_sub['links'][0]
                print(f"第一个链接: {first_link['title']}")
                print(f"  URL: {first_link['url']}")
                print(f"  描述: {first_link['description']}")

def main():
    file_path = "/Users/binchen/workshop/AgricultureModeling/data/bookmarks.json"

    try:
        verify_bookmark_structure(file_path)
        print("\n🎉 数据验证完成，所有结构都正确！")
    except Exception as e:
        print(f"❌ 数据验证失败: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()