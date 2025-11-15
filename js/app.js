// AgricultureModeling 导航网站主应用
class NavigationApp {
    constructor() {
        this.bookmarks = [];
        this.filteredBookmarks = [];
        this.currentCategory = null;
        this.currentView = 'grid';
        this.searchTerm = '';
        this.isManageMode = false;
        this.modalManager = null;
        this.contextMenu = null;
        this.dragManager = null;
        this.gistId = null;
        this.gistPat = null;
        this.lastSync = null;

        // 彻底拦截所有成功相关的弹窗
        this.setupAlertInterceptor();

        this.init();
    }

    setupAlertInterceptor() {
        // 保存原始alert函数
        const originalAlert = window.alert;

        // 重写alert函数
        window.alert = function(message) {
            console.log('Alert被调用，消息:', message);
            console.trace(); // 打印调用栈

            const str = String(message || '');

            // 阻止成功相关的提示
            if (str.includes('成功') ||
                str.includes('同步成功') ||
                str.includes('success') ||
                str.includes('Success')) {
                console.warn('🚫 已阻止成功提示:', message);
                return; // 完全不显示
            }

            // 允许重要提示显示
            const importantKeywords = ['请', '错误', '失败', '无效', '格式', '选择', '输入', '填写'];
            const isImportant = importantKeywords.some(keyword => str.includes(keyword));

            if (isImportant) {
                return originalAlert.call(this, message); // 显示重要提示
            }

            console.warn('🚫 已阻止其他弹窗:', message);
        };

        // 同时拦截confirm
        const originalConfirm = window.confirm;
        window.confirm = function(message) {
            console.log('Confirm被调用:', message);
            if (String(message || '').includes('删除')) {
                return originalConfirm.call(window, message); // 保留删除确认
            }
            return true; // 其他情况默认确认
        };
    }

    async init() {
        this.showLoading();
        this.loadGistSettings();
        await this.loadBookmarks();
        this.setupEventListeners();
        this.initializeManagementFeatures();
        this.renderNavTree();
        this.hideLoading();
        this.updateStats();
    }

    async loadBookmarks() {
        try {
            this.bookmarks = await this.loadData();
        } catch (error) {
            console.error('加载书签失败:', error);
            this.bookmarks = this.getBookmarksData();
        }
    }

    loadGistSettings() {
        this.gistId = localStorage.getItem('agri_gist_id');
        this.gistPat = localStorage.getItem('agri_gist_pat');
        this.lastSync = localStorage.getItem('agri_last_sync');
    }

