# cache-api

`cache-api` 是为了方便 api 接口数据缓存，当服务器停止或调试时，可使用缓存 api 进行数据渲染。

运行环境： `node`

### 目录
  * [安装](#安装)
  * [数据](#数据)
  * [原理](#原理)
  * [使用](#使用)
  * [License](#license)

### 安装

下载本源码，安装依赖并运行：

```sh
npm install
npm start
```

使用 `vscode` 可进行代码调试。

### 数据

使用 [Sqlite3](https://www.sqlite.org) 实现数据本地存储。

- 数据库及表实现： `db/init_db.sql`
- 数据初始化： `db/init_data.sql`

### 原理

核心思想是利用 `nodejs` 作为服务，通过代理转发进行接口数据请求（此处使用 `http-proxy` 库，可根据需要进行修改），请求成功后将数据返回客户端的同时，将数据副本存储到数据库中，下次访问同样的接口地址和同样的请求数据时，对比数据库中已缓存的数据，如果存在，则直接取数据库中的数据返回。

### 使用

运行成功后，浏览器访问 <http://localhost:8003> ，数据库默认初始化一条数据，可将默认数据删除或修改，设置为要代理的服务器地址，多个代理服务同时只能启用一个，不同代理服务数据分开存储。

配置好后，客户端设置代理地址为 <http://localhost:8003> 即可实现代理，并进行数据缓存，当重复访问相同的接口地址时，可发现代理服务不会再请求服务器接口，即实现接口数据本地缓存。

**[返回顶部](#目录)**

### License

>The MIT License (MIT)
>
>Copyright (c) 2010 - 2016 Charlie Robbins, Jarrett Cruger & the Contributors.
>
>Permission is hereby granted, free of charge, to any person obtaining a copy
>of this software and associated documentation files (the "Software"), to deal
>in the Software without restriction, including without limitation the rights
>to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
>copies of the Software, and to permit persons to whom the Software is
>furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in
>all copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
>IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
>FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
>AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
>LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
>OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
>THE SOFTWARE.
