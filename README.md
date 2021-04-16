## 基于 Vs code 的代码风格配置

    * 安装vscode 插件 prettier
    * vscode 配置：Settings - Text Editor - Formating - Format On Save - 勾选

## 基于 webstorm 的代码风格配置

    * 安装全局的 prettier  npm install -g prettier
    * 打开设置搜索 prettier  设置 node 及 prettier的路径
    * 录制 macros - save and reformat width prettier - 设置该macros的快捷键为 ctrl+s

## Mock Data 插件的引入
    * 样例在coming-soon console.log()

## 发布命令

 ``` bash
 ng build --prod --base-href /Pages/NewSY/
 ```
 
 ## 公用服务说明
 
  服务目录: src/app/shared/service
  
### dialog-common.service.ts

> 公用的弹出层服务,页面所有的弹出层都应该使用该服务创建,保持统一