    getBookmarksData() {
        return [
            {
                category: '综合资源',
                subcategories: [
                    {
                        name: '壁纸资源',
                        icon: 'fas fa-image',
                        items: [
                            { title: '很棒的壁纸-wallhaven.cc', url: 'https://wallhaven.cc/', description: '高质量壁纸资源网站' },
                            { title: '必应每日高清壁纸', url: 'https://bing.ioliu.cn/', description: '必应每日壁纸精选' },
                            { title: 'Wallroom.io', url: 'https://wallroom.io/', description: 'HD/4K/5K高清壁纸' },
                            { title: 'WallpaperUP', url: 'https://www.wallpaperup.com/', description: '热门壁纸集合' },
                            { title: '电脑壁纸', url: 'http://lab.mkblog.cn/wallpaper/', description: '精选电脑壁纸' }
                        ]
                    },
                    {
                        name: '图片素材',
                        icon: 'fas fa-photo-video',
                        items: [
                            { title: 'Hippopx', url: 'https://www.hippopx.com/', description: '免费高分辨率照片' },
                            { title: 'Gratisography', url: 'https://gratisography.com/', description: '艺术家免费照片' },
                            { title: 'Visual Hunt', url: 'https://visualhunt.com/', description: '全图片资源' },
                            { title: 'Magdeleine', url: 'https://magdeleine.co/browse/', description: '按颜色分类图片' },
                            { title: 'Pexels', url: 'https://www.pexels.com/', description: '免费图片视频素材' },
                            { title: 'Pixabay', url: 'https://pixabay.com/videos/', description: '图片、矢量图、插图、视频' }
                        ]
                    },
                    {
                        name: '软件下载',
                        icon: 'fas fa-download',
                        items: [
                            { title: 'PC6下载站', url: 'http://www.pc6.com/', description: '软件下载站' },
                            { title: '小众软件', url: 'https://www.appinn.com/', description: '分享免费、小巧、实用的软件' }
                        ]
                    }
                ]
            },
            {
                category: '学习资源',
                subcategories: [
                    {
                        name: '书籍资源',
                        icon: 'fas fa-book',
                        items: [
                            { title: 'Geocomputation with Python', url: 'https://py.geocompx.org/', description: 'Python地理计算教程' },
                            { title: 'Spatial Data Science', url: 'https://r-spatial.org/book/', description: '空间数据科学' },
                            { title: 'ggplot2教程', url: 'https://ggplot2-book.org/', description: 'R语言数据可视化' },
                            { title: 'R Graphics Cookbook', url: 'https://r-graphics.org/', description: 'R语言图形手册' }
                        ]
                    },
                    {
                        name: 'R语言资料',
                        icon: 'fab fa-r-project',
                        items: [
                            { title: 'R语言教程', url: 'https://www.math.pku.edu.cn/teachers/lidf/docs/Rbook/html/_Rbook/index.html', description: '北大R语言教程' },
                            { title: 'Cookbook for R', url: 'https://openbiox.github.io/Cookbook-for-R-Chinese/', description: 'R语言实用手册中文版' },
                            { title: 'R官方介绍', url: 'https://cran.r-project.org/doc/manuals/R-intro.html', description: 'R语言官方入门' },
                            { title: 'Efficient R programming', url: 'https://bookdown.org/csgillespie/efficientR/', description: '高效R编程' }
                        ]
                    },
                    {
                        name: '深度学习',
                        icon: 'fas fa-brain',
                        items: [
                            { title: '动手学深度学习', url: 'https://zh.d2l.ai/index.html', description: '深度学习入门教程' },
                            { title: 'Neural Networks from Scratch', url: 'https://aegeorge42.github.io/', description: '神经网络交互式指南' }
                        ]
                    },
                    {
                        name: '在线网课',
                        icon: 'fas fa-graduation-cap',
                        items: [
                            { title: '中国大学MOOC', url: 'https://www.icourse163.org/', description: '国家精品课程在线学习' },
                            { title: '学堂在线', url: 'https://next.xuetangx.com/', description: '清华大学在线教育平台' },
                            { title: '网易公开课', url: 'https://open.163.com/', description: '免费在线课程' }
                        ]
                    }
                ]
            },
            {
                category: '数据资源',
                subcategories: [
                    {
                        name: '气象数据',
                        icon: 'fas fa-cloud-sun',
                        items: [
                            { title: 'Open-Meteo', url: 'https://open-meteo.com/', description: '免费开源天气API' },
                            { title: '世界天气', url: 'https://rp5.ru/世界天气_', description: '239个国家的天气' }
                        ]
                    },
                    {
                        name: '统计数据',
                        icon: 'fas fa-chart-bar',
                        items: [
                            { title: '国家数据', url: 'https://data.stats.gov.cn/', description: '国家统计局数据' },
                            { title: 'FAOSTAT', url: 'https://www.fao.org/faostat/en/#data/QCL', description: 'FAO农业统计数据' }
                        ]
                    },
                    {
                        name: '农业科学数据',
                        icon: 'fas fa-seedling',
                        items: [
                            { title: '国家农业科学数据中心', url: 'https://www.agridata.cn/#/home', description: '农业大数据平台' },
                            { title: '国家苹果大数据', url: 'https://appledata-channel.agri.cn/', description: '苹果产业数据' }
                        ]
                    },
                    {
                        name: '数据查找',
                        icon: 'fas fa-search',
                        items: [
                            { title: 'Dataset Search', url: 'https://datasetsearch.research.google.com/', description: 'Google数据集搜索' },
                            { title: 'Kaggle', url: 'https://www.kaggle.com/', description: '机器学习数据平台' }
                        ]
                    }
                ]
            },
            {
                category: '遥感与GIS',
                subcategories: [
                    {
                        name: '遥感平台',
                        icon: 'fas fa-satellite',
                        items: [
                            { title: 'Google Earth Engine', url: 'https://earthengine.google.com/', description: '云端遥感数据处理平台' },
                            { title: 'EarthExplorer', url: 'https://earthexplorer.usgs.gov/', description: 'USGS地球数据浏览器' },
                            { title: '地理空间数据云', url: 'http://www.gscloud.cn/', description: '中科院遥感数据共享' }
                        ]
                    },
                    {
                        name: 'GEE学习',
                        icon: 'fas fa-graduation-cap',
                        items: [
                            { title: 'GEE教学视频', url: 'https://www.bilibili.com/video/av48083555', description: 'B站GEE教程' },
                            { title: '零基础学习GEE', url: 'https://zhuanlan.zhihu.com/c_1137998284927893504', description: '知乎GEE专栏' },
                            { title: 'Geemap教程', url: 'https://book.geemap.org/index.html', description: 'Python GEE教程' }
                        ]
                    }
                ]
            },
            {
                category: '科研工具',
                subcategories: [
                    {
                        name: 'AI工具',
                        icon: 'fas fa-robot',
                        items: [
                            { title: 'ChatGPT', url: 'https://chat.openai.com/', description: 'OpenAI聊天机器人' },
                            { title: 'Kimi', url: 'https://kimi.moonshot.cn/', description: '月之暗面AI助手' },
                            { title: '通义千问', url: 'https://tongyi.aliyun.com/qianwen', description: '阿里巴巴AI助手' },
                            { title: '豆包', url: 'https://www.doubao.com/chat/', description: '字节跳动AI助手' }
                        ]
                    },
                    {
                        name: '科研绘图',
                        icon: 'fas fa-chart-line',
                        items: [
                            { title: 'ColorBrewer', url: 'https://colorbrewer2.org/', description: '地图配色方案' },
                            { title: 'ColorSpace', url: 'https://mycolor.space/', description: '颜色搭配生成器' },
                            { title: 'Matplotlib教程', url: 'https://www.machinelearningplus.com/plots/top-50-matplotlib-visualizations-the-master-plots-python/', description: '50个matplotlib可视化案例' }
                        ]
                    },
                    {
                        name: '论文写作',
                        icon: 'fas fa-edit',
                        items: [
                            { title: 'Overleaf', url: 'https://www.overleaf.com/', description: 'LaTeX在线编辑器' },
                            { title: 'Slager', url: 'https://www.slager.link/', description: 'LaTeX在线编辑器' }
                        ]
                    },
                    {
                        name: '期刊投稿',
                        icon: 'fas fa-paper-plane',
                        items: [
                            { title: 'LetPub期刊查询', url: 'https://www.letpub.com.cn/index.php?page=journalapp', description: 'SCI期刊投稿分析' },
                            { title: 'Elsevier期刊推荐', url: 'https://journalfinder.elsevier.com/', description: 'Elsevier期刊匹配' },
                            { title: 'Wiley期刊推荐', url: 'https://journalfinder.wiley.com/', description: 'Wiley期刊匹配' }
                        ]
                    }
                ]
            },
            {
                category: '期刊数据库',
                subcategories: [
                    {
                        name: '遥感算法期刊',
                        icon: 'fas fa-satellite-dish',
                        items: [
                            { title: 'IEEE TGRS', url: 'https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=36', description: '遥感顶级期刊' },
                            { title: 'IEEE JSTAR', url: 'https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=4609443', description: '应用遥感期刊' },
                            { title: 'IEEE GRSL', url: 'https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=8859', description: '遥感快报' }
                        ]
                    },
                    {
                        name: '农业期刊',
                        icon: 'fas fa-tractor',
                        items: [
                            { title: 'Agricultural Systems', url: 'https://www.journals.elsevier.com/agricultural-systems', description: '农业系统一区期刊' },
                            { title: 'Field Crops Research', url: 'https://www.journals.elsevier.com/field-crops-research/', description: '作物研究一区期刊' },
                            { title: 'Agricultural Water Management', url: 'https://www.sciencedirect.com/journal/agricultural-water-management', description: '农业水管理一区期刊' }
                        ]
                    },
                    {
                        name: '环境生态期刊',
                        icon: 'fas fa-leaf',
                        items: [
                            { title: 'Global Change Biology', url: 'https://onlinelibrary.wiley.com/journal/13652486', description: '全球变化生物学' },
                            { title: 'Environmental Research Letters', url: 'https://iopscience.iop.org/journal/1748-9326', description: '环境研究快报' },
                            { title: 'Journal of Cleaner Production', url: 'https://www.journals.elsevier.com/journal-of-cleaner-production/', description: '清洁生产期刊' }
                        ]
                    }
                ]
            },
            {
                category: '模型工具',
                subcategories: [
                    {
                        name: '作物模型',
                        icon: 'fas fa-seedling',
                        items: [
                            { title: 'WOFOST模型', url: 'https://www.fao.org/land-water/land/land-governance/land-resources-planning-toolbox/category/details/es/c/1236431/', description: 'FAO作物生长模拟模型' },
                            { title: 'APSIM模型', url: 'https://www.apsim.info/', description: '农业生产系统模拟器' },
                            { title: 'PCSE文档', url: 'https://pcse.readthedocs.io/en/stable/', description: 'Python作物模拟环境' }
                        ]
                    },
                    {
                        name: '气象模型',
                        icon: 'fas fa-cloud',
                        items: [
                            { title: 'WRF模型', url: 'https://www.mmm.ucar.edu/models/wrf', description: '天气研究与预报模型' }
                        ]
                    }
                ]
            },
            {
                category: '学校资源',
                subcategories: [
                    {
                        name: 'NWAFU',
                        icon: 'fas fa-university',
                        items: [
                            { title: '西北农林科技大学', url: 'https://www.nwafu.edu.cn/', description: '学校官网' },
                            { title: '研究生院', url: 'https://yjshy.nwsuaf.edu.cn/', description: '研究生院官网' },
                            { title: 'VPN服务', url: 'https://vpn.nwafu.edu.cn/', description: '学校VPN' },
                            { title: '网络认证', url: 'https://portal.nwafu.edu.cn/', description: '校园网认证' }
                        ]
                    }
                ]
            }
        ];
    }

