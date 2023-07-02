-- 数据库初始化

-- https://www.sqlite.org/datatype3.html#expraff
-- proxy_list 代理列表
CREATE TABLE IF NOT EXISTS proxy_list(
    -- id
    id VARCHAR(36) NOT NULL,
    -- 名称
    name VARCHAR(100) NOT NULL,
    -- 代理地址
    url VARCHAR(200) NOT NULL,
    -- 状态
    status SMALLINT NOT NULL DEFAULT 0,
    -- 删除状态
    is_deleted SMALLINT NOT NULL DEFAULT 0,
    -- 创建时间，UTC标准时间
    ctime BIGINT NOT NULL DEFAULT(STRFTIME('%s','now')*1000)
);

-- proxy_cache 缓存列表
CREATE TABLE IF NOT EXISTS proxy_cache(
    -- id
    id VARCHAR(36) NOT NULL,
    -- proxy_list的id
    pid VARCHAR(100) NOT NULL,
    -- 代理地址
    url VARCHAR(2000) NOT NULL,
    -- 请求头
    requestHeader VARCHAR(2000),
    -- post请求数据
    requestData VARCHAR(2000),
    -- 响应头
    responseHeader VARCHAR(2000),
    -- 响应数据
    responseData TEXT,
    -- 状态：0-正常，1-报错
    status SMALLINT NOT NULL DEFAULT 0,
    -- 创建时间，UTC标准时间
    ctime BIGINT NOT NULL DEFAULT(STRFTIME('%s','now')*1000)
);
