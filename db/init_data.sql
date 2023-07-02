-- 数据初始化

-- proxy_list 代理列表
INSERT OR IGNORE INTO proxy_list(id, name, url) SELECT 'neCs3tUhlNzF3zuc8nXki', 'test', 'https://api.com' WHERE NOT EXISTS(SELECT 1 FROM proxy_list WHERE id='neCs3tUhlNzF3zuc8nXki');