    setupEventListeners() {
        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            // When user types, clear category selection for global search
            if (this.searchTerm) {
                if (this.currentCategory) {
                    this.currentCategory = null;
                    document.querySelectorAll('.nav-item.active').forEach(item => {
                        item.classList.remove('active');
                    });
                }
            }
            this.filterBookmarks();
        });

        // 主题切换
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // 云同步设置
        const syncSettingsBtn = document.getElementById('syncSettingsBtn');
        if (syncSettingsBtn) {
            console.log('找到云同步按钮，添加事件监听器');
            syncSettingsBtn.addEventListener('click', () => {
                console.log('云同步按钮被点击，gistId:', this.gistId, 'gistPat:', !!this.gistPat);
                // 始终显示设置对话框，允许用户修改或查看设置
                this.showSyncSettingsModal();
            });
        } else {
            console.error('未找到云同步按钮元素！');
        }

        // 侧边栏切换（移动端）
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // 管理模式切换
        const manageToggle = document.getElementById('manageToggle');
        manageToggle.addEventListener('click', () => {
            this.toggleManageMode();
        });

        // 视图切换
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                viewButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.view;
                this.renderBookmarks();
            });
        });

        // 点击主内容区域关闭侧边栏（移动端）
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                const sidebarToggle = document.getElementById('sidebarToggle');
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }

    renderNavTree() {
        const navTree = document.getElementById('navTree');
        navTree.innerHTML = '';

        this.bookmarks.forEach((category, index) => {
            const categoryElement = this.createNavItem(category, index);
            navTree.appendChild(categoryElement);
        });
    }

    createNavItem(category, categoryIndex) {
        const totalItems = category.subcategories.reduce((sum, sub) => sum + sub.items.length, 0);

        const navItem = document.createElement('div');
        navItem.className = 'nav-item';
        navItem.setAttribute('data-category-index', categoryIndex);
        navItem.innerHTML = `
            <a href="#" class="nav-link" data-category="${categoryIndex}">
                <i class="nav-icon fas fa-folder"></i>
                <span class="nav-text">${category.category}</span>
                <span class="nav-count">${totalItems}</span>
                <button class="nav-toggle">
                    <i class="fas fa-chevron-right"></i>
                </button>
                ${this.isManageMode ? `<button class="nav-manage-btn" data-type="category" data-category="${categoryIndex}"><i class="fas fa-ellipsis-v"></i></button>` : ''}
            </a>
            <div class="nav-submenu">
                ${category.subcategories.map((sub, subIndex) => `
                    <div class="nav-item">
                        <a href="#" class="nav-link" data-category="${categoryIndex}" data-subcategory="${subIndex}">
                            <i class="nav-icon ${sub.icon}"></i>
                            <span class="nav-text">${sub.name}</span>
                            <span class="nav-count">${sub.items.length}</span>
                            ${this.isManageMode ? `<button class="nav-manage-btn" data-type="subcategory" data-category="${categoryIndex}" data-subcategory="${subIndex}"><i class="fas fa-ellipsis-v"></i></button>` : ''}
                        </a>
                    </div>
                `).join('')}
            </div>
        `;

        // 添加点击事件
        const mainLink = navItem.querySelector('a.nav-link[data-category]:not([data-subcategory])');
        const toggleBtn = navItem.querySelector('.nav-toggle');
        const submenu = navItem.querySelector('.nav-submenu');

        // 主分类点击事件
        mainLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.closest('.nav-toggle')) return;

            const categoryIndex = parseInt(mainLink.getAttribute('data-category'));

            // 如果点击的是主分类，切换展开/收起状态
            if (!navItem.classList.contains('expanded')) {
                // 先关闭其他展开的分类
                document.querySelectorAll('.nav-item.expanded').forEach(item => {
                    if (item !== navItem) {
                        item.classList.remove('expanded');
                    }
                });
                navItem.classList.add('expanded');
            }

            // 显示该分类下的所有内容
            this.selectCategory(categoryIndex, null);
        });

        // 展开/收起按钮点击事件
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                navItem.classList.toggle('expanded');
            });
        }

        // 子分类点击事件
        const subLinks = navItem.querySelectorAll('.nav-submenu .nav-link');
        subLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryIndex = parseInt(link.getAttribute('data-category'));
                const subcategoryIndex = parseInt(link.getAttribute('data-subcategory'));
                this.selectCategory(categoryIndex, subcategoryIndex);
            });
        });

        // 管理按钮事件
        const manageButtons = navItem.querySelectorAll('.nav-manage-btn');
        manageButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const type = btn.dataset.type;
                const categoryIndex = parseInt(btn.dataset.category);
                const subcategoryIndex = btn.dataset.subcategory ? parseInt(btn.dataset.subcategory) : null;

                const rect = btn.getBoundingClientRect();
                this.contextMenu.show(rect.right, rect.top, btn, type, categoryIndex, subcategoryIndex);
            });
        });

        return navItem;
    }

    selectCategory(categoryIndex, subcategoryIndex = null) {
        // Clear search term when selecting a category
        if (this.searchTerm) {
            this.searchTerm = '';
            document.getElementById('searchInput').value = '';
        }

        // 清除之前的选中状态
        document.querySelectorAll('.nav-item.active').forEach(item => {
            item.classList.remove('active');
        });

        // 设置当前选中状态
        const allCategoryElements = document.querySelectorAll('.nav-item');
        let categoryElement = null;

        // 找到对应的主分类元素（不包括子分类元素）
        let currentIndex = 0;
        for (let element of allCategoryElements) {
            if (!element.closest('.nav-submenu')) { // 只计算主分类
                if (currentIndex === categoryIndex) {
                    categoryElement = element;
                    break;
                }
                currentIndex++;
            }
        }

        if (categoryElement) {
            if (subcategoryIndex !== null) {
                // 选择了子分类
                const subElements = categoryElement.querySelectorAll('.nav-submenu .nav-item');
                if (subElements[subcategoryIndex]) {
                    subElements[subcategoryIndex].classList.add('active');
                    categoryElement.classList.add('expanded');
                }
            } else {
                // 选择了主分类
                categoryElement.classList.add('active');
                categoryElement.classList.add('expanded');
            }
        }

        this.currentCategory = { categoryIndex, subcategoryIndex };
        this.filterBookmarks();
    }

    filterBookmarks() {
        this.filteredBookmarks = [];
        const processItems = (items, categoryIndex, subcategoryIndex) => {
            // 先添加位置信息，保持原始索引
            const itemsWithLocation = items.map((item, itemIndex) => ({
                ...item,
                __location: { categoryIndex, subcategoryIndex, itemIndex }
            }));

            if (!this.searchTerm) {
                return itemsWithLocation;
            }

            // 过滤时保持原始索引不变
            return itemsWithLocation.filter(item =>
                item.title.toLowerCase().includes(this.searchTerm) ||
                (item.description && item.description.toLowerCase().includes(this.searchTerm)) ||
                item.url.toLowerCase().includes(this.searchTerm)
            );
        };

        if (this.searchTerm) { // Global Search is active
            this.bookmarks.forEach((category, catIdx) => {
                category.subcategories.forEach((sub, subIdx) => {
                    if (sub.items) {
                        this.filteredBookmarks.push(...processItems(sub.items, catIdx, subIdx));
                    }
                });
            });
            document.getElementById('currentCategory').textContent = `搜索结果: "${this.searchTerm}"`;
        } else if (this.currentCategory) { // No search, category is selected
            const { categoryIndex, subcategoryIndex } = this.currentCategory;
            const category = this.bookmarks[categoryIndex];
            if (!category) {
                console.warn('分类不存在:', categoryIndex);
                this.renderBookmarks();
                return;
            }

            if (subcategoryIndex !== null) {
                const subcategory = category.subcategories[subcategoryIndex];
                if (subcategory && subcategory.items) {
                    this.filteredBookmarks = processItems(subcategory.items, categoryIndex, subcategoryIndex);
                }
                document.getElementById('currentCategory').textContent = `${category.category} > ${subcategory.name}`;
            } else {
                category.subcategories.forEach((sub, subIdx) => {
                    if (sub.items) {
                        this.filteredBookmarks.push(...processItems(sub.items, categoryIndex, subIdx));
                    }
                });
                document.getElementById('currentCategory').textContent = category.category;
            }
        } else {
            // No search, no category -> Welcome screen
            this.filteredBookmarks = []; // Ensure welcome screen shows
            document.getElementById('currentCategory').textContent = '欢迎使用 AgricultureModeling 导航';
        }

        this.renderBookmarks();
    }

    renderBookmarks() {
        const container = document.getElementById('bookmarksContainer');

        if (this.filteredBookmarks.length === 0) {
            if (this.currentCategory) {
                const { categoryIndex, subcategoryIndex } = this.currentCategory;
                const category = this.bookmarks[categoryIndex];

                if (subcategoryIndex !== null) {
                    // 选择了子分类但没有内容
                    const subcategory = category?.subcategories?.[subcategoryIndex];
                    container.innerHTML = `
                        <div class="welcome-message">
                            <i class="fas fa-folder-open"></i>
                            <h3>${subcategory?.name || '该分类'} 暂无内容</h3>
                            <p>该分类下目前还没有添加任何书签。</p>
                        </div>
                    `;
                } else {
                    // 选择了主分类但没有内容
                    container.innerHTML = `
                        <div class="welcome-message">
                            <i class="fas fa-folder-open"></i>
                            <h3>${category?.category || '该分类'} 暂无内容</h3>
                            <p>该分类下的所有子分类目前都没有书签。</p>
                        </div>
                    `;
                }
            } else if (this.searchTerm) {
                container.innerHTML = `
                    <div class="welcome-message">
                        <i class="fas fa-search"></i>
                        <h3>未找到相关内容</h3>
                        <p>没有找到包含 "<strong>${this.searchTerm}</strong>" 的书签，请尝试其他关键词。</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="welcome-message">
                        <i class="fas fa-leaf"></i>
                        <h3>欢迎来到农业建模导航网站</h3>
                        <p>请从左侧选择分类来浏览相关书签，或使用搜索功能快速查找。</p>
                    </div>
                `;
            }
            return;
        }

        const containerClass = this.currentView === 'grid' ? 'bookmarks-grid' : 'bookmarks-list';
        container.innerHTML = `<div class="${containerClass}"></div>`;
        const bookmarksWrapper = container.firstElementChild;

        this.filteredBookmarks.forEach((bookmark, index) => {
            const bookmarkElement = this.createBookmarkCard(bookmark, index);
            bookmarksWrapper.appendChild(bookmarkElement);
        });
    }

    createBookmarkCard(bookmark, index) {
        const card = document.createElement('div');
        card.className = 'bookmark-card';
        card.style.animationDelay = `${index * 0.1}s`;

        const faviconUrl = this.getFaviconUrl(bookmark.url);
        const highlightedTitle = this.highlightSearchTerm(bookmark.title);
        const highlightedDescription = this.highlightSearchTerm(bookmark.description || '');

        card.innerHTML = `
            <div class="bookmark-header">
                <div class="bookmark-icon">
                    <img src="${faviconUrl}" alt="icon" onerror="this.parentElement.innerHTML='<i class=\\"fas fa-link\\"></i>'">
                </div>
                <div class="bookmark-content">
                    <h3 class="bookmark-title">${highlightedTitle}</h3>
                    ${this.isManageMode ? '<div class="drag-handle"><i class="fas fa-grip-vertical"></i></div>' : ''}
                </div>
            </div>
            ${highlightedDescription ? `<div class="bookmark-description">${highlightedDescription}</div>` : ''}
            <div class="bookmark-url">${bookmark.url}</div>
            ${this.isManageMode ? `<button class="bookmark-manage-btn" data-type="bookmark" data-index="${index}"><i class="fas fa-ellipsis-v"></i></button>` : ''}
        `;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.bookmark-manage-btn, .drag-handle')) {
                return;
            }
            window.open(bookmark.url, '_blank');
        });

        // 添加管理按钮事件
        if (this.isManageMode) {
            const manageBtn = card.querySelector('.bookmark-manage-btn');
            if (manageBtn) {
                manageBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const rect = manageBtn.getBoundingClientRect();
                    const { categoryIndex, subcategoryIndex, itemIndex } = bookmark.__location;

                    this.contextMenu.show(rect.left, rect.bottom, manageBtn, 'bookmark',
                        categoryIndex, subcategoryIndex, itemIndex);
                });
            }

            // 添加拖拽事件处理
            if (this.dragManager) {
                this.dragManager.makeDraggable(card);
            }
        }

        return card;
    }

    getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch {
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDZINkM0Ljg5IDYgNCA2Ljg5IDQgOFYxOEM0IDE5LjExIDQuODkgMjAgNiAyMEgxNkMxNy4xMSAyMCAxOCAxOS4xMSAxOCAxOFYxNEgxNlYxOEg2VjhIMTBWNloiIGZpbGw9IiM5RTlFOUUiLz4KPHBhdGggZD0iTTE0IDZIMTBWOEgxNFY2WiIgZmlsbD0iIzlFOUU5RSIvPgo8L3N2Zz4K';
        }
    }

    highlightSearchTerm(text) {
        if (!this.searchTerm || !text) return text;

        const regex = new RegExp(`(${this.searchTerm})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    updateStats() {
        const totalBookmarks = this.bookmarks.reduce((sum, category) =>
            sum + category.subcategories.reduce((subSum, sub) => subSum + sub.items.length, 0), 0
        );
        document.getElementById('totalBookmarks').textContent = `总计: ${totalBookmarks}`;
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
        }, 500);
    }

    // ==================== 管理功能 ====================

    initializeManagementFeatures() {
        this.modalManager = new ModalManager();
        this.contextMenu = new ContextMenuManager(this);
        this.setupManagementEventListeners();
    }

    setupManagementEventListeners() {
        // 添加主分类按钮
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.showAddCategoryModal();
            });
        }

        // 添加书签按钮
        const addBookmarkBtn = document.getElementById('addBookmarkBtn');
        if (addBookmarkBtn) {
            addBookmarkBtn.addEventListener('click', () => {
                this.showAddBookmarkModal();
            });
        }

        // 导入按钮
        const importBtn = document.getElementById('importBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.showImportModal();
            });
        }

        // 导出按钮
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
    }

    toggleManageMode() {
        this.isManageMode = !this.isManageMode;
        const manageToggle = document.getElementById('manageToggle');
        const manageControls = document.getElementById('manageControls');
        const contentManageControls = document.getElementById('contentManageControls');
        const body = document.body;

        if (this.isManageMode) {
            manageToggle.classList.add('active');
            manageControls.style.display = 'block';
            contentManageControls.style.display = 'block';
            body.classList.add('manage-mode');
        } else {
            manageToggle.classList.remove('active');
            manageControls.style.display = 'none';
            contentManageControls.style.display = 'none';
            body.classList.remove('manage-mode');
        }

        // 重新渲染以显示/隐藏管理按钮
        this.renderNavTree();
        this.filterBookmarks();
    }

    syncData() {
        // 静默同步，不显示提示框
        this.saveData();
    }

    showSyncSettingsModal() {
        console.log('showSyncSettingsModal 被调用');
        const lastSyncDate = this.lastSync ? new Date(this.lastSync).toLocaleString() : '从未';
        const modalContent = `
            <div class="form-group">
                <label for="gistId">GitHub Gist ID</label>
                <input type="text" id="gistId" value="${this.gistId || ''}" placeholder="输入你的 Gist ID">
            </div>
            <div class="form-group">
                <label for="gistPat">GitHub Personal Access Token (PAT)</label>
                <input type="password" id="gistPat" value="${this.gistPat || ''}" placeholder="输入你的 PAT">
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">令牌将仅保存在你的浏览器本地存储中。</p>
            </div>
            <hr>
            <div style="font-size: 0.9rem; color: var(--text-secondary);">
                <p>上次同步时间: <span id="lastSyncTime">${lastSyncDate}</span></p>
            </div>
        `;

        console.log('modalManager存在:', !!this.modalManager);
        if (!this.modalManager) {
            console.error('modalManager未初始化！');
            return;
        }

        this.modalManager.show('云同步设置', modalContent, () => {
            const gistId = document.getElementById('gistId').value.trim();
            const gistPat = document.getElementById('gistPat').value.trim();

            if (!gistId || !gistPat) {
                alert('请同时提供 Gist ID 和 Personal Access Token。');
                return false;
            }

            this.gistId = gistId;
            this.gistPat = gistPat;

            localStorage.setItem('agri_gist_id', this.gistId);
            localStorage.setItem('agri_gist_pat', this.gistPat);

            // 静默处理设置保存，不显示提示框
            // Trigger a sync and reload
            this.loadData().then(data => {
                this.bookmarks = data;
                this.renderNavTree();
                this.filterBookmarks();
                this.updateStats();
                document.getElementById('lastSyncTime').textContent = new Date().toLocaleString();
            }).catch(error => {
                console.error('同步数据时出错:', error);
                this.showToast('同步数据失败，请检查网络连接', true);
            });

            return true;
        });
    }

    showAddCategoryModal() {
        const modalContent = `
            <div class="form-group">
                <label for="categoryName">分类名称</label>
                <input type="text" id="categoryName" placeholder="请输入分类名称" required>
            </div>
            <div class="form-group">
                <label for="categoryIcon">选择图标</label>
                <div class="icon-selector" id="categoryIconSelector">
                    ${this.generateIconOptions()}
                </div>
                <input type="hidden" id="selectedIcon" value="fas fa-folder">
            </div>
        `;

        this.modalManager.show('添加主分类', modalContent, () => {
            const name = document.getElementById('categoryName').value.trim();
            const icon = document.getElementById('selectedIcon').value;

            if (!name) {
                alert('请输入分类名称');
                return false;
            }

            this.addCategory(name, icon);
            return true;
        });

        // 设置图标选择器
        this.setupIconSelector();
    }

    showAddSubcategoryModal(categoryIndex) {
        const category = this.bookmarks[categoryIndex];
        const modalContent = `
            <div class="form-group">
                <label>所属主分类</label>
                <input type="text" value="${category.category}" readonly style="background: var(--bg-secondary);">
            </div>
            <div class="form-group">
                <label for="subcategoryName">子分类名称</label>
                <input type="text" id="subcategoryName" placeholder="请输入子分类名称" required>
            </div>
            <div class="form-group">
                <label for="subcategoryIcon">选择图标</label>
                <div class="icon-selector" id="subcategoryIconSelector">
                    ${this.generateIconOptions()}
                </div>
                <input type="hidden" id="selectedIcon" value="fas fa-folder-open">
            </div>
        `;

        this.modalManager.show('添加子分类', modalContent, () => {
            const name = document.getElementById('subcategoryName').value.trim();
            const icon = document.getElementById('selectedIcon').value;

            if (!name) {
                alert('请输入子分类名称');
                return false;
            }

            this.addSubcategory(categoryIndex, name, icon);
            return true;
        });

        this.setupIconSelector();
    }

    showAddBookmarkModal() {
        // Determine initial state
        const initialCatIndex = this.currentCategory ? this.currentCategory.categoryIndex : null;
        const initialSubIndex = this.currentCategory ? this.currentCategory.subcategoryIndex : null;

        let categoryOptions = this.bookmarks.map((cat, idx) => `<option value="${idx}">${cat.category}</option>`).join('');
        if (initialCatIndex !== null) {
            categoryOptions = this.bookmarks.map((cat, idx) => `<option value="${idx}" ${idx === initialCatIndex ? 'selected' : ''}>${cat.category}</option>`).join('');
        }

        let subcategoryOptions = '<option value="">请先选择主分类</option>';
        if (initialCatIndex !== null) {
            const subcatOpts = this.bookmarks[initialCatIndex].subcategories.map((sub, idx) => `<option value="${idx}">${sub.name}</option>`);
            if (initialSubIndex !== null) {
                subcatOpts[initialSubIndex] = `<option value="${initialSubIndex}" selected>${this.bookmarks[initialCatIndex].subcategories[initialSubIndex].name}</option>`;
            }
            subcategoryOptions = subcatOpts.join('');
        }

        const modalContent = `
            <div class="form-group">
                <label for="targetCategory">主分类</label>
                <select id="targetCategory" required>
                    ${initialCatIndex === null ? '<option value="">请选择主分类</option>' : ''}
                    ${categoryOptions}
                    <option value="new">+ 创建新主分类</option>
                </select>
            </div>
            <div class="form-group" id="newCategoryGroup" style="display: none;">
                <label for="newCategoryName">新主分类名称</label>
                <input type="text" id="newCategoryName" placeholder="请输入新主分类名称">
            </div>
            <div class="form-group">
                <label for="targetSubcategory">子分类</label>
                <select id="targetSubcategory" required>
                    ${subcategoryOptions}
                    <option value="new">+ 创建新子分类</option>
                </select>
            </div>
            <div class="form-group" id="newSubcategoryGroup" style="display: none;">
                <label for="newSubcategoryName">新子分类名称</label>
                <input type="text" id="newSubcategoryName" placeholder="请输入新子分类名称">
                <div style="margin-top: 0.5rem;">
                    <label>选择图标</label>
                    <div class="icon-selector" id="newSubcategoryIconSelector">${this.generateIconOptions()}</div>
                    <input type="hidden" id="newSelectedIcon" value="fas fa-folder-open">
                </div>
            </div>
            <hr>
            <div class="form-group">
                <label for="bookmarkTitle">书签标题</label>
                <input type="text" id="bookmarkTitle" placeholder="请输入书签标题" required>
            </div>
            <div class="form-group">
                <label for="bookmarkUrl">网址</label>
                <input type="url" id="bookmarkUrl" placeholder="https://" required>
            </div>
            <div class="form-group">
                <label for="bookmarkDescription">描述（可选）</label>
                <textarea id="bookmarkDescription" placeholder="请输入书签描述"></textarea>
            </div>
        `;

        this.modalManager.show('添加书签', modalContent, () => {
            let catIndexValue = document.getElementById('targetCategory').value;
            let subIndexValue = document.getElementById('targetSubcategory').value;

            if (catIndexValue === 'new') {
                const newCatName = document.getElementById('newCategoryName').value.trim();
                if (!newCatName) { alert('请输入新主分类名称'); return false; }
                this.addCategory(newCatName, 'fas fa-folder');
                catIndexValue = this.bookmarks.length - 1;
            }

            let catIndex = parseInt(catIndexValue);

            if (subIndexValue === 'new') {
                const newSubName = document.getElementById('newSubcategoryName').value.trim();
                const newSubIcon = document.getElementById('newSelectedIcon').value;
                if (!newSubName) { alert('请输入新子分类名称'); return false; }
                this.addSubcategory(catIndex, newSubName, newSubIcon);
                subIndexValue = this.bookmarks[catIndex].subcategories.length - 1;
            }

            let subIndex = parseInt(subIndexValue);

            if (isNaN(catIndex) || isNaN(subIndex)) {
                alert('请选择一个有效的分类和子分类');
                return false;
            }

            const title = document.getElementById('bookmarkTitle').value.trim();
            const url = document.getElementById('bookmarkUrl').value.trim();
            const description = document.getElementById('bookmarkDescription').value.trim();

            if (!title || !url) { alert('请填写标题和网址'); return false; }

            this.addBookmark(catIndex, subIndex, { title, url, description });
            return true;
        });

        setTimeout(() => {
            const catSelect = document.getElementById('targetCategory');
            const subSelect = document.getElementById('targetSubcategory');
            const newCatGroup = document.getElementById('newCategoryGroup');
            const newSubGroup = document.getElementById('newSubcategoryGroup');

            const updateSubcategories = () => {
                const selectedCatIndex = catSelect.value;
                newSubGroup.style.display = 'none';
                if (selectedCatIndex === 'new' || selectedCatIndex === '') {
                    newCatGroup.style.display = selectedCatIndex === 'new' ? 'block' : 'none';
                    subSelect.innerHTML = '<option value="">请先选择主分类</option><option value="new">+ 创建新子分类</option>';
                    if(selectedCatIndex === 'new') {
                        subSelect.value = 'new';
                        subSelect.dispatchEvent(new Event('change'));
                    }
                } else {
                    newCatGroup.style.display = 'none';
                    const newSubOptions = this.bookmarks[selectedCatIndex].subcategories.map((sub, idx) => `<option value="${idx}">${sub.name}</option>`).join('');
                    subSelect.innerHTML = newSubOptions + '<option value="new">+ 创建新子分类</option>';
                }
            };

            catSelect.addEventListener('change', updateSubcategories);
            subSelect.addEventListener('change', () => {
                if (subSelect.value === 'new') {
                    newSubGroup.style.display = 'block';
                    this.setupIconSelector('newSubcategoryIconSelector', 'newSelectedIcon');
                } else {
                    newSubGroup.style.display = 'none';
                }
            });

            if (initialCatIndex === null) updateSubcategories();
            if (subSelect.value === 'new') subSelect.dispatchEvent(new Event('change'));
        }, 100);
    }

    generateIconOptions() {
        const icons = [
            'fas fa-folder', 'fas fa-folder-open', 'fas fa-file', 'fas fa-bookmark',
            'fas fa-star', 'fas fa-heart', 'fas fa-tag', 'fas fa-tags',
            'fas fa-image', 'fas fa-photo-video', 'fas fa-film', 'fas fa-music',
            'fas fa-video', 'fas fa-headphones', 'fas fa-microphone', 'fas fa-camera',
            'fas fa-book', 'fas fa-graduation-cap', 'fas fa-university', 'fas fa-school',
            'fas fa-pencil-alt', 'fas fa-pen', 'fas fa-edit', 'fas fa-newspaper',
            'fas fa-seedling', 'fas fa-leaf', 'fas fa-tree', 'fas fa-apple-alt',
            'fas fa-tractor', 'fas fa-industry', 'fas fa-cog', 'fas fa-cogs',
            'fas fa-chart-bar', 'fas fa-chart-line', 'fas fa-chart-pie', 'fas fa-analytics',
            'fas fa-database', 'fas fa-server', 'fas fa-cloud', 'fas fa-globe',
            'fas fa-satellite', 'fas fa-satellite-dish', 'fas fa-microscope', 'fas fa-flask',
            'fas fa-atom', 'fas fa-dna', 'fas fa-brain', 'fas fa-robot',
            'fas fa-code', 'fas fa-terminal', 'fas fa-laptop-code', 'fas fa-mobile-alt',
            'fas fa-palette', 'fas fa-paint-brush', 'fas fa-drafting-compass', 'fas fa-ruler',
            'fas fa-calculator', 'fas fa-balance-scale', 'fas fa-weight', 'fas fa-thermometer',
            'fas fa-search', 'fas fa-filter', 'fas fa-sort', 'fas fa-list',
            'fas fa-th', 'fas fa-th-large', 'fas fa-th-list', 'fas fa-bars',
            'fas fa-link', 'fas fa-external-link-alt', 'fas fa-download', 'fas fa-upload',
            'fas fa-share', 'fas fa-share-alt', 'fas fa-copy', 'fas fa-cut',
            'fas fa-paste', 'fas fa-save', 'fas fa-print', 'fas fa-fax',
            'fas fa-envelope', 'fas fa-inbox', 'fas fa-paper-plane', 'fas fa-comment',
            'fas fa-comments', 'fas fa-phone', 'fas fa-mobile', 'fas fa-fax',
            'fas fa-home', 'fas fa-building', 'fas fa-city', 'fas fa-map',
            'fas fa-map-marker-alt', 'fas fa-compass', 'fas fa-route', 'fas fa-car'
        ];

        return icons.map(icon => `
            <div class="icon-option" data-icon="${icon}" title="${icon}">
                <i class="${icon}"></i>
            </div>
        `).join('');
    }

    setupIconSelector(selectorId = null, inputId = null) {
        const containerId = selectorId || 'categoryIconSelector,subcategoryIconSelector';
        const hiddenInputId = inputId || 'selectedIcon';

        // 支持多个选择器容器
        const containers = selectorId ?
            [document.getElementById(selectorId)] :
            document.querySelectorAll('.icon-selector');

        containers.forEach(container => {
            if (!container) return;

            const iconOptions = container.querySelectorAll('.icon-option');
            const selectedIconInput = document.getElementById(hiddenInputId);

            if (!selectedIconInput) return;

            // 设置默认选中
            const defaultIcon = selectedIconInput.value;
            const defaultOption = container.querySelector(`.icon-option[data-icon="${defaultIcon}"]`);
            if (defaultOption) {
                defaultOption.classList.add('selected');
            }

            iconOptions.forEach(option => {
                option.addEventListener('click', () => {
                    // 只在当前容器内清除选中状态
                    container.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    selectedIconInput.value = option.dataset.icon;
                });
            });
        });
    }

    addCategory(name, icon) {
        const newCategory = {
            category: name,
            subcategories: []
        };

        this.bookmarks.push(newCategory);
        this.saveData();
        this.renderNavTree();
        this.updateStats();
    }

    addSubcategory(categoryIndex, name, icon) {
        const newSubcategory = {
            name: name,
            icon: icon,
            items: []
        };

        this.bookmarks[categoryIndex].subcategories.push(newSubcategory);
        this.saveData();
        this.renderNavTree();
        this.updateStats();
    }

    addBookmark(categoryIndex, subcategoryIndex, bookmarkData) {
        const newBookmark = {
            title: bookmarkData.title,
            url: bookmarkData.url,
            description: bookmarkData.description || ''
        };

        this.bookmarks[categoryIndex].subcategories[subcategoryIndex].items.push(newBookmark);
        this.saveData();
        this.renderNavTree(); // 更新导航树以显示新的书签计数
        this.updateStats();

        // 如果当前显示的就是这个分类，重新渲染书签列表
        if (this.currentCategory &&
            this.currentCategory.categoryIndex === categoryIndex &&
            this.currentCategory.subcategoryIndex === subcategoryIndex) {
            this.filterBookmarks();
        }
    }

    deleteItem(type, categoryIndex, subcategoryIndex = null, itemIndex = null) {
        if (type === 'category') {
            this.bookmarks.splice(categoryIndex, 1);
        } else if (type === 'subcategory') {
            this.bookmarks[categoryIndex].subcategories.splice(subcategoryIndex, 1);
        } else if (type === 'bookmark') {
            this.bookmarks[categoryIndex].subcategories[subcategoryIndex].items.splice(itemIndex, 1);
        }

        this.saveData();
        this.renderNavTree();
        this.updateStats();

        if (type === 'bookmark' && this.currentCategory) {
            this.filterBookmarks();
        }
    }

    saveData() {
        const dataToSave = this.bookmarks.map(category => ({
            title: category.category,
            icon: 'fas fa-folder',
            subcategories: category.subcategories.map(sub => ({
                title: sub.name,
                icon: sub.icon,
                links: sub.items.map(item => ({
                    title: item.title,
                    url: item.url,
                    description: item.description
                }))
            }))
        }));

        const jsonString = JSON.stringify(dataToSave, null, 2);

        // 只保存到本地存储
        localStorage.setItem('agri_bookmarks', jsonString);

        // 后台静默同步到云端（如果配置了）
        if (this.gistId && this.gistPat) {
            this._silentUpdateGist(jsonString);
        }
    }

    async _silentUpdateGist(content) {
        try {
            await this._updateGist(content);
            console.log('数据已静默同步到云端');
            this.lastSync = new Date().toISOString();
            localStorage.setItem('agri_last_sync', this.lastSync);
        } catch (error) {
            console.error('静默同步失败:', error);
            // 静默失败，不显示任何提示
        }
    }

    showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'toast-error' : ''}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500); // Wait for fade out transition
        }, 3000); // Show for 3 seconds
    }

    async loadData() {
        // 1. Try to load from Gist
        if (this.gistId && this.gistPat) {
            try {
                console.log('尝试从 Gist 加载数据...');
                const gistData = await this._getGist();
                if (gistData) {
                    console.log('从 Gist 加载成功');
                    // Also save to local storage to ensure offline access
                    localStorage.setItem('agri_bookmarks', JSON.stringify(gistData));
                    this.lastSync = new Date().toISOString();
                    localStorage.setItem('agri_last_sync', this.lastSync);
                    return this.convertDataFormat(gistData);
                }
            } catch (error) {
                console.error('从 Gist 加载失败:', error);
                alert('从云端加载数据失败，将尝试使用本地缓存。');
            }
        }

        // 2. Try to load from localStorage
        try {
            const savedData = localStorage.getItem('agri_bookmarks');
            if (savedData) {
                console.log('从 localStorage 加载数据');
                const data = JSON.parse(savedData);
                return this.convertDataFormat(data);
            }
        } catch (error) {
            console.warn('从 localStorage 加载数据失败:', error);
        }

        // 3. Fallback to local JSON file
        console.log('从本地 bookmarks.json 文件加载数据');
        return this.loadBookmarksFromFile();
    }

    async _getGist() {
        if (!this.gistId || !this.gistPat) return null;

        const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
            headers: {
                'Authorization': `token ${this.gistPat}`,
                'Accept': 'application/vnd.github.v3+json',
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API 错误: ${response.status} ${response.statusText}`);
        }

        const gist = await response.json();
        const filename = 'bookmarks.json';
        if (gist.files && gist.files[filename]) {
            const content = gist.files[filename].content;
            return JSON.parse(content);
        }
        return null; // File not found in Gist
    }

    async _updateGist(content) {
        if (!this.gistId || !this.gistPat) return;

        const filename = 'bookmarks.json';
        const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${this.gistPat}`,
                'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
                files: {
                    [filename]: {
                        content: content,
                    },
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`GitHub API 错误: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }

    async loadBookmarksFromFile() {
        try {
            const response = await fetch('./data/bookmarks.json');
            const data = await response.json();
            return this.convertDataFormat(data);
        } catch (error) {
            console.error('加载JSON文件失败:', error);
            return this.getBookmarksData();
        }
    }

    convertDataFormat(data) {
        return data.map(category => ({
            category: category.title,
            subcategories: category.subcategories.map(sub => ({
                name: sub.title,
                icon: sub.icon,
                items: sub.links.map(link => ({
                    title: link.title,
                    url: link.url,
                    description: link.description
                }))
            }))
        }));
    }

    showImportModal() {
        const modalContent = `
            <div class="form-group">
                <label for="importFile">选择JSON文件</label>
                <input type="file" id="importFile" accept=".json" required>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="overwriteData"> 覆盖现有数据（不选择则合并数据）
                </label>
            </div>
            <div class="form-group">
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    ⚠️ 导入前建议先导出当前数据作为备份
                </p>
            </div>
        `;

        this.modalManager.show('导入数据', modalContent, () => {
            const fileInput = document.getElementById('importFile');
            const overwrite = document.getElementById('overwriteData').checked;

            if (!fileInput.files[0]) {
                alert('请选择文件');
                return false;
            }

            this.importData(fileInput.files[0], overwrite);
            return true;
        });
    }

    async importData(file, overwrite = false) {
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);

            // 验证数据格式
            if (!Array.isArray(importedData)) {
                alert('文件格式错误：数据应该是数组格式');
                return;
            }

            const convertedData = this.convertDataFormat(importedData);

            if (overwrite) {
                this.bookmarks = convertedData;
            } else {
                // 合并数据
                this.bookmarks = [...this.bookmarks, ...convertedData];
            }

            this.saveData();
            this.renderNavTree();
            this.updateStats();

            alert(`导入成功！共导入 ${convertedData.length} 个分类`);

        } catch (error) {
            console.error('导入失败:', error);
            alert('导入失败：文件格式错误或数据损坏');
        }
    }

    exportData() {
        try {
            // 转换为标准格式
            const dataToExport = this.bookmarks.map(category => ({
                title: category.category,
                icon: 'fas fa-folder',
                subcategories: category.subcategories.map(sub => ({
                    title: sub.name,
                    icon: sub.icon,
                    links: sub.items.map(item => ({
                        title: item.title,
                        url: item.url,
                        description: item.description
                    }))
                }))
            }));

            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `agriculture-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // 显示导出统计
            const totalBookmarks = dataToExport.reduce((sum, category) =>
                sum + category.subcategories.reduce((subSum, sub) => subSum + sub.links.length, 0), 0
            );

            alert(`导出成功！\n- 分类数: ${dataToExport.length}\n- 总书签数: ${totalBookmarks}`);

        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败：' + error.message);
        }
    }

    // ==================== 编辑功能 ====================

    showEditCategoryModal(categoryIndex) {
        const category = this.bookmarks[categoryIndex];
        const modalContent = `
            <div class="form-group">
                <label for="editCategoryName">分类名称</label>
                <input type="text" id="editCategoryName" value="${category.category}" required>
            </div>
        `;

        this.modalManager.show('编辑主分类', modalContent, () => {
            const name = document.getElementById('editCategoryName').value.trim();

            if (!name) {
                alert('请输入分类名称');
                return false;
            }

            this.updateCategory(categoryIndex, name);
            return true;
        });
    }

    showEditSubcategoryModal(categoryIndex, subcategoryIndex) {
        const category = this.bookmarks[categoryIndex];
        const subcategory = category.subcategories[subcategoryIndex];

        const modalContent = `
            <div class="form-group">
                <label>所属主分类</label>
                <input type="text" value="${category.category}" readonly style="background: var(--bg-secondary);">
            </div>
            <div class="form-group">
                <label for="editSubcategoryName">子分类名称</label>
                <input type="text" id="editSubcategoryName" value="${subcategory.name}" required>
            </div>
            <div class="form-group">
                <label for="editSubcategoryIcon">选择图标</label>
                <div class="icon-selector" id="editSubcategoryIconSelector">
                    ${this.generateIconOptions()}
                </div>
                <input type="hidden" id="editSelectedIcon" value="${subcategory.icon}">
            </div>
        `;

        this.modalManager.show('编辑子分类', modalContent, () => {
            const name = document.getElementById('editSubcategoryName').value.trim();
            const icon = document.getElementById('editSelectedIcon').value;

            if (!name) {
                alert('请输入子分类名称');
                return false;
            }

            this.updateSubcategory(categoryIndex, subcategoryIndex, name, icon);
            return true;
        });

        this.setupIconSelector('editSubcategoryIconSelector', 'editSelectedIcon');
    }

    showEditBookmarkModal(categoryIndex, subcategoryIndex, itemIndex) {
        const bookmark = this.bookmarks[categoryIndex].subcategories[subcategoryIndex].items[itemIndex];

        const categoryOptions = this.bookmarks.map((cat, idx) =>
            `<option value="${idx}" ${idx === categoryIndex ? 'selected' : ''}>${cat.category}</option>`
        ).join('');

        const subcategoryOptions = this.bookmarks[categoryIndex].subcategories.map((sub, idx) =>
            `<option value="${idx}" ${idx === subcategoryIndex ? 'selected' : ''}>${sub.name}</option>`
        ).join('');

        const modalContent = `
            <div class="form-group">
                <label for="targetCategory">主分类</label>
                <select id="targetCategory">${categoryOptions}<option value="new">+ 创建新主分类</option></select>
            </div>
            <div class="form-group" id="newCategoryGroup" style="display: none;">
                <label for="newCategoryName">新主分类名称</label>
                <input type="text" id="newCategoryName" placeholder="请输入新主分类名称">
            </div>
            <div class="form-group">
                <label for="targetSubcategory">子分类</label>
                <select id="targetSubcategory">${subcategoryOptions}<option value="new">+ 创建新子分类</option></select>
            </div>
            <div class="form-group" id="newSubcategoryGroup" style="display: none;">
                <label for="newSubcategoryName">新子分类名称</label>
                <input type="text" id="newSubcategoryName" placeholder="请输入新子分类名称">
                <div style="margin-top: 0.5rem;">
                    <label>选择图标</label>
                    <div class="icon-selector" id="newSubcategoryIconSelector">${this.generateIconOptions()}</div>
                    <input type="hidden" id="newSelectedIcon" value="fas fa-folder-open">
                </div>
            </div>
            <hr>
            <div class="form-group">
                <label for="editBookmarkTitle">书签标题</label>
                <input type="text" id="editBookmarkTitle" value="${bookmark.title}" required>
            </div>
            <div class="form-group">
                <label for="editBookmarkUrl">网址</label>
                <input type="url" id="editBookmarkUrl" value="${bookmark.url}" required>
            </div>
            <div class="form-group">
                <label for="editBookmarkDescription">描述（可选）</label>
                <textarea id="editBookmarkDescription">${bookmark.description || ''}</textarea>
            </div>
        `;

        this.modalManager.show('编辑书签', modalContent, () => {
            let newCatIndexValue = document.getElementById('targetCategory').value;
            let newSubIndexValue = document.getElementById('targetSubcategory').value;

            if (newCatIndexValue === 'new') {
                const newCatName = document.getElementById('newCategoryName').value.trim();
                if (!newCatName) { alert('请输入新主分类名称'); return false; }
                this.addCategory(newCatName, 'fas fa-folder');
                newCatIndexValue = this.bookmarks.length - 1;
            }
            
            let newCatIndex = parseInt(newCatIndexValue);

            if (newSubIndexValue === 'new') {
                const newSubName = document.getElementById('newSubcategoryName').value.trim();
                const newSubIcon = document.getElementById('newSelectedIcon').value;
                if (!newSubName) { alert('请输入新子分类名称'); return false; }
                this.addSubcategory(newCatIndex, newSubName, newSubIcon);
                newSubIndexValue = this.bookmarks[newCatIndex].subcategories.length - 1;
            }

            let newSubIndex = parseInt(newSubIndexValue);

            if (isNaN(newCatIndex) || isNaN(newSubIndex)) {
                alert('请选择一个有效的分类和子分类');
                return false;
            }

            const title = document.getElementById('editBookmarkTitle').value.trim();
            const url = document.getElementById('editBookmarkUrl').value.trim();
            const description = document.getElementById('editBookmarkDescription').value.trim();

            if (!title || !url) {
                alert('请填写标题和网址');
                return false;
            }

            const bookmarkData = { title, url, description };

            if (newCatIndex === categoryIndex && newSubIndex === subcategoryIndex) {
                this.updateBookmark(categoryIndex, subcategoryIndex, itemIndex, bookmarkData);
            } else {
                const [movedBookmark] = this.bookmarks[categoryIndex].subcategories[subcategoryIndex].items.splice(itemIndex, 1);
                movedBookmark.title = title;
                movedBookmark.url = url;
                movedBookmark.description = description;
                this.bookmarks[newCatIndex].subcategories[newSubIndex].items.push(movedBookmark);
                this.saveData();
                this.renderNavTree();
                this.updateStats();
                this.filterBookmarks();
            }
            return true;
        });

        setTimeout(() => {
            const catSelect = document.getElementById('targetCategory');
            const subSelect = document.getElementById('targetSubcategory');
            const newCatGroup = document.getElementById('newCategoryGroup');
            const newSubGroup = document.getElementById('newSubcategoryGroup');

            const updateSubcategories = () => {
                const selectedCatIndex = catSelect.value;
                newSubGroup.style.display = 'none';
                if (selectedCatIndex === 'new' || selectedCatIndex === '') {
                    newCatGroup.style.display = selectedCatIndex === 'new' ? 'block' : 'none';
                    subSelect.innerHTML = '<option value="">请先选择主分类</option><option value="new">+ 创建新子分类</option>';
                    if(selectedCatIndex === 'new') {
                        subSelect.value = 'new';
                        subSelect.dispatchEvent(new Event('change'));
                    }
                } else {
                    newCatGroup.style.display = 'none';
                    const newSubOptions = this.bookmarks[selectedCatIndex].subcategories.map((sub, idx) => `<option value="${idx}">${sub.name}</option>`).join('');
                    subSelect.innerHTML = newSubOptions + '<option value="new">+ 创建新子分类</option>';
                }
            };

            catSelect.addEventListener('change', updateSubcategories);
            subSelect.addEventListener('change', () => {
                if (subSelect.value === 'new') {
                    newSubGroup.style.display = 'block';
                    this.setupIconSelector('newSubcategoryIconSelector', 'newSelectedIcon');
                } else {
                    newSubGroup.style.display = 'none';
                }
            });
        }, 100);
    }

    updateCategory(categoryIndex, newName) {
        this.bookmarks[categoryIndex].category = newName;
        this.saveData();
        this.renderNavTree();
        this.updateStats();

        // 如果当前显示的是这个分类，更新标题
        if (this.currentCategory && this.currentCategory.categoryIndex === categoryIndex) {
            this.filterBookmarks();
        }
    }

    updateSubcategory(categoryIndex, subcategoryIndex, newName, newIcon) {
        const subcategory = this.bookmarks[categoryIndex].subcategories[subcategoryIndex];
        subcategory.name = newName;
        subcategory.icon = newIcon;

        this.saveData();
        this.renderNavTree();
        this.updateStats();

        // 如果当前显示的是这个子分类，更新标题
        if (this.currentCategory &&
            this.currentCategory.categoryIndex === categoryIndex &&
            this.currentCategory.subcategoryIndex === subcategoryIndex) {
            this.filterBookmarks();
        }
    }

    updateBookmark(categoryIndex, subcategoryIndex, itemIndex, bookmarkData) {
        const bookmark = this.bookmarks[categoryIndex].subcategories[subcategoryIndex].items[itemIndex];
        bookmark.title = bookmarkData.title;
        bookmark.url = bookmarkData.url;
        bookmark.description = bookmarkData.description;

        this.saveData();
        this.updateStats();

        // 如果当前显示的是这个分类，重新渲染书签
        if (this.currentCategory &&
            this.currentCategory.categoryIndex === categoryIndex &&
            this.currentCategory.subcategoryIndex === subcategoryIndex) {
            this.filterBookmarks();
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 恢复主题设置
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // 初始化应用
    new NavigationApp();
});

// ==================== 支持类 ====================

// 模态对话框管理器
class ModalManager {
    constructor() {
        this.modal = document.getElementById('modalOverlay');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalBody = document.getElementById('modalBody');
        this.modalConfirm = document.getElementById('modalConfirm');
        this.modalCancel = document.getElementById('modalCancel');
        this.modalClose = document.getElementById('modalClose');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // 关闭按钮
        this.modalClose.addEventListener('click', () => {
            this.hide();
        });

        // 取消按钮
        this.modalCancel.addEventListener('click', () => {
            this.hide();
        });

        // 点击遮罩关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.hide();
            }
        });
    }

    show(title, content, onConfirm = null) {
        this.modalTitle.textContent = title;
        this.modalBody.innerHTML = content;
        this.modal.classList.add('show');

        // 设置确认回调
        this.modalConfirm.onclick = () => {
            if (onConfirm) {
                const result = onConfirm();
                if (result !== false) {
                    this.hide();
                }
            } else {
                this.hide();
            }
        };

        // 聚焦到第一个输入框
        setTimeout(() => {
            const firstInput = this.modalBody.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    hide() {
        this.modal.classList.remove('show');
    }
}

// 右键菜单管理器
class ContextMenuManager {
    constructor(app) {
        this.app = app;
        this.menu = document.getElementById('contextMenu');
        this.currentTarget = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 点击其他地方关闭菜单
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target)) {
                this.hide();
            }
        });

        // 菜单项点击事件
        this.menu.addEventListener('click', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (item) {
                const action = item.dataset.action;
                this.handleAction(action);
                this.hide();
            }
        });
    }

    show(x, y, target, type, categoryIndex = null, subcategoryIndex = null, itemIndex = null) {
        this.currentTarget = { target, type, categoryIndex, subcategoryIndex, itemIndex };

        // 更新菜单项
        this.updateMenuItems(type);

        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;
        this.menu.classList.add('show');

        // 确保菜单不会超出屏幕
        setTimeout(() => {
            const rect = this.menu.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            if (rect.right > windowWidth) {
                this.menu.style.left = `${windowWidth - rect.width - 10}px`;
            }

            if (rect.bottom > windowHeight) {
                this.menu.style.top = `${windowHeight - rect.height - 10}px`;
            }
        }, 0);
    }

    hide() {
        this.menu.classList.remove('show');
        this.currentTarget = null;
    }

    updateMenuItems(type) {
        let menuHTML = '';

        if (type === 'category') {
            menuHTML = `
                <div class="context-menu-item" data-action="add-subcategory">
                    <i class="fas fa-plus"></i> 添加子分类
                </div>
                <div class="context-menu-item" data-action="edit">
                    <i class="fas fa-edit"></i> 编辑
                </div>
                <div class="context-menu-item" data-action="delete">
                    <i class="fas fa-trash"></i> 删除
                </div>
            `;
        } else if (type === 'subcategory') {
            menuHTML = `
                <div class="context-menu-item" data-action="edit">
                    <i class="fas fa-edit"></i> 编辑
                </div>
                <div class="context-menu-item" data-action="delete">
                    <i class="fas fa-trash"></i> 删除
                </div>
            `;
        } else if (type === 'bookmark') {
            menuHTML = `
                <div class="context-menu-item" data-action="edit">
                    <i class="fas fa-edit"></i> 编辑
                </div>
                <div class="context-menu-item" data-action="delete">
                    <i class="fas fa-trash"></i> 删除
                </div>
            `;
        }

        this.menu.innerHTML = menuHTML;
    }

    handleAction(action) {
        const { type, categoryIndex, subcategoryIndex, itemIndex } = this.currentTarget;

        switch (action) {
            case 'add-subcategory':
                if (type === 'category') {
                    this.app.showAddSubcategoryModal(categoryIndex);
                }
                break;

            case 'edit':
                this.handleEdit(type, categoryIndex, subcategoryIndex, itemIndex);
                break;

            case 'delete':
                this.handleDelete(type, categoryIndex, subcategoryIndex, itemIndex);
                break;
        }
    }

    handleEdit(type, categoryIndex, subcategoryIndex, itemIndex) {
        if (type === 'category') {
            this.app.showEditCategoryModal(categoryIndex);
        } else if (type === 'subcategory') {
            this.app.showEditSubcategoryModal(categoryIndex, subcategoryIndex);
        } else if (type === 'bookmark') {
            this.app.showEditBookmarkModal(categoryIndex, subcategoryIndex, itemIndex);
        }
    }

    handleDelete(type, categoryIndex, subcategoryIndex, itemIndex) {
        const confirmMessage = this.getDeleteConfirmMessage(type, categoryIndex, subcategoryIndex, itemIndex);

        if (confirm(confirmMessage)) {
            this.app.deleteItem(type, categoryIndex, subcategoryIndex, itemIndex);
        }
    }

    getDeleteConfirmMessage(type, categoryIndex, subcategoryIndex, itemIndex) {
        if (type === 'category') {
            const category = this.app.bookmarks[categoryIndex];
            return `确定要删除分类"${category.category}"吗？这将删除该分类下的所有子分类和书签！`;
        } else if (type === 'subcategory') {
            const category = this.app.bookmarks[categoryIndex];
            const subcategory = category.subcategories[subcategoryIndex];
            return `确定要删除子分类"${subcategory.name}"吗？这将删除该子分类下的所有书签！`;
        } else if (type === 'bookmark') {
            const bookmark = this.app.bookmarks[categoryIndex].subcategories[subcategoryIndex].items[itemIndex];
            return `确定要删除书签"${bookmark.title}"吗？`;
        }

        return '确定要删除吗？';
    }
}

