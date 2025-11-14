#!/usr/bin/env python3
"""
Script to convert HTML bookmarks file to standard Markdown format
"""

from bs4 import BeautifulSoup
import re

def convert_html_to_markdown(input_file, output_file):
    # Read the HTML file
    with open(input_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Parse the HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Initialize markdown content
    markdown_content = []
    
    # Track heading levels
    heading_level_map = {
        'h3': 1,  # Bold text with # (top level)
        'p2': 2,  # Bold text with ## (second level)
        'p3': 3   # Bold text with ### (third level)
    }
    
    # Process elements in order
    elements = soup.find_all(['h3', 'p'])
    
    for element in elements:
        # Check if it's a heading (h3 tag)
        if element.name == 'h3':
            # Extract text from the heading
            heading_text = element.get_text().strip()
            # Clean the text to remove extra formatting
            heading_text = re.sub(r'\s+', ' ', heading_text).strip()
            
            # Determine the heading level based on formatting (number of # symbols in bold tags)
            # Count the number of b tags to determine hierarchy level
            bold_tags = element.find_all('b')
            level = min(len(bold_tags), 3)  # Maximum level 3
            if level == 0:
                level = 1  # Default to level 1
            
            markdown_content.append(f"{'#' * level} {heading_text}")
            markdown_content.append("")  # Empty line after heading
        
        # Check if it's a paragraph with links
        elif element.name == 'p' and element.find('a'):
            links = element.find_all('a')
            for link in links:
                # Extract URL and link text
                url = link.get('href', '')
                link_text = link.get_text().strip()
                
                # Clean the link text
                link_text = re.sub(r'\s+', ' ', link_text).strip()
                
                # Add the markdown link
                if url and link_text:
                    markdown_content.append(f"- [{link_text}]({url})")
        
        # Check if it's a paragraph that's just a spacer or contains only whitespace
        elif element.name == 'p':
            text = element.get_text().strip()
            # If the paragraph contains only whitespace or breaks, add a blank line
            if not text or text.isspace() or text == '':
                markdown_content.append("")
    
    # Join all content with newlines
    final_content = '\n'.join(markdown_content)
    
    # Write to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(final_content)
    
    print(f"Bookmarks successfully converted to {output_file}")

def extract_headings_and_links(input_file):
    """
    Alternative approach to extract headings and links more systematically
    """
    with open(input_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Extract all headings and their associated links
    result = []
    
    # Find all h3 tags (these seem to be the main categories)
    h3_tags = soup.find_all('h3')
    
    for h3 in h3_tags:
        # Get the heading text
        heading = h3.get_text().strip()
        heading = re.sub(r'\s+', ' ', heading).strip()
        
        # Find the next sibling elements until the next h3 or end of document
        current = h3.next_sibling
        links = []
        
        while current:
            if current.name == 'h3':
                # Reached the next heading, stop here
                break
            elif current.name == 'p' and current.find('a'):
                # Found a paragraph with links
                anchors = current.find_all('a')
                for anchor in anchors:
                    url = anchor.get('href', '')
                    text = anchor.get_text().strip()
                    text = re.sub(r'\s+', ' ', text).strip()
                    if url and text:
                        links.append((text, url))
            elif current.name == 'p' and current.get_text().strip() in ['', ' ', '\n']:
                # Found a blank paragraph, just continue
                pass
            current = current.next_sibling
        
        result.append({
            'heading': heading,
            'links': links
        })
    
    return result

def convert_to_markdown_with_hierarchy(input_file, output_file):
    """
    Convert HTML bookmarks to markdown with proper hierarchy based on heading levels
    """
    data = extract_headings_and_links(input_file)
    
    # Write to markdown file
    with open(output_file, 'w', encoding='utf-8') as f:
        for item in data:
            heading = item['heading']
            links = item['links']
            
            # Count # symbols to determine the heading level
            level = 1
            if heading.startswith('##'):
                level = 2
            elif heading.startswith('###'):
                level = 3
            elif heading.startswith('#'):
                level = 1
            else:
                # Default to level 1 if no # prefix
                level = 1
            
            # Write heading (remove any existing # prefixes)
            clean_heading = heading.lstrip('# ')
            f.write(f"{'#' * level} {clean_heading}\n\n")
            
            # Write links
            for link_text, url in links:
                f.write(f"- [{link_text}]({url})\n")
            
            # Add a blank line after each section
            f.write("\n")

if __name__ == "__main__":
    input_file = "/Users/binchen/workshop/AgricultureModeling/bookmarks_11_14_25.html"
    output_file = "/Users/binchen/workshop/AgricultureModeling/bookmarks_11_14_25.md"
    
    convert_to_markdown_with_hierarchy(input_file, output_file)
    print("HTML bookmarks successfully converted to Markdown format!")